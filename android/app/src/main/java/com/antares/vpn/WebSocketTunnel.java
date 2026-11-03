package com.antares.vpn;

import android.net.VpnService;
import android.os.Build;
import android.util.Base64;
import android.util.Log;

import java.io.BufferedInputStream;
import java.io.BufferedOutputStream;
import java.io.ByteArrayOutputStream;
import java.io.EOFException;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.net.Socket;
import java.security.SecureRandom;
import java.util.Collections;

import javax.net.ssl.SNIHostName;
import javax.net.ssl.SSLParameters;
import javax.net.ssl.SSLSocket;
import javax.net.ssl.SSLSocketFactory;

/**
 * WebSocketTunnel
 * Établit un tunnel sécurisé TCP / TLS + WebSocket RFC 6455 vers le serveur VLESS
 * avec protection systématique du socket via VpnService.protect() pour éviter les boucles.
 */
public class WebSocketTunnel {

    private static final String TAG = "WebSocketTunnel";

    private final VpnService vpnService;
    private final String serverHost;
    private final int serverPort;
    private final boolean useTls;
    private final String sni;
    private final String wsHost;
    private final String wsPath;

    private Socket socket;
    private InputStream in;
    private OutputStream out;
    private final SecureRandom random = new SecureRandom();

    public WebSocketTunnel(
            VpnService vpnService,
            String serverHost,
            int serverPort,
            boolean useTls,
            String sni,
            String wsHost,
            String wsPath
    ) {
        this.vpnService = vpnService;
        this.serverHost = serverHost;
        this.serverPort = serverPort;
        this.useTls = useTls;
        this.sni = (sni != null && !sni.trim().isEmpty()) ? sni.trim() : serverHost;
        this.wsHost = (wsHost != null && !wsHost.trim().isEmpty()) ? wsHost.trim() : (this.sni != null ? this.sni : serverHost);
        this.wsPath = (wsPath != null && !wsPath.trim().isEmpty()) ? (wsPath.startsWith("/") ? wsPath.trim() : "/" + wsPath.trim()) : "/";
    }

    /**
     * Établit la connexion TCP, la négociation TLS (avec SNI) et le handshake WebSocket
     */
    public void connect(int timeoutMs) throws Exception {
        Log.i(TAG, "Connexion TCP vers " + serverHost + ":" + serverPort + "...");

        // 1. Création du socket de base
        Socket rawSocket = new Socket();

        // CRITIQUE : Protection obligatoire du socket contre le routage circulaire Android TUN
        if (vpnService != null) {
            boolean protectedOk = vpnService.protect(rawSocket);
            if (!protectedOk) {
                Log.w(TAG, "Avertissement: vpnService.protect(rawSocket) a renvoyé false");
            }
        }

        rawSocket.setTcpNoDelay(true);
        rawSocket.setKeepAlive(true);
        rawSocket.connect(new InetSocketAddress(serverHost, serverPort), timeoutMs);

        // 2. Négociation TLS si activée
        if (useTls) {
            Log.i(TAG, "Négociation TLS avec SNI=" + sni + "...");
            SSLSocketFactory sslFactory = (SSLSocketFactory) SSLSocketFactory.getDefault();
            SSLSocket sslSocket = (SSLSocket) sslFactory.createSocket(
                    rawSocket,
                    serverHost,
                    serverPort,
                    true // auto-close
            );

            // Configuration SNI (Server Name Indication) pour contournement CDN / Cloudflare / Cloud Run
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N && sni != null && !sni.isEmpty()) {
                try {
                    SSLParameters params = sslSocket.getSSLParameters();
                    params.setServerNames(Collections.singletonList(new SNIHostName(sni)));
                    sslSocket.setSSLParameters(params);
                } catch (Exception e) {
                    Log.w(TAG, "Impossible de configurer SNI: " + e.getMessage());
                }
            }

            sslSocket.startHandshake();
            this.socket = sslSocket;
        } else {
            this.socket = rawSocket;
        }

        this.in = new BufferedInputStream(this.socket.getInputStream());
        this.out = new BufferedOutputStream(this.socket.getOutputStream());

