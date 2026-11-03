package com.antares.vpn;

import android.app.Activity;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.pm.ApplicationInfo;
import android.content.pm.PackageManager;
import android.net.VpnService;
import android.os.Build;
import android.util.Log;

import androidx.activity.result.ActivityResult;

import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.ActivityCallback;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.util.ArrayList;
import java.util.List;

/**
 * AntaresVpnPlugin
 * Plugin Capacitor exposant l'API VPN native Android vers l'interface Web (TypeScript/React).
 */
@CapacitorPlugin(name = "AntaresVpn")
public class AntaresVpnPlugin extends Plugin {

    private static final String TAG = "AntaresVpnPlugin";
    private BroadcastReceiver statusReceiver;

    @Override
    public void load() {
        super.load();

        try {
            // Réception des broadcasts d'état émis par AntaresVpnService
            statusReceiver = new BroadcastReceiver() {
                @Override
                public void onReceive(Context context, Intent intent) {
                    if (intent != null && AntaresVpnService.ACTION_STATUS_BROADCAST.equals(intent.getAction())) {
                        String state = intent.getStringExtra("state");
                        String serverName = intent.getStringExtra("server_name");
                        String serverIp = intent.getStringExtra("server_ip");

                        JSObject data = new JSObject();
                        data.put("state", state);
                        data.put("serverName", serverName);
                        data.put("serverIp", serverIp);
                        notifyListeners("vpnStateChange", data);
                    }
                }
            };

            IntentFilter filter = new IntentFilter(AntaresVpnService.ACTION_STATUS_BROADCAST);
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                getContext().registerReceiver(statusReceiver, filter, Context.RECEIVER_NOT_EXPORTED);
            } else {
                getContext().registerReceiver(statusReceiver, filter);
            }
        } catch (Exception e) {
            Log.w(TAG, "Erreur enregistrement statusReceiver: " + e.getMessage());
        }
    }

    @Override
    protected void handleOnDestroy() {
        if (statusReceiver != null) {
            try {
                getContext().unregisterReceiver(statusReceiver);
            } catch (Exception ignored) {}
            statusReceiver = null;
        }
        super.handleOnDestroy();
    }

    /**
     * prepare: Vérifie ou demande l'autorisation système Android pour le VPN.
     * Si l'utilisateur n'a pas encore autorisé Antares VPN, ouvre la boîte de dialogue système.
     */
    @PluginMethod
    public void prepare(PluginCall call) {
        try {
            Intent intent = VpnService.prepare(getContext());
            if (intent != null) {
                // L'utilisateur doit accepter la demande VPN système Android
                startActivityForResult(call, intent, "vpnPermissionResult");
            } else {
                // Déjà autorisé
                JSObject ret = new JSObject();
                ret.put("granted", true);
                ret.put("message", "Permission VPN accordée");
                call.resolve(ret);
            }
        } catch (Exception e) {
            Log.e(TAG, "Erreur prepare VPN: " + e.getMessage());
            call.reject("Impossible de préparer le service VPN: " + e.getMessage());
        }
    }

    @ActivityCallback
    private void vpnPermissionResult(PluginCall call, ActivityResult result) {
        if (call == null) return;

        if (result.getResultCode() == Activity.RESULT_OK) {
            JSObject ret = new JSObject();
            ret.put("granted", true);
            ret.put("message", "Permission VPN accordée par l'utilisateur");
            call.resolve(ret);
        } else {
            JSObject ret = new JSObject();
            ret.put("granted", false);
            ret.put("message", "L'utilisateur a refusé l'autorisation VPN système");
            call.resolve(ret);
        }
    }

    /**
     * start: Démarre le service VPN natif chiffré
     */
    @PluginMethod
    public void start(PluginCall call) {
        try {
            Intent prepareIntent = VpnService.prepare(getContext());
            if (prepareIntent != null) {
                call.reject("Permission VPN requise avant le démarrage. Appelez prepare() d'abord.");
                return;
            }

            String serverName = call.getString("serverName", "Antares VLESS Tokyo Reality");
            String serverIp = call.getString("serverIp", "185.190.142.66");
            int serverPort = call.getInt("serverPort", 443);
            String protocol = call.getString("protocol", "VLESS-Reality");
            String dns = call.getString("dns", "1.1.1.1");

            JSArray bypassArr = call.getArray("bypassPackages");
            ArrayList<String> bypassList = new ArrayList<>();
            if (bypassArr != null) {
                for (int i = 0; i < bypassArr.length(); i++) {
                    try {
                        bypassList.add(bypassArr.getString(i));
                    } catch (Exception ignored) {}
                }
            }

            Intent intent = new Intent(getContext(), AntaresVpnService.class);
            intent.setAction(AntaresVpnService.ACTION_CONNECT);
            intent.putExtra("server_name", serverName);
            intent.putExtra("server_ip", serverIp);
            intent.putExtra("server_port", serverPort);
            intent.putExtra("protocol", protocol);
            intent.putExtra("dns", dns);
            intent.putStringArrayListExtra("bypass_packages", bypassList);

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                getContext().startForegroundService(intent);
            } else {
                getContext().startService(intent);
            }

            JSObject ret = new JSObject();
            ret.put("success", true);
            ret.put("state", "connecting");
            call.resolve(ret);
        } catch (Exception e) {
            Log.e(TAG, "Erreur fatale lors du start VPN: " + e.getMessage());
            call.reject("Erreur de lancement du VPN: " + e.getMessage());
        }
    }

    /**
     * stop: Arrête le service VPN natif
     */
    @PluginMethod
    public void stop(PluginCall call) {
        try {
            Intent intent = new Intent(getContext(), AntaresVpnService.class);
            intent.setAction(AntaresVpnService.ACTION_DISCONNECT);
            getContext().startService(intent);

            JSObject ret = new JSObject();
            ret.put("success", true);
            ret.put("state", "disconnected");
            call.resolve(ret);
        } catch (Exception e) {
            Log.e(TAG, "Erreur stop VPN: " + e.getMessage());
            call.reject("Impossible d'arrêter le VPN: " + e.getMessage());
        }
    }

    /**
     * getStatus: Récupère l'état courant et la télémétrie du VPN natif
     */
    @PluginMethod
    public void getStatus(PluginCall call) {
        try {
            boolean isRunning = AntaresVpnService.isRunning();
            JSObject ret = new JSObject();
            ret.put("connected", isRunning);
            ret.put("durationSeconds", AntaresVpnService.getDurationSeconds());
            ret.put("bytesIn", AntaresVpnService.getBytesIn());
            ret.put("bytesOut", AntaresVpnService.getBytesOut());
            ret.put("serverName", AntaresVpnService.getActiveServerName());
            ret.put("serverIp", AntaresVpnService.getActiveServerIp());
            call.resolve(ret);
        } catch (Exception e) {
            call.reject("Erreur getStatus: " + e.getMessage());
        }
    }

    /**
     * getInstalledApps: Énumère les vraies applications installées sur le smartphone
     * pour le Split-Tunneling réel
     */
    @PluginMethod
    public void getInstalledApps(PluginCall call) {
        try {
            PackageManager pm = getContext().getPackageManager();
            List<ApplicationInfo> apps = pm.getInstalledApplications(PackageManager.GET_META_DATA);

            JSArray resultList = new JSArray();
            for (ApplicationInfo app : apps) {
                boolean isSystem = (app.flags & ApplicationInfo.FLAG_SYSTEM) != 0;
                String pkg = app.packageName;

                if (!isSystem || pkg.contains("chrome") || pkg.contains("youtube") || pkg.contains("browser")) {
                    JSObject appObj = new JSObject();
                    appObj.put("packageName", pkg);
                    appObj.put("appName", pm.getApplicationLabel(app).toString());
                    appObj.put("isSystem", isSystem);
                    resultList.put(appObj);
                }
            }

            JSObject ret = new JSObject();
            ret.put("apps", resultList);
            call.resolve(ret);
        } catch (Exception e) {
            call.reject("Impossible de lister les applications: " + e.getMessage());
        }
    }
}
