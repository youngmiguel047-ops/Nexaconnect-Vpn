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

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

/**
 * AntaresVpnService
 * Service Android natif VpnService orchestrant le moteur VlessTunnelEngine,
 * créant l'interface TUN et publiant l'état réel et la télémétrie réseau.
 */
public class AntaresVpnService extends VpnService {

    private static final String TAG = "AntaresVpnService";
    public static final String ACTION_CONNECT = "com.antares.vpn.CONNECT";
    public static final String ACTION_DISCONNECT = "com.antares.vpn.DISCONNECT";
    public static final String ACTION_STATUS_BROADCAST = "com.antares.vpn.STATUS_UPDATE";

    public static final String CHANNEL_ID = "antares_vpn_channel";
    private static final int NOTIFICATION_ID = 1337;

    private static AntaresVpnService instance;
    private static VlessTunnelEngine engineInstance;

    private static String activeServerName = "Auto (Cyber Node)";
    private static String activeServerIp = "185.190.142.66";
    private static int activeServerPort = 443;
    private static String activeProtocol = "VLESS";

    private ParcelFileDescriptor vpnInterface = null;

    public static AntaresVpnService getInstance() {
        return instance;
    }

    public static boolean isRunning() {
        return engineInstance != null && engineInstance.isRunning();
    }

    public static String getCurrentEngineState() {
        return engineInstance != null ? engineInstance.getCurrentState() : "DISCONNECTED";
    }

    public static long getBytesIn() {
        return engineInstance != null ? engineInstance.getBytesIn() : 0;
    }

    public static long getBytesOut() {
        return engineInstance != null ? engineInstance.getBytesOut() : 0;
    }

    public static long getPacketsIn() {
        return engineInstance != null ? engineInstance.getPacketsIn() : 0;
    }

    public static long getPacketsOut() {
        return engineInstance != null ? engineInstance.getPacketsOut() : 0;
    }

    public static long getPacketsReturned() {
        return engineInstance != null ? engineInstance.getPacketsReturned() : 0;
    }

    public static long getDurationSeconds() {
        return engineInstance != null ? engineInstance.getDurationSeconds() : 0;
    }

    public static String getActiveServerName() {
        return activeServerName;
    }

    public static String getActiveServerIp() {
        return activeServerIp;
    }

    public static int getActiveServerPort() {
        return activeServerPort;
    }

    public static String getLastErrorMessage() {
        return engineInstance != null ? engineInstance.getLastErrorMessage() : "";
    }