        // 3. Handshake HTTP WebSocket Upgrade
        performWebSocketHandshake();
    }

    /**
     * Envoie la requête HTTP d'upgrade WebSocket et valide la réponse 101 Switching Protocols
     */
    private void performWebSocketHandshake() throws Exception {
        Log.i(TAG, "Établissement WebSocket (Path=" + wsPath + ", Host=" + wsHost + ")...");

        byte[] nonce = new byte[16];
        random.nextBytes(nonce);
        String wsKey = Base64.encodeToString(nonce, Base64.NO_WRAP);

        StringBuilder req = new StringBuilder();
        req.append("GET ").append(wsPath).append(" HTTP/1.1\r\n");
        req.append("Host: ").append(wsHost).append("\r\n");
        req.append("Upgrade: websocket\r\n");
        req.append("Connection: Upgrade\r\n");
        req.append("Sec-WebSocket-Key: ").append(wsKey).append("\r\n");
        req.append("Sec-WebSocket-Version: 13\r\n");
        req.append("User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36\r\n");
        req.append("\r\n");

        byte[] reqBytes = req.toString().getBytes("UTF-8");
        out.write(reqBytes);
        out.flush();

        // Lecture de la ligne de statut HTTP
        String statusLine = readLine(in);
        if (statusLine == null) {
            throw new IOException("Le serveur distant a fermé la connexion prématurément");
        }

        Log.i(TAG, "Réponse HTTP reçue: " + statusLine);
        if (!statusLine.contains("101")) {
            // Lecture des en-têtes d'erreur pour diagnostic précis
            StringBuilder errorDetails = new StringBuilder();
            String header;
            while ((header = readLine(in)) != null && !header.isEmpty()) {
                errorDetails.append(header).append("\n");
            }
            throw new IOException("Échec du handshake WebSocket: " + statusLine + "\n" + errorDetails);
        }

        // Lecture et consommation du reste des en-têtes HTTP jusqu'à la ligne vide \r\n
        String header;
        while ((header = readLine(in)) != null && !header.isEmpty()) {
            // en-têtes consommés
        }

        Log.i(TAG, "Tunnel WebSocket VLESS connecté avec succès !");
    }

    private String readLine(InputStream is) throws IOException {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        int b;
        while ((b = is.read()) != -1) {
            if (b == '\n') {
                break;
            }
            if (b != '\r') {
                baos.write(b);
            }
        }
        if (baos.size() == 0 && b == -1) {
            return null;
        }
        return baos.toString("UTF-8");
    }

    /**
     * Envoie une trame binaire WebSocket RFC 6455 (Opcode 0x02, Masquée)
     */
    public synchronized void sendBinary(byte[] data, int offset, int length) throws IOException {
        if (out == null || socket == null || socket.isClosed()) {
            throw new IOException("Socket fermé");
        }

        // En-tête de trame : FIN=1, Opcode=2 (Binary)
        out.write(0x82);

        // Masque activé (côté client) + Longueur
        byte[] mask = new byte[4];
        random.nextBytes(mask);

        if (length <= 125) {
            out.write(0x80 | length);
        } else if (length <= 65535) {
            out.write(0x80 | 126);
            out.write((length >> 8) & 0xFF);
            out.write(length & 0xFF);
        } else {
            out.write(0x80 | 127);
            for (int i = 7; i >= 0; i--) {
                out.write((int) ((length >> (8 * i)) & 0xFF));
            }
        }

        // Clé de masque 4 octets
        out.write(mask);

        // Données masquées par XOR
        byte[] masked = new byte[length];
        for (int i = 0; i < length; i++) {
            masked[i] = (byte) (data[offset + i] ^ mask[i % 4]);
        }
        out.write(masked);
        out.flush();
    }

    /**
     * Lit la prochaine charge utile d'une trame binaire WebSocket RFC 6455
     */
    public int readBinary(byte[] buffer) throws IOException {
        if (in == null || socket == null || socket.isClosed()) {
            return -1;
        }

        while (true) {
            int b0 = in.read();
            if (b0 == -1) return -1;

            int b1 = in.read();
            if (b1 == -1) return -1;

            int opcode = b0 & 0x0F;
            boolean isMasked = (b1 & 0x80) != 0;
            long payloadLen = b1 & 0x7F;

            if (payloadLen == 126) {
                int len0 = in.read();
                int len1 = in.read();
                if (len1 == -1) return -1;
                payloadLen = ((len0 & 0xFF) << 8) | (len1 & 0xFF);
            } else if (payloadLen == 127) {
                payloadLen = 0;
                for (int i = 0; i < 8; i++) {
                    int b = in.read();
                    if (b == -1) return -1;
                    payloadLen = (payloadLen << 8) | (b & 0xFF);
                }
            }

            byte[] maskKey = null;
            if (isMasked) {
                maskKey = new byte[4];
                readFully(in, maskKey, 0, 4);
            }

            // Gestion Ping (Opcode 9) -> Réponse automatique Pong (Opcode 10)
            if (opcode == 0x09) {
                byte[] pingData = new byte[(int) payloadLen];
                if (payloadLen > 0) {
                    readFully(in, pingData, 0, pingData.length);
                }
                sendPong(pingData);
                continue;
            }

            // Gestion Close (Opcode 8)
            if (opcode == 0x08) {
                return -1;
            }

            // Trame binaire (Opcode 2) ou Continuation (Opcode 0)
            int readLen = (int) Math.min(payloadLen, buffer.length);
            readFully(in, buffer, 0, readLen);

            if (isMasked && maskKey != null) {
                for (int i = 0; i < readLen; i++) {
                    buffer[i] = (byte) (buffer[i] ^ maskKey[i % 4]);
                }
            }

            // Si le buffer était plus petit que la trame, vider le reste
            long remaining = payloadLen - readLen;
            if (remaining > 0) {
                long skipped = in.skip(remaining);
            }

            return readLen;
        }
    }

    private void sendPong(byte[] data) {
        try {
            synchronized (this) {
                out.write(0x8A);
                byte[] mask = new byte[4];
                random.nextBytes(mask);
                int len = data != null ? data.length : 0;
                out.write(0x80 | (len & 0x7F));
                out.write(mask);
                if (data != null && len > 0) {
                    byte[] masked = new byte[len];
                    for (int i = 0; i < len; i++) {
                        masked[i] = (byte) (data[i] ^ mask[i % 4]);
                    }
                    out.write(masked);
                }
                out.flush();
            }
        } catch (Exception ignored) {}
    }

    private void readFully(InputStream is, byte[] b, int off, int len) throws IOException {
        int n = 0;
        while (n < len) {
            int count = is.read(b, off + n, len - n);
            if (count < 0) {
                throw new EOFException("Fin de flux inattendue dans la trame WebSocket");
            }
            n += count;
        }
    }

    public boolean isConnected() {
        return socket != null && !socket.isClosed() && socket.isConnected();
    }

    public void close() {
        try {
            if (socket != null && !socket.isClosed()) {
                socket.close();
            }
        } catch (Exception ignored) {}
    }
}
