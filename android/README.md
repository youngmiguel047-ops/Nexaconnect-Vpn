# ANTARES VPN — PROJET ANDROID KOTLIN & JETPACK COMPOSE

Ce dossier contient l'architecture et les composants du projet Android complet pour **ANTARES VPN** (Package : \`com.antares.vpn\`).

## Structure des Fichiers
- \`build.gradle.kts\` : Configuration globale Gradle
- \`settings.gradle.kts\` : Déclaration des dépôts Maven Central, Google et JitPack
- \`app/build.gradle.kts\` : Dépendances Compose, sing-box libbox, Coroutines, AndroidX Security
- \`app/src/main/AndroidManifest.xml\` : Permissions \`BIND_VPN_SERVICE\`, filtres \`.atrs\`
- \`app/src/main/java/com/antares/vpn/\` : Code source Kotlin & Jetpack Compose

## Instructions de Compilation de l'APK
1. Ouvrez ce dossier ou importez le projet dans **Android Studio Ladybug (2024.2.1+)**.
2. Assurez-vous d'utiliser **JDK 17** dans \`Settings > Build > Build Tools > Gradle > Gradle JDK\`.
3. Pour générer un APK de débogage :
   \`\`\`bash
   ./gradlew assembleDebug
   \`\`\`
   L'APK produit sera : \`app/build/outputs/apk/debug/app-debug.apk\`
4. Pour installer directement sur un téléphone Android connecté en USB :
   \`\`\`bash
   adb install -r app/build/outputs/apk/debug/app-debug.apk
   \`\`\`
5. Pour générer l'APK signé de production pour Google Play Store :
   \`\`\`bash
   ./gradlew assembleRelease
   \`\`\`
