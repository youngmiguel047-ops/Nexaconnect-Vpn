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
  Terminal, 
  Download, 
  ShieldCheck, 
  Smartphone,
  ExternalLink,
  Layers,
  Cpu,
  GitBranch
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
    'workflow' | 'install' | 'tree' | 'manifest' | 'mainactivity' | 'capacitor' | 'gradle'
  >('workflow');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, key: string) => {
    cyberAudio.playClick();
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const filesMap: Record<string, { title: string; filename: string; language: string; code: string }> = {
    workflow: {
      title: 'Workflow GitHub Actions (Build APK Automatique)',
      filename: '.github/workflows/build-apk.yml',
      language: 'yaml',
      code: `name: Build Android APK (Antares VPN)

on:
  push:
    branches: [ main, master ]
  pull_request:
    branches: [ main, master ]
  workflow_dispatch: # Permet de déclencher la compilation manuellement en 1 clic sur GitHub

jobs:
  build:
    name: Build Antares VPN Debug APK
    runs-on: ubuntu-latest

    steps:
      - name: 1. Cloner le dépôt
        uses: actions/checkout@v4

      - name: 2. Configurer Node.js 20
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: 3. Configurer Bun
        uses: oven-sh/setup-bun@v2
        with:
          bun-version: latest

      - name: 4. Configurer Java 17 (JDK Temurin)
        uses: actions/setup-java@v4
        with:
          distribution: 'temurin'
          java-version: '17'

      - name: 5. Configurer Android SDK
        uses: android-actions/setup-android@v3

      - name: 6. Installer les dépendances avec Bun (utilise bun.lock)
        run: bun install

      - name: 7. Compiler l'application web Vite
        run: bun run build

      - name: 8. Synchroniser Capacitor avec le projet Android
        run: bunx cap sync android

      - name: 9. Donner les droits d'exécution au Gradle Wrapper
        run: chmod +x android/gradlew

      - name: 10. Compiler l'APK Android Debug
        run: |
          cd android
          ./gradlew assembleDebug --stacktrace

      - name: 10. Mettre en ligne l'APK (Artefact téléchargeable)
        uses: actions/upload-artifact@v4
        with:
          name: Antares-VPN-Debug-APK
          path: android/app/build/outputs/apk/debug/app-debug.apk
          retention-days: 14

      - name: 11. Créer une Release GitHub téléchargeable directement sur smartphone
        if: github.event_name == 'workflow_dispatch' || startsWith(github.ref, 'refs/tags/')
        uses: softprops/action-gh-release@v2
        with:
          tag_name: v3.4.0-\${{ github.run_number }}
          name: Antares VPN v3.4.0 (Build \${{ github.run_number }})
          body: |
            ### 🚀 Antares VPN — APK Android Prêt à l'installation
            - **Package ID** : \`com.antares.vpn\`
            - **Version** : 3.4.0-neon (Build \${{ github.run_number }})
            - **Protocole** : VLESS-Reality & Hysteria 2
            
            Téléchargez le fichier \`app-debug.apk\` ci-dessous directement sur votre smartphone Android pour l'installer.
          files: android/app/build/outputs/apk/debug/app-debug.apk
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}`,
    },
    install: {
      title: 'Guide d’Installation de l’APK sur Téléphone Android',
      filename: 'COMMENT_INSTALLER_APK.md',
      language: 'markdown',
      code: `# GUIDE ÉTAPE PAR ÉTAPE : TÉLÉCHARGER ET INSTALLER L'APK ANTARES VPN SUR VOTRE TÉLÉPHONE

## MÉTHODE 1 : VIA GITHUB ACTIONS (RECOMMANDÉE — SANS ANDROID STUDIO)

1. **Poussez votre projet sur GitHub :**
   \`\`\`bash
   git add .
   git commit -m "Add Capacitor Android project and GitHub Actions workflow"
   git push origin main
   \`\`\`

2. **Accédez aux Actions GitHub depuis votre smartphone ou PC :**
   - Ouvrez votre dépôt sur GitHub : \`https://github.com/VOTRE_PSEUDO/antares-vpn\`
   - Cliquez sur l'onglet **« Actions »** en haut.
   - Sélectionnez le workflow **« Build Android APK (Antares VPN) »** sur la gauche.
   - Cliquez sur le bouton **« Run workflow »** puis confirmez.

3. **Téléchargement de l'APK :**
   - Le serveur GitHub va compiler l'application en ~2 minutes.
   - Une fois la coche verte ✅ affichée, cliquez sur la compilation terminée.
   - En bas de la page dans la section **« Artifacts »**, cliquez sur **\`Antares-VPN-Debug-APK\`**.
   - Le fichier \`app-debug.apk\` (ou archive zip contenant l'APK) se télécharge directement !

4. **Installation sur votre téléphone Android :**
   - Ouvrez le fichier \`app-debug.apk\` téléchargé dans votre gestionnaire de fichiers ou via la notification de téléchargement.
   - Si Android affiche : *« Pour votre sécurité, votre téléphone n'est pas autorisé à installer des applications inconnues depuis cette source »* :
     - Appuyez sur **Paramètres**.
     - Cochez **« Autoriser cette source »**.
     - Revenez en arrière et appuyez sur **« Installer »**.
   - Appuyez sur **« Ouvrir »** : votre application Antares VPN s'ouvre avec l'interface cyberpunk et la pluie de mini Antares VPN !

---

## MÉTHODE 2 : COMPILATION LOCALE SUR VOTRE ORDINATEUR

Si vous avez Android Studio ou le SDK Android installé sur votre ordinateur :

1. Dans le dossier racine du projet :
   \`\`\`bash
   npm run cap:sync
   \`\`\`
2. Lancez la compilation directe de l'APK :
   \`\`\`bash
   cd android
   ./gradlew assembleDebug
   \`\`\`
3. L'APK généré se trouvera dans :
   \`android/app/build/outputs/apk/debug/app-debug.apk\`

4. Pour l'envoyer directement sur votre téléphone branché en USB :
   \`\`\`bash
   adb install -r android/app/build/outputs/apk/debug/app-debug.apk
   \`\`\``,
    },
    tree: {
      title: 'Arborescence Complète du Projet Capacitor Android',
      filename: 'STRUCTURE_PROJET.md',
      language: 'markdown',
      code: `ANTARES VPN — STRUCTURE COMPLÈTE DU PROJET CAPACITOR ANDROID

.
├── .github/
│   └── workflows/
│       └── build-apk.yml               # Workflow GitHub Actions de compilation APK
├── android/
│   ├── build.gradle                    # Configuration racine Gradle Android
│   ├── settings.gradle                 # Configuration des modules (:app, :capacitor-android)
│   ├── variables.gradle                # Versions SDK (compileSdkVersion=35, minSdkVersion=26)
│   ├── gradlew                         # Script Gradle Wrapper exécutable Unix/macOS/Linux
│   ├── gradlew.bat                     # Script Gradle Wrapper pour Windows
│   ├── gradle/
│   │   └── wrapper/
│   │       ├── gradle-wrapper.jar      # Binaire officiel Gradle Wrapper
│   │       └── gradle-wrapper.properties # Version Gradle 8.11.1
│   └── app/
│       ├── build.gradle                # Dépendances Android, namespace com.antares.vpn, versionCode 340
│       └── src/
│           └── main/
│               ├── AndroidManifest.xml # Permissions VPN, réseau, intent-filter .atrs
│               ├── assets/
│               │   ├── capacitor.config.json # Configuration runtime
│               │   └── public/         # L'application Web Vite compilée (HTML, CSS, JS, Assets)
│               ├── java/com/antares/vpn/
│               │   └── MainActivity.java # BridgeActivity Capacitor native
│               └── res/                # Icônes de lancement, styles, strings
├── capacitor.config.ts                 # Configuration principale Capacitor (appId: com.antares.vpn)
├── dist/                               # Build de production Vite
├── package.json                        # Dépendances (@capacitor/core, @capacitor/android, @capacitor/cli)
├── src/                                # Code source React 19 + TypeScript + Tailwind
└── vite.config.ts                      # Configuration de build Vite`,
    },
    manifest: {
      title: 'Manifeste Android (android/app/src/main/AndroidManifest.xml)',
      filename: 'AndroidManifest.xml',
      language: 'xml',
      code: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    <!-- Permissions Réseau & VPN Essentielles -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.CHANGE_NETWORK_STATE" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
    <uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/AppTheme">

        <activity
            android:configChanges="orientation|keyboardHidden|keyboard|screenSize|locale|smallestScreenSize|screenLayout|uiMode|navigation|density"
            android:name=".MainActivity"
            android:label="@string/title_activity_main"
            android:theme="@style/AppTheme.NoActionBarLaunch"
            android:launchMode="singleTask"
            android:screenOrientation="portrait"
            android:exported="true">

            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>

            <!-- Intent filter pour ouvrir les fichiers de profil .atrs -->
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

        <provider
            android:name="androidx.core.content.FileProvider"
            android:authorities="\${applicationId}.fileprovider"
            android:exported="false"
            android:grantUriPermissions="true">
            <meta-data
                android:name="android.support.FILE_PROVIDER_PATHS"
                android:resource="@xml/file_paths"></meta-data>
        </provider>
    </application>
</manifest>`,
    },
    mainactivity: {
      title: 'Activité Principale Native (MainActivity.java)',
      filename: 'MainActivity.java',
      language: 'java',
      code: `package com.antares.vpn;

import com.getcapacitor.BridgeActivity;

/**
 * MainActivity charge l'application web Antares VPN dans le WebView matériel
 * haute performance de Capacitor et expose les APIs natives.
 */
public class MainActivity extends BridgeActivity {
    // Les plugins et passerelles VPN peuvent être ajoutés ici si nécessaire
}`,
    },
    capacitor: {
      title: 'Configuration Capacitor (capacitor.config.ts)',
      filename: 'capacitor.config.ts',
      language: 'typescript',
      code: `import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.antares.vpn',
  appName: 'Antares VPN',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    cleartext: true,
  },
  android: {
    backgroundColor: '#03010B',
    allowMixedContent: true,
    captureInput: true,
  },
};

export default config;`,
    },
    gradle: {
      title: 'Gradle App (android/app/build.gradle)',
      filename: 'android/app/build.gradle',
      language: 'groovy',
      code: `apply plugin: 'com.android.application'

android {
    namespace = "com.antares.vpn"
    compileSdk = rootProject.ext.compileSdkVersion
    defaultConfig {
        applicationId "com.antares.vpn"
        minSdkVersion rootProject.ext.minSdkVersion
        targetSdkVersion rootProject.ext.targetSdkVersion
        versionCode 340
        versionName "3.4.0-neon"
        testInstrumentationRunner "androidx.test.runner.AndroidJUnitRunner"
        aaptOptions {
            ignoreAssetsPattern = '!.svn:!.git:!.ds_store:!*.scc:.*:!CVS:!thumbs.db:!picasa.ini:!*~'
        }
    }
    buildTypes {
        release {
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}

dependencies {
    implementation fileTree(include: ['*.jar'], dir: 'libs')
    implementation "androidx.appcompat:appcompat:$androidxAppCompatVersion"
    implementation "androidx.coordinatorlayout:coordinatorlayout:$androidxCoordinatorLayoutVersion"
    implementation "androidx.core:core-splashscreen:$coreSplashScreenVersion"
    implementation project(':capacitor-android')
    testImplementation "junit:junit:$junitVersion"
    androidTestImplementation "androidx.test.ext:junit:$androidxJunitVersion"
    androidTestImplementation "androidx.test.espresso:espresso-core:$androidxEspressoCoreVersion"
    implementation project(':capacitor-cordova-android-plugins')
}

apply from: 'capacitor.build.gradle'`,
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
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-orbitron font-bold text-sm sm:text-base text-white tracking-wide flex items-center gap-2">
                <span>Centre de Compilation APK Android (Capacitor)</span>
                <span className="text-[10px] font-mono-tech px-2 py-0.5 rounded bg-[#00FF88]/20 text-[#00FF88] border border-[#00FF88]/40">
                  PRÊT POUR COMPILATION
                </span>
              </h3>
              <p className="text-xs text-slate-400 font-rajdhani">
                Votre application web est intégrée dans un projet Android natif avec GitHub Actions & Gradle
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
            { id: 'workflow', label: '1. Workflow GitHub Actions', highlight: true },
            { id: 'install', label: '2. Comment Installer l\'APK' },
            { id: 'tree', label: '3. Arborescence du Projet' },
            { id: 'manifest', label: '4. AndroidManifest.xml' },
            { id: 'mainactivity', label: '5. MainActivity.java' },
            { id: 'capacitor', label: '6. capacitor.config.ts' },
            { id: 'gradle', label: '7. app/build.gradle' },
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
                    ? 'border-[#00FF88] text-[#00FF88] bg-[#00FF88]/10'
                    : tab.highlight
                    ? 'border-transparent text-[#00E5FF] hover:text-white'
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
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#00E5FF]/15 hover:bg-[#00E5FF]/25 border border-[#00E5FF]/40 text-[#00E5FF] text-xs font-mono-tech active:scale-95 transition-all cursor-pointer"
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
            ✓ Projet Android & Gradle Wrapper 100% synchronisés avec dist/
          </span>

          <button
            onClick={() => {
              cyberAudio.playClick();
              onClose();
            }}
            className="px-5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-orbitron font-semibold text-xs cursor-pointer"
          >
            Fermer l'inspecteur
          </button>
        </div>
      </div>
    </div>
  );
};
