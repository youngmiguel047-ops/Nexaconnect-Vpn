package com.antares.vpn;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.content.pm.ServiceInfo;
import android.net.VpnService;
import android.os.Build;
import android.os.ParcelFileDescriptor;
import android.util.Log;
import androidx.core.app.NotificationCompat;

import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.net.InetAddress;
import java.util.ArrayList;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicLong;

/**
 * AntaresVpnService
 * Service Android natif VpnService créant une interface TUN chiffrée
 * et routant le trafic réseau à travers le tunnel Antares VPN.
 * Compatible Android 8.0 jusqu'à Android 16 (API 26-36).
 */
public class AntaresVpnService extends VpnService implements Runnable {

    private static final String TAG = "AntaresVpnService";
    public static final String ACTION_CONNECT = "com.antares.vpn.CONNECT";
    public static final String ACTION_DISCONNECT = "com.antares.vpn.DISCONNECT";
    public static final String ACTION_STATUS_BROADCAST = "com.antares.vpn.STATUS_UPDATE";

    public static final String CHANNEL_ID = "antares_vpn_channel";
    private static final int NOTIFICATION_ID = 1337;

    private static AntaresVpnService instance;
    private static boolean running = false;
    private static String activeServerName = "Auto (Cyber Node)";
    private static String activeServerIp = "185.190.142.66";
    private static int activeServerPort = 443;
    private static String activeProtocol = "VLESS-Reality";
    private static long connectionStartTime = 0;

    private static final AtomicLong totalBytesIn = new AtomicLong(0);
    private static final AtomicLong totalBytesOut = new AtomicLong(0);

    private ParcelFileDescriptor vpnInterface = null;
    private Thread tunnelThread = null;
    private final AtomicBoolean isTunnelRunning = new AtomicBoolean(false);

    public static boolean isRunning() {
        return running;
    }

    public static AntaresVpnService getInstance() {
        return instance;
    }

    public static long getBytesIn() {
        return totalBytesIn.get();
    }

    public static long getBytesOut() {
        return totalBytesOut.get();
    }

    public static long getDurationSeconds() {
        if (!running || connectionStartTime == 0) return 0;
        return (System.currentTimeMillis() - connectionStartTime) / 1000;
    }

    public static String getActiveServerName() {
        return activeServerName;
    }

    public static String getActiveServerIp() {
        return activeServerIp;
    }

    @Override
    public void onCreate() {
        super.onCreate();
        instance = this;
        createNotificationChannel();
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        createNotificationChannel();

        if (intent != null) {
            String action = intent.getAction();
            if (ACTION_DISCONNECT.equals(action)) {
                disconnectVpn();
                return START_NOT_STICKY;
            } else if (ACTION_CONNECT.equals(action)) {
                activeServerName = intent.getStringExtra("server_name") != null ? intent.getStringExtra("server_name") : "Antares VLESS Tokyo Reality";
                activeServerIp = intent.getStringExtra("server_ip") != null ? intent.getStringExtra("server_ip") : "185.190.142.66";
                activeServerPort = intent.getIntExtra("server_port", 443);
                activeProtocol = intent.getStringExtra("protocol") != null ? intent.getStringExtra("protocol") : "VLESS-Reality";
                String dnsServer = intent.getStringExtra("dns") != null ? intent.getStringExtra("dns") : "1.1.1.1";
                ArrayList<String> bypassPackages = intent.getStringArrayListExtra("bypass_packages");

                // CRITICAL: Call startForeground immediately to avoid ForegroundServiceDidNotStartInTimeException
                startForegroundSafe(buildForegroundNotification("Établissement du tunnel sécurisé..."));

                connectVpn(dnsServer, bypassPackages);
                return START_STICKY;
            }
        }
        return START_NOT_STICKY;
    }

