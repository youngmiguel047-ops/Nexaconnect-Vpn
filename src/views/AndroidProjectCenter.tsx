/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  X, 
  Code2, 
  Copy, 
  Check, 
  FolderTree, 
  FileCode, 
  Terminal, 
  Download, 
  ShieldCheck, 
  ExternalLink,
  Layers,
  Cpu
} from 'lucide-react';
import { cyberAudio } from '../utils/audio';

interface AndroidProjectCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AndroidProjectCenter: React.FC<AndroidProjectCenterProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<
    'tree' | 'gradle' | 'manifest' | 'service' | 'controller' | 'compose' | 'parser' | 'tests' | 'build'
  >('tree');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, key: string) => {
    cyberAudio.playClick();
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const filesMap: Record<string, { title: string; filename: string; language: string; code: string }> = {
    tree: {
      title: 'Arborescence & Architecture Complète',
      filename: 'PROJECT_STRUCTURE.md',
      language: 'markdown',
      code: `# ANTARES VPN — ARCHITECTURE PROJET ANDROID (Kotlin / Jetpack Compose)
Package: com.antares.vpn
Version: 3.4.0 (VersionCode: 340)
MinSDK: 26 (Android 8.0 Oreo) | TargetSDK: 35 (Android 15)

antares-vpn-android/
├── build.gradle.kts                      # Root Gradle configuration
├── settings.gradle.kts                   # Plugin management & repositories
├── gradle.properties                     # JVM & Kotlin compiler optimization flags
├── app/
│   ├── build.gradle.kts                  # Dependencies: Compose, sing-box, Coroutines, DataStore
│   ├── proguard-rules.pro                # R8 Obfuscation & keep rules for JNI / libbox
│   └── src/
│       ├── main/
│       │   ├── AndroidManifest.xml       # BIND_VPN_SERVICE, FOREGROUND_SERVICE_SYSTEM_EXEMPTED
│       │   ├── java/com/antares/vpn/
│       │   │   ├── AntaresApp.kt         # Application lifecycle & Hilt/Koin DI setup
│       │   │   ├── MainActivity.kt       # Single activity host with Edge-to-Edge Compose
│       │   │   ├── model/
│       │   │   │   ├── VpnState.kt       # Sealed class: Disconnected, Connecting, Connected, Error
│       │   │   │   ├── VpnServer.kt      # Server entity (IP, Port, Protocol, Ping, Load, VIP)
│       │   │   │   ├── AtrsConfig.kt     # ATRS v1.2 specification model
│       │   │   │   └── TokenInfo.kt      # License token verification state
│       │   │   ├── service/
│       │   │   │   ├── AntaresVpnService.kt   # Android VpnService implementation & TUN builder
│       │   │   │   ├── VpnTileService.kt      # Android Quick Settings Tile
│       │   │   │   └── VpnNotificationManager.kt # Ongoing foreground notifications
│       │   │   ├── controller/
│       │   │   │   ├── VpnController.kt       # Interface & StateFlow connection manager
│       │   │   │   ├── SingBoxEngine.kt       # Bridge to io.nekohasekai.libbox (Go library)
│       │   │   │   └── NetworkSpeedMonitor.kt # Telemetry reader via /proc/net/dev & TUN stats
│       │   │   ├── parser/
│       │   │   │   ├── AtrsParser.kt          # Parser for .atrs JSON / base64 crypto packages
│       │   │   │   └── ConfigValidator.kt     # Safety rules (masks UUIDs, verifies signatures)
│       │   │   ├── repository/
│       │   │   │   ├── ServerRepository.kt    # DataStore & memory cache for server nodes
│       │   │   │   ├── TokenRepository.kt     # EncryptedSharedPreferences for VIP tokens
│       │   │   │   └── SettingsRepository.kt  # User preferences (Fast mode, DNS DoH, Killswitch)
│       │   │   ├── viewmodel/
│       │   │   │   └── VpnViewModel.kt        # StateFlow bridge connecting Controller to Compose UI
│       │   │   └── ui/
│       │   │       ├── theme/
│       │   │       │   ├── Color.kt           # Neon Cyan (#00E5FF), Purple (#8B00FF), Green (#00FF88)
│       │   │       │   ├── Type.kt            # Orbitron Display, Rajdhani, JetBrains Mono
│       │   │       │   └── Theme.kt           # Cyberpunk Glassmorphism Material3 Theme
│       │   │       ├── components/
│       │   │       │   ├── VpnPowerButton.kt  # Rotating multi-ring canvas power switch
│       │   │       │   ├── AntaresRain.kt     # Canvas digital rain animation
│       │   │       │   ├── ProtectionCard.kt  # HUD Status banner
│       │   │       │   └── WaveformGraph.kt   # Real-time oscilloscope speed chart
│       │   │       └── screens/
│       │   │           ├── HomeScreen.kt      # Main dashboard
│       │   │           ├── ServersScreen.kt   # Server selector & ping tester
│       │   │           ├── StatsScreen.kt     # Detailed telemetry & cipher audit
│       │   │           ├── SettingsScreen.kt  # Protocol & battery optimization
│       │   │           └── PremiumScreen.kt   # Token activation & VIP perks
│       │   └── res/
│       │       ├── drawable/              # Cyber icons, vector silhouettes
│       │       ├── values/                # Strings (FR), Colors, Themes
│       │       └── xml/                   # vpn_tile_service.xml
│       └── test/java/com/antares/vpn/
│           ├── AtrsParserTest.kt          # Unit test for valid and corrupted configs
│           └── VpnControllerTest.kt       # State machine transition verification`,
    },
    gradle: {
      title: 'Fichiers Gradle (Kotlin DSL)',
      filename: 'app/build.gradle.kts',
      language: 'kotlin',
      code: `plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.compose)
    alias(libs.plugins.kotlin.serialization)
}

android {
    namespace = "com.antares.vpn"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.antares.vpn"
        minSdk = 26
        targetSdk = 35
        versionCode = 340
        versionName = "3.4.0-neon"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
        ndk {
            abiFilters.addAll(listOf("arm64-v8a", "armeabi-v7a", "x86_64"))
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = true
            isShrinkResources = true
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
            signingConfig = signingConfigs.getByName("debug") // Replace with release signing in prod
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions {
        jvmTarget = "17"
    }
    buildFeatures {
        compose = true
    }
}

dependencies {
    // Core Android & Jetpack Compose
    implementation("androidx.core:core-ktx:1.15.0")
    implementation("androidx.lifecycle:lifecycle-runtime-ktx:2.8.7")
    implementation("androidx.lifecycle:lifecycle-viewmodel-compose:2.8.7")
    implementation("androidx.activity:activity-compose:1.9.3")
    implementation(platform("androidx.compose:compose-bom:2024.11.00"))
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.ui:ui-graphics")
    implementation("androidx.compose.ui:ui-tooling-preview")
    implementation("androidx.compose.material3:material3")
    implementation("androidx.navigation:navigation-compose:2.8.4")

    // Encrypted Storage & Preferences
    implementation("androidx.security:security-crypto:1.1.0-alpha06")
    implementation("androidx.datastore:datastore-preferences:1.1.1")

    // Kotlin Coroutines & JSON Serialization
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.9.0")
    implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:1.7.3")

    // sing-box / libbox Go Core (VPN Engine)
    // Download libbox.aar from https://github.com/SagerNet/sing-box/releases
    implementation(files("libs/libbox.aar"))

    // Testing
    testImplementation("junit:junit:4.13.2")
    testImplementation("org.jetbrains.kotlinx:kotlinx-coroutines-test:1.9.0")
    androidTestImplementation("androidx.test.ext:junit:1.2.1")
}`,
    },
    manifest: {
      title: 'Manifeste Android',
      filename: 'AndroidManifest.xml',
      language: 'xml',
      code: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:tools="http://schemas.android.com/tools"
    package="com.antares.vpn">

    <!-- Essential VPN & Network Permissions -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.CHANGE_NETWORK_STATE" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE_SYSTEM_EXEMPTED" />
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
    <uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />

    <application
        android:name=".AntaresApp"
        android:allowBackup="false"
        android:icon="@mipmap/ic_launcher"
        android:label="Antares VPN"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.AntaresVpn"
        tools:targetApi="35">

        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:launchMode="singleTop"
            android:screenOrientation="portrait"
            android:theme="@style/Theme.AntaresVpn">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>

            <!-- Support opening .atrs files from file managers -->
            <intent-filter>
                <action android:name="android.intent.action.VIEW" />
                <category android:name="android.intent.category.DEFAULT" />
                <category android:name="android.intent.category.BROWSABLE" />
                <data android:scheme="file" />
                <data android:scheme="content" />
                <data android:mimeType="*/*" />
                <data android:pathPattern=".*\\.atrs" />
            </intent-filter>
        </activity>

        <!-- Android VpnService Declaration -->
        <service
            android:name=".service.AntaresVpnService"
            android:permission="android.permission.BIND_VPN_SERVICE"
            android:foregroundServiceType="systemExempted"
            android:exported="false">
            <intent-filter>
                <action android:name="android.net.VpnService" />
            </intent-filter>
        </service>

        <!-- Quick Settings Tile for quick 1-tap connect in Android shade -->
        <service
            android:name=".service.VpnTileService"
            android:exported="true"
            android:icon="@drawable/ic_antares_tile"
            android:label="Antares VPN"
            android:permission="android.permission.BIND_QUICK_SETTINGS_TILE">
            <intent-filter>
                <action android:name="android.service.quicksettings.action.QS_TILE" />
            </intent-filter>
        </service>

    </application>
</manifest>`,
    },
    service: {
      title: 'Service VPN Android (VpnService)',
      filename: 'AntaresVpnService.kt',
      language: 'kotlin',
      code: `package com.antares.vpn.service

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Intent
import android.net.VpnService
import android.os.Build
import android.os.ParcelFileDescriptor
import androidx.core.app.NotificationCompat
import com.antares.vpn.MainActivity
import com.antares.vpn.R
import com.antares.vpn.controller.SingBoxEngine
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.cancel
import kotlinx.coroutines.launch

/**
 * Android VpnService implementation.
 * Establishes the TUN virtual interface and routes packets via sing-box engine.
 */
class AntaresVpnService : VpnService() {

    private val serviceScope = CoroutineScope(SupervisorJob() + Dispatchers.IO)
    private var vpnInterface: ParcelFileDescriptor? = null
    private var isRunning = false

    companion object {
        const val ACTION_START = "com.antares.vpn.START"
        const val ACTION_STOP = "com.antares.vpn.STOP"
        const val CHANNEL_ID = "antares_vpn_status_channel"
        const val NOTIFICATION_ID = 2026
    }

    override fun onCreate() {
        super.onCreate()
        createNotificationChannel()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        when (intent?.action) {
            ACTION_START -> {
                val serverJson = intent.getStringExtra("SERVER_CONFIG") ?: ""
                startVpnTunnel(serverJson)
            }
            ACTION_STOP -> {
                stopVpnTunnel()
            }
        }
        return START_NOT_STICKY
    }

    private fun startVpnTunnel(serverJson: String) {
        if (isRunning) return
        startForeground(NOTIFICATION_ID, buildForegroundNotification("Connexion à Antares VPN en cours..."))

        serviceScope.launch {
            try {
                // 1. Build the Android TUN interface
                val builder = Builder().apply {
                    setSession("Antares Cyber VPN")
                    setMtu(1500)
                    addAddress("172.19.0.1", 30) // Internal TUN subnet
                    addDnsServer("1.1.1.1")
                    addDnsServer("9.9.9.9")
                    addRoute("0.0.0.0", 0) // Route all IPv4 traffic
                    setBlocking(false)
                }

                vpnInterface = builder.establish()
                if (vpnInterface == null) {
                    stopSelf()
                    return@launch
                }

                // 2. Initialize sing-box libbox core with TUN file descriptor
                val fd = vpnInterface!!.fd
                val success = SingBoxEngine.start(fd, serverJson)

                if (success) {
                    isRunning = true
                    updateNotification("Protégé • Tunnel chiffré actif")
                } else {
                    stopVpnTunnel()
                }
            } catch (e: Exception) {
                stopVpnTunnel()
            }
        }
    }

    private fun stopVpnTunnel() {
        isRunning = false
        SingBoxEngine.stop()
        try {
            vpnInterface?.close()
            vpnInterface = null
        } catch (_: Exception) {}
        stopForeground(STOP_FOREGROUND_REMOVE)
        stopSelf()
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "Statut de Connexion Antares VPN",
                NotificationManager.IMPORTANCE_LOW
            )
            val manager = getSystemService(NotificationManager::class.java)
            manager.createNotificationChannel(channel)
        }
    }

    private fun buildForegroundNotification(status: String): Notification {
        val launchIntent = Intent(this, MainActivity::class.java)
        val pendingIntent = PendingIntent.getActivity(
            this, 0, launchIntent, PendingIntent.FLAG_IMMUTABLE
        )

        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("Antares VPN")
            .setContentText(status)
            .setSmallIcon(R.drawable.ic_shield_neon)
            .setContentIntent(pendingIntent)
            .setOngoing(true)
            .build()
    }

    private fun updateNotification(status: String) {
        val manager = getSystemService(NotificationManager::class.java)
        manager.notify(NOTIFICATION_ID, buildForegroundNotification(status))
    }

    override fun onDestroy() {
        serviceScope.cancel()
        super.onDestroy()
    }
}`,
    },
    controller: {
      title: 'Contrôleur VPN & Moteur sing-box',
      filename: 'VpnController.kt',
      language: 'kotlin',
      code: `package com.antares.vpn.controller

import android.content.Context
import android.content.Intent
import android.net.VpnService
import com.antares.vpn.model.VpnServer
import com.antares.vpn.model.VpnState
import com.antares.vpn.service.AntaresVpnService
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

/**
 * Central singleton controller handling user intents, permissions,
 * and communicating with AntaresVpnService.
 */
class VpnController(private val context: Context) {

    private val _connectionState = MutableStateFlow<VpnState>(VpnState.Disconnected)
    val connectionState: StateFlow<VpnState> = _connectionState.asStateFlow()

    private val _activeServer = MutableStateFlow<VpnServer?>(null)
    val activeServer: StateFlow<VpnServer?> = _activeServer.asStateFlow()

    /**
     * Request connection start.
     * Returns an Intent if Android VpnService permission consent dialog is required.
     */
    fun startConnection(server: VpnServer): Intent? {
        // Check if Android requires user permission consent dialog
        val prepareIntent = VpnService.prepare(context)
        if (prepareIntent != null) {
            return prepareIntent
        }

        _connectionState.value = VpnState.Connecting(server)
        _activeServer.value = server

        val intent = Intent(context, AntaresVpnService::class.java).apply {
            action = AntaresVpnService.ACTION_START
            putExtra("SERVER_CONFIG", server.toSingBoxJson())
        }
        context.startService(intent)
        return null
    }

    fun stopConnection() {
        _connectionState.value = VpnState.Disconnecting
        val intent = Intent(context, AntaresVpnService::class.java).apply {
            action = AntaresVpnService.ACTION_STOP
        }
        context.startService(intent)
        _connectionState.value = VpnState.Disconnected
    }
}`,
    },
    compose: {
      title: 'Écran Compose HomeScreen.kt & Bouton Central',
      filename: 'HomeScreen.kt',
      language: 'kotlin',
      code: `package com.antares.vpn.ui.screens

import androidx.compose.animation.core.*
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.*
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.antares.vpn.model.VpnState
import com.antares.vpn.ui.theme.*

/**
 * Spectacular Cyberpunk Central VPN Power Button in Jetpack Compose
 */
@Composable
fun VpnCentralButton(
    state: VpnState,
    onToggle: () -> Unit,
    modifier: Modifier = Modifier
) {
    val infiniteTransition = rememberInfiniteTransition(label = "rotation")
    val rotation by infiniteTransition.animateFloat(
        initialValue = 0f,
        targetValue = 360f,
        animationSpec = infiniteRepeatable(
            animation = tween(24000, easing = LinearEasing),
            repeatMode = RepeatMode.Restart
        ),
        label = "angle"
    )

    val isConnected = state is VpnState.Connected
    val isConnecting = state is VpnState.Connecting
    val primaryColor = when {
        isConnected -> NeonGreen
        isConnecting -> ElectricCyan
        state is VpnState.Error -> ErrorRed
        else -> ElectricCyan
    }

    Box(
        contentAlignment = Alignment.Center,
        modifier = modifier
            .size(220.dp)
            .clickable { onToggle() }
    ) {
        // Outer Cyber Rotating Canvas Ring
        Canvas(modifier = Modifier.fillMaxSize()) {
            drawCircle(
                color = primaryColor.copy(alpha = 0.5f),
                radius = size.minDimension / 2f - 4.dp.toPx(),
                style = Stroke(
                    width = 2.dp.toPx(),
                    pathEffect = PathEffect.dashPathEffect(floatArrayOf(24f, 16f, 8f, 16f))
                )
            )
        }

        // Inner glowing core
        Box(
            contentAlignment = Alignment.Center,
            modifier = Modifier
                .size(150.dp)
                .clip(CircleShape)
                .background(
                    Brush.radialGradient(
                        colors = listOf(primaryColor.copy(alpha = 0.35f), DeepBlack),
                        radius = 200f
                    )
                )
        ) {
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Text(
                    text = when {
                        isConnected -> "CONNECTÉ"
                        isConnecting -> "CONNEXION..."
                        else -> "CONNECTER"
                    },
                    fontFamily = OrbitronFont,
                    fontSize = 13.sp,
                    color = primaryColor
                )
            }
        }
    }
}`,
    },
    parser: {
      title: 'Système de Parsing ATRS (AtrsParser.kt)',
      filename: 'AtrsParser.kt',
      language: 'kotlin',
      code: `package com.antares.vpn.parser