    public static List<String> getDiagnosticLogs() {
        return engineInstance != null ? engineInstance.getDiagnosticLogs() : new ArrayList<>();
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
                activeServerName = intent.getStringExtra("server_name") != null ? intent.getStringExtra("server_name") : "VLESS Server";
                activeServerIp = intent.getStringExtra("server_ip") != null ? intent.getStringExtra("server_ip") : "185.190.142.66";
                activeServerPort = intent.getIntExtra("server_port", 443);
                activeProtocol = intent.getStringExtra("protocol") != null ? intent.getStringExtra("protocol") : "VLESS";
                String dnsServer = intent.getStringExtra("dns") != null ? intent.getStringExtra("dns") : "1.1.1.1";
                String uuid = intent.getStringExtra("uuid");
                String transport = intent.getStringExtra("transport");
                String wsPath = intent.getStringExtra("ws_path");
                String wsHost = intent.getStringExtra("ws_host");
                String sni = intent.getStringExtra("sni");
                ArrayList<String> bypassPackages = intent.getStringArrayListExtra("bypass_packages");

                // Démarrage immédiat en premier plan
                startForegroundSafe(buildForegroundNotification("Initialisation de la connexion VLESS..."));

                connectVpn(
                        activeServerName,
                        activeServerIp,
                        activeServerPort,
                        activeProtocol,
                        dnsServer,
                        uuid,
                        transport,
                        wsPath,
                        wsHost,
                        sni,
                        bypassPackages
                );
                return START_STICKY;
            }
        }
        return START_NOT_STICKY;
    }

    private void startForegroundSafe(Notification notification) {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
                startForeground(NOTIFICATION_ID, notification, ServiceInfo.FOREGROUND_SERVICE_TYPE_SPECIAL_USE);
            } else {
                startForeground(NOTIFICATION_ID, notification);
            }
        } catch (Exception e) {
            try {
                startForeground(NOTIFICATION_ID, notification);
            } catch (Exception ignored) {}
        }
    }

    private void connectVpn(
            String serverName,
            String serverIp,
            int serverPort,
            String protocol,
            String dnsServer,
            String uuid,
            String transport,
            String wsPath,
            String wsHost,
            String sni,
            ArrayList<String> bypassPackages
    ) {
        if (engineInstance != null && engineInstance.isRunning()) {
            disconnectVpn();
        }

        try {
            Builder builder = new Builder();
            builder.setSession("Antares VPN - " + serverName);
            builder.setMtu(1420);

            // Adresses IP virtuelles du tunnel privé
            try {
                builder.addAddress("10.8.0.2", 24);
                builder.addAddress("fd00:antares::2", 64);
            } catch (Exception e) {
                Log.w(TAG, "Erreur addAddress tunnel:", e);
            }

            // Routage global IPv4 et IPv6 vers le TUN
            try {
                builder.addRoute("0.0.0.0", 0);
                builder.addRoute("::", 0);
            } catch (Exception e) {
                Log.w(TAG, "Erreur addRoute tunnel:", e);
            }

            // Serveurs DNS sécurisés
            boolean dnsSet = false;
            if (dnsServer != null && !dnsServer.trim().isEmpty() && !dnsServer.startsWith("http")) {
                try {
                    builder.addDnsServer(dnsServer.trim());
                    dnsSet = true;
                } catch (Exception ignored) {}
            }
            if (!dnsSet) {
                try {
                    builder.addDnsServer("1.1.1.1");
                    builder.addDnsServer("1.0.0.1");
                } catch (Exception ignored) {}
            }

            // Applications exclues (Split Tunneling)
            if (bypassPackages != null && !bypassPackages.isEmpty()) {
                PackageManager pm = getPackageManager();
                for (String pkg : bypassPackages) {
                    try {
                        pm.getPackageInfo(pkg, 0);
                        builder.addDisallowedApplication(pkg);
                    } catch (PackageManager.NameNotFoundException ignored) {}
                }
            }

            builder.setBlocking(false);

            // Création de l'interface TUN
            vpnInterface = builder.establish();
            if (vpnInterface == null) {
                Log.e(TAG, "Impossible d'établir l'interface TUN (permission révoquée ou conflit)");
                broadcastState("CONNECTION_ERROR", "Autorisation TUN non accordée");
                updateForegroundNotification("Erreur d'initialisation du tunnel");
                return;
            }

            // Création et lancement du moteur VLESS réel
            engineInstance = new VlessTunnelEngine(
                    this,
                    serverIp,
                    serverPort,
                    protocol,
                    dnsServer,
                    uuid,
                    transport,
                    wsPath,
                    wsHost,
                    sni,
                    (state, message) -> {
                        broadcastState(state, message);
                        updateForegroundNotification(state + " • " + message);
                    }
            );

            boolean started = engineInstance.start(vpnInterface);
            if (!started) {
                disconnectVpn();
            }

        } catch (Exception e) {
            Log.e(TAG, "Erreur démarrage VPN", e);
            broadcastState("CONNECTION_ERROR", e.getMessage() != null ? e.getMessage() : "Échec initialisation");
            disconnectVpn();
        }
    }

    public void disconnectVpn() {
        Log.i(TAG, "Arrêt du tunnel Antares VPN");

        if (engineInstance != null) {
            engineInstance.stop();
            engineInstance = null;
        }

        if (vpnInterface != null) {
            try {
                vpnInterface.close();
            } catch (IOException ignored) {}
            vpnInterface = null;
        }

        try {
            stopForeground(true);
        } catch (Exception ignored) {}

        broadcastState("DISCONNECTED", "VPN Déconnecté");
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
                .setContentTitle("Antares VPN — " + activeServerName)
                .setContentText(activeProtocol + " (" + activeServerIp + ":" + activeServerPort + ")")
                .setSubText(subtitle != null ? subtitle : "Tunnel Chiffré")
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

    private void broadcastState(String state, String message) {
        try {
            Intent intent = new Intent(ACTION_STATUS_BROADCAST);
            intent.putExtra("state", state);
            intent.putExtra("message", message);
            intent.putExtra("server_name", activeServerName);
            intent.putExtra("server_ip", activeServerIp);
            intent.putExtra("bytes_in", getBytesIn());
            intent.putExtra("bytes_out", getBytesOut());
            intent.putExtra("packets_in", getPacketsIn());
            intent.putExtra("packets_out", getPacketsOut());
            intent.putExtra("packets_returned", getPacketsReturned());
            sendBroadcast(intent);
        } catch (Exception e) {
            Log.w(TAG, "Erreur broadcastState:", e);
        }
    }
}