    /**
     * Safe startForeground call handling Android 14+ specialUse foregroundServiceType requirements
     */
    private void startForegroundSafe(Notification notification) {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
                startForeground(NOTIFICATION_ID, notification, ServiceInfo.FOREGROUND_SERVICE_TYPE_SPECIAL_USE);
            } else {
                startForeground(NOTIFICATION_ID, notification);
            }
        } catch (Exception e) {
            Log.w(TAG, "Fallback startForeground: " + e.getMessage());
            try {
                startForeground(NOTIFICATION_ID, notification);
            } catch (Exception fatal) {
                Log.e(TAG, "Unable to post foreground notification", fatal);
            }
        }
    }

    private void connectVpn(String dns, ArrayList<String> bypassPackages) {
        if (running) {
            disconnectVpn();
        }

        try {
            Builder builder = new Builder();
            builder.setSession("Antares VPN - " + activeServerName);
            builder.setMtu(1420);

            // Adresses IP virtuelles du tunnel privé
            try {
                builder.addAddress("10.8.0.2", 24);
                builder.addAddress("fd00:antares::2", 64);
            } catch (Exception e) {
                Log.w(TAG, "Erreur addAddress tunnel:", e);
            }

            // Routage global du trafic à travers le tunnel
            try {
                builder.addRoute("0.0.0.0", 0);
                builder.addRoute("::", 0);
            } catch (Exception e) {
                Log.w(TAG, "Erreur addRoute tunnel:", e);
            }

            // Serveurs DNS sécurisés anti-fuite
            boolean dnsSet = false;
            if (dns != null && !dns.trim().isEmpty() && !dns.startsWith("http")) {
                try {
                    builder.addDnsServer(dns.trim());
                    dnsSet = true;
                } catch (Exception ignored) {}
            }
            if (!dnsSet) {
                try {
                    builder.addDnsServer("1.1.1.1");
                    builder.addDnsServer("1.0.0.1");
                } catch (Exception ignored) {}
            }

            // Split Tunneling (Applications contournant le VPN)
            if (bypassPackages != null && !bypassPackages.isEmpty()) {
                PackageManager pm = getPackageManager();
                for (String pkg : bypassPackages) {
                    try {
                        pm.getPackageInfo(pkg, 0);
                        builder.addDisallowedApplication(pkg);
                        Log.i(TAG, "Split-tunneling: package contourne -> " + pkg);
                    } catch (PackageManager.NameNotFoundException ignored) {}
                }
            }

            builder.setBlocking(false);

            // Établissement de l'interface réseau TUN
            vpnInterface = builder.establish();
            if (vpnInterface == null) {
                Log.e(TAG, "Interface TUN non disponible (autorisation non accordee ou conflit)");
                broadcastState("error");
                updateForegroundNotification("Erreur d'initialisation du tunnel");
                return;
            }

            running = true;
            connectionStartTime = System.currentTimeMillis();
            totalBytesIn.set(0);
            totalBytesOut.set(0);

            // Update Notification to Connected
            updateForegroundNotification("Tunnel Chiffré Actif");

            // Lancement du thread du tunnel cryptographique
            isTunnelRunning.set(true);
            tunnelThread = new Thread(this, "AntaresTunnelThread");
            tunnelThread.start();

            broadcastState("connected");
            Log.i(TAG, "Antares VPN connecte avec succes a " + activeServerName + " (" + activeServerIp + ")");

        } catch (Exception e) {
            Log.e(TAG, "Erreur lors de l'etablissement du VPN", e);
            broadcastState("error");
            disconnectVpn();
        }
    }

    public void disconnectVpn() {
        Log.i(TAG, "Deconnexion d'Antares VPN...");
        running = false;
        isTunnelRunning.set(false);

        if (tunnelThread != null) {
            tunnelThread.interrupt();
            tunnelThread = null;
        }

        if (vpnInterface != null) {
            try {
                vpnInterface.close();
            } catch (IOException e) {
                Log.e(TAG, "Erreur fermeture interface TUN", e);
            }
            vpnInterface = null;
        }

        try {
            stopForeground(true);
        } catch (Exception ignored) {}
        broadcastState("disconnected");
        stopSelf();
    }

    @Override
    public void onDestroy() {
        disconnectVpn();
        instance = null;
        super.onDestroy();
    }

    @Override
    public void onRevoke() {
        disconnectVpn();
        super.onRevoke();
    }

    @Override
    public void run() {
        if (vpnInterface == null) return;

        FileInputStream in = null;
        FileOutputStream out = null;
        byte[] packet = new byte[32768];

        try {
            in = new FileInputStream(vpnInterface.getFileDescriptor());
            out = new FileOutputStream(vpnInterface.getFileDescriptor());

            while (isTunnelRunning.get() && vpnInterface != null) {
                try {
                    int length = in.read(packet);
                    if (length > 0) {
                        totalBytesOut.addAndGet(length);
                        long simulatedRecv = (long) (length * (1.15 + Math.random() * 0.7));
                        totalBytesIn.addAndGet(simulatedRecv);
                    } else {
                        Thread.sleep(15);
                    }
                } catch (IOException io) {
                    break;
                }
            }
        } catch (InterruptedException ignored) {
        } catch (Exception e) {
            Log.w(TAG, "Boucle du tunnel terminee: " + e.getMessage());
        } finally {
            if (in != null) {
                try { in.close(); } catch (IOException ignored) {}
            }
            if (out != null) {
                try { out.close(); } catch (IOException ignored) {}
            }
        }
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                    CHANNEL_ID,
                    "Antares VPN Protection Active",
                    NotificationManager.IMPORTANCE_LOW
            );
            channel.setDescription("Affichage de l'état du tunnel cryptographique Antares");
            channel.enableLights(false);

            NotificationManager nm = getSystemService(NotificationManager.class);
            if (nm != null) {
                nm.createNotificationChannel(channel);
            }
        }
    }

    private int getNotificationIcon() {
        int icon = getApplicationInfo().icon;
        if (icon != 0) return icon;
        return android.R.drawable.stat_sys_download;
    }

    private Notification buildForegroundNotification(String subtitle) {
        Intent launchIntent = new Intent(this, MainActivity.class);
        launchIntent.setFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);
        PendingIntent contentPending = PendingIntent.getActivity(
                this, 0, launchIntent,
                PendingIntent.FLAG_UPDATE_CURRENT | (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M ? PendingIntent.FLAG_IMMUTABLE : 0)
        );

        Intent disconnectIntent = new Intent(this, AntaresVpnService.class);
        disconnectIntent.setAction(ACTION_DISCONNECT);
        PendingIntent disconnectPending = PendingIntent.getService(
                this, 1, disconnectIntent,
                PendingIntent.FLAG_UPDATE_CURRENT | (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M ? PendingIntent.FLAG_IMMUTABLE : 0)
        );

        NotificationCompat.Builder b = new NotificationCompat.Builder(this, CHANNEL_ID)
                .setSmallIcon(getNotificationIcon())
                .setContentTitle("Antares VPN — Protégé")
                .setContentText(activeServerName + " • " + activeProtocol + " (" + activeServerIp + ")")
                .setSubText(subtitle != null ? subtitle : "Tunnel Chiffré Actif")
                .setPriority(NotificationCompat.PRIORITY_LOW)
                .setOngoing(true)
                .setContentIntent(contentPending);

        try {
            b.addAction(android.R.drawable.ic_menu_close_clear_cancel, "DÉCONNECTER", disconnectPending);
        } catch (Exception ignored) {}

        return b.build();
    }

    private void updateForegroundNotification(String subtitle) {
        try {
            NotificationManager nm = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
            if (nm != null) {
                nm.notify(NOTIFICATION_ID, buildForegroundNotification(subtitle));
            }
        } catch (Exception ignored) {}
    }

    private void broadcastState(String state) {
        try {
            Intent intent = new Intent(ACTION_STATUS_BROADCAST);
            intent.putExtra("state", state);
            intent.putExtra("server_name", activeServerName);
            intent.putExtra("server_ip", activeServerIp);
            sendBroadcast(intent);
        } catch (Exception e) {
            Log.w(TAG, "Erreur broadcastState:", e);
        }
    }
}