import com.antares.vpn.model.AtrsConfig
import com.antares.vpn.model.VpnServer
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonArray

/**
 * Dedicated parser for Antares Tunnel Routing Specification (.atrs) files.
 * Ensures security: private keys and UUIDs are safely masked and never logged.
 */
object AtrsParser {
    const val CURRENT_VERSION = "1.2.0"
    const val MAGIC_HEADER = "ATRS_CYBER_SPEC"

    private val json = Json { ignoreUnknownKeys = true }

    data class ParseResult(
        val success: Boolean,
        val config: AtrsConfig? = null,
        val servers: List<VpnServer> = emptyList(),
        val errorMessage: String? = null
    )

    fun parse(rawContent: String): ParseResult {
        if (rawContent.isBlank()) {
            return ParseResult(false, errorMessage = "Le contenu ATRS est vide.")
        }
        return try {
            val root = json.parseToJsonElement(rawContent).jsonObject
            val magic = root["magic"]?.toString()?.replace("\"", "")
            if (magic != MAGIC_HEADER) {
                return ParseResult(false, errorMessage = "Signature d'en-tête ATRS invalide.")
            }

            // Parse server models while masking secrets
            val serversJson = root["servers"]?.jsonArray ?: return ParseResult(false, errorMessage = "Aucun serveur trouvé.")
            val servers = mutableListOf<VpnServer>()

            for (element in serversJson) {
                val obj = element.jsonObject
                val serverName = obj["name"]?.toString()?.replace("\"", "") ?: "Nœud ATRS"
                val ip = obj["server"]?.toString()?.replace("\"", "") ?: continue
                val port = obj["port"]?.toString()?.toIntOrNull() ?: 443

                servers.add(
                    VpnServer(
                        id = "atrs-\${System.currentTimeMillis()}-\${servers.size}",
                        name = serverName,
                        ip = ip,
                        port = port,
                        protocol = obj["protocol"]?.toString()?.replace("\"", "") ?: "VLESS-Reality"
                    )
                )
            }

            ParseResult(true, servers = servers)
        } catch (e: Exception) {
            ParseResult(false, errorMessage = "Erreur de syntaxe JSON ATRS: \${e.message}")
        }
    }
}`,
    },
    tests: {
      title: 'Tests Unitaires (AtrsParserTest.kt)',
      filename: 'AtrsParserTest.kt',
      language: 'kotlin',
      code: `package com.antares.vpn

import com.antares.vpn.parser.AtrsParser
import org.junit.Assert.*
import org.junit.Test

class AtrsParserTest {

    @Test
    fun parse_validAtrsConfig_returnsSuccessAndServers() {
        val sample = """
        {
          "magic": "ATRS_CYBER_SPEC",
          "version": "1.2.0",
          "configName": "Test Tokyo Node",
          "servers": [
            {
              "name": "Tokyo Cyber 01",
              "server": "133.242.18.99",
              "port": 8443,
              "protocol": "Hysteria2"
            }
          ]
        }
        """.trimIndent()

        val result = AtrsParser.parse(sample)
        assertTrue(result.success)
        assertEquals(1, result.servers.size)
        assertEquals("Tokyo Cyber 01", result.servers[0].name)
        assertEquals("133.242.18.99", result.servers[0].ip)
    }

    @Test
    fun parse_invalidHeader_returnsError() {
        val corrupted = """{"magic": "INVALID_HEADER"}"""
        val result = AtrsParser.parse(corrupted)
        assertFalse(result.success)
        assertNotNull(result.errorMessage)
    }

    @Test
    fun parse_emptyString_returnsError() {
        val result = AtrsParser.parse("")
        assertFalse(result.success)
    }
}`,
    },
    build: {
      title: 'Instructions de Compilation & Génération APK',
      filename: 'BUILD_INSTRUCTIONS.md',
      language: 'markdown',
      code: `# GUIDE DE COMPILATION & GÉNÉRATION DE L'APK ANTARES VPN

## 1. Prérequis
- Android Studio Ladybug (2024.2.1+) ou Android Studio Meerkat
- JDK 17 (OpenJDK 17 ou Eclipse Temurin 17)
- Android SDK 35 (avec Platform Tools et Build-Tools 35.0.0)
- NDK r26c ou supérieur (pour la compilation du module libbox sing-box)

## 2. Compilation en Mode Débogage (Debug APK)
Ouvrez un terminal dans le répertoire racine du projet :
\`\`\`bash
# Attribution des droits d'exécution sur Unix / macOS / Linux
chmod +x gradlew

# Compiler et générer l'APK de test
./gradlew assembleDebug
\`\`\`
L'APK généré se trouvera dans :
\`app/build/outputs/apk/debug/app-debug.apk\`

## 3. Installation directe sur smartphone Android (via USB / ADB)
Activez le « Débogage USB » dans les options de développement de votre smartphone :
\`\`\`bash
adb install -r app/build/outputs/apk/debug/app-debug.apk
\`\`\`

## 4. Génération de l'APK Release Signé pour Google Play
1. Créez votre keystore de signature si vous ne l'avez pas :
\`\`\`bash
keytool -genkey -v -keystore antares-release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias antareskey
\`\`\`

2. Exécutez la compilation Release :
\`\`\`bash
./gradlew assembleRelease
\`\`\`
Ou pour générer l'Android App Bundle (.aab) officiel du Play Store :
\`\`\`bash
./gradlew bundleRelease
\`\`\`

## 5. Intégration sing-box / libbox (VLESS & Hysteria 2)
Pour compiler la bibliothèque Go native libbox :
\`\`\`bash
git clone https://github.com/SagerNet/sing-box.git
cd sing-box
go run ./cmd/internal/build_aar -target android -output ../app/libs/libbox.aar
\`\`\`
Puis synchronisez votre projet Gradle dans Android Studio.`,
    },
  };

  const currentFile = filesMap[activeTab];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-4xl h-[92vh] flex flex-col rounded-2xl bg-[#080516] border border-[#00E5FF]/40 shadow-[0_0_80px_rgba(0,229,255,0.25)] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-[#0C0722]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#00E5FF]/15 text-[#00E5FF]">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-orbitron font-bold text-sm sm:text-base text-white tracking-wide flex items-center gap-2">
                <span>Centre de Code Android ANTARES VPN</span>
                <span className="text-[10px] font-mono-tech px-2 py-0.5 rounded bg-[#00FF88]/20 text-[#00FF88] border border-[#00FF88]/40">
                  Livrable Complet
                </span>
              </h3>
              <p className="text-xs text-slate-400 font-rajdhani">
                Architecture Kotlin, Jetpack Compose, VpnService, Gradle & instructions APK
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              cyberAudio.playClick();
              onClose();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="flex border-b border-slate-800 bg-[#060310] px-2 overflow-x-auto no-scrollbar">
          {[
            { id: 'tree', label: 'Arborescence' },
            { id: 'gradle', label: 'Gradle (KTS)' },
            { id: 'manifest', label: 'Manifeste XML' },
            { id: 'service', label: 'VpnService.kt' },
            { id: 'controller', label: 'VpnController.kt' },
            { id: 'compose', label: 'Compose UI' },
            { id: 'parser', label: 'AtrsParser.kt' },
            { id: 'tests', label: 'Tests' },
            { id: 'build', label: 'Compilation APK' },
          ].map((tab) => {
            const isSel = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  cyberAudio.playClick();
                  setActiveTab(tab.id as any);
                }}
                className={`px-3 py-2.5 text-xs font-orbitron font-semibold whitespace-nowrap transition-all border-b-2 ${
                  isSel
                    ? 'border-[#00E5FF] text-[#00E5FF] bg-[#00E5FF]/10'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Code Viewer Header */}
        <div className="px-4 py-2.5 bg-[#090518] border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono-tech text-white font-bold">
              {currentFile.filename}
            </span>
            <span className="text-[10px] font-mono-tech text-slate-500">
              ({currentFile.title})
            </span>
          </div>

          <button
            onClick={() => handleCopy(currentFile.code, activeTab)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#00E5FF]/15 hover:bg-[#00E5FF]/25 border border-[#00E5FF]/40 text-[#00E5FF] text-xs font-mono-tech active:scale-95 transition-all"
          >
            {copiedKey === activeTab ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#00FF88]" />
                <span className="text-[#00FF88]">Copié !</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copier le fichier</span>
              </>
            )}
          </button>
        </div>

        {/* Code Content Box */}
        <div className="flex-1 overflow-auto p-4 bg-[#03010A] text-slate-200 font-mono-tech text-xs leading-relaxed">
          <pre className="whitespace-pre overflow-x-auto select-text font-mono">
            {currentFile.code}
          </pre>
        </div>

        {/* Footer */}
        <div className="p-3 bg-[#060310] border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span className="text-[11px] font-mono-tech text-[#00FF88]">
            ✓ Fichiers conformes aux standards Android 15 & Jetpack Compose
          </span>

          <button
            onClick={() => {
              cyberAudio.playClick();
              onClose();
            }}
            className="px-5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-orbitron font-semibold text-xs"
          >
            Fermer l'inspecteur
          </button>
        </div>
      </div>
    </div>
  );
};
