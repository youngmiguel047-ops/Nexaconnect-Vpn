package com.antares.vpn;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.ByteBuffer;
import java.security.MessageDigest;
import java.util.UUID;

/**
 * VlessProtocol
 * Implémentation du protocole VLESS (v0) pour le transport TCP et UDP.
 * Spécification standard VLESS (Xray-core / v2ray / sing-box).
 */
public class VlessProtocol {

    public static final byte VERSION = 0x00;
    public static final byte CMD_TCP = 0x01;
    public static final byte CMD_UDP = 0x02;
    public static final byte CMD_MUX = 0x03;

    public static final byte ADDR_TYPE_IPV4 = 0x01;
    public static final byte ADDR_TYPE_DOMAIN = 0x02;
    public static final byte ADDR_TYPE_IPV6 = 0x03;

    /**
     * Convertit un identifiant client (UUID standard ou chaîne personnalisée) en 16 octets binaires
     */
    public static byte[] parseUuid(String uuidStr) {
        if (uuidStr == null || uuidStr.trim().isEmpty()) {
            uuidStr = "b831381d-6324-4d53-ad4f-8cda48b30811";
        }
        uuidStr = uuidStr.trim();

        // 1. Essai UUID standard (36 caractères avec tirets)
        try {
            UUID u = UUID.fromString(uuidStr);
            ByteBuffer bb = ByteBuffer.wrap(new byte[16]);
            bb.putLong(u.getMostSignificantBits());
            bb.putLong(u.getLeastSignificantBits());
            return bb.array();
        } catch (Exception ignored) {}

        // 2. Essai Hexadécimal 32 caractères
        String hexClean = uuidStr.replace("-", "").trim();
        if (hexClean.length() == 32) {
            try {
                byte[] b = new byte[16];
                for (int i = 0; i < 16; i++) {
                    b[i] = (byte) Integer.parseInt(hexClean.substring(i * 2, i * 2 + 2), 16);
                }
                return b;
            } catch (Exception ignored) {}
        }

        // 3. Chaîne personnalisée (ex: @abess237) -> Hachage MD5 déterministe de 16 octets
        try {
            MessageDigest md5 = MessageDigest.getInstance("MD5");
            return md5.digest(uuidStr.getBytes("UTF-8"));
        } catch (Exception e) {
            byte[] fallback = new byte[16];
            byte[] src = uuidStr.getBytes();
            System.arraycopy(src, 0, fallback, 0, Math.min(src.length, 16));
            return fallback;
        }
    }

    /**
     * Construit l'en-tête de requête VLESS v0 avec destination IPv4
     */
    public static byte[] buildRequestHeaderIpv4(byte[] uuidBytes, byte command, byte[] destIp4, int destPort) throws IOException {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        out.write(VERSION);
        out.write(uuidBytes); // 16 octets
        out.write(0x00);       // Addons length = 0
        out.write(command);    // CMD_TCP (0x01) ou CMD_UDP (0x02)
        out.write((destPort >> 8) & 0xFF);
        out.write(destPort & 0xFF);
        out.write(ADDR_TYPE_IPV4);
        out.write(destIp4);    // 4 octets
        return out.toByteArray();
    }

    /**
     * Construit l'en-tête de requête VLESS v0 avec nom de domaine (pour DNS / SNI)
     */
    public static byte[] buildRequestHeaderDomain(byte[] uuidBytes, byte command, String domain, int destPort) throws IOException {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        out.write(VERSION);
        out.write(uuidBytes); // 16 octets
        out.write(0x00);       // Addons length = 0
        out.write(command);    // CMD_TCP ou CMD_UDP
        out.write((destPort >> 8) & 0xFF);
        out.write(destPort & 0xFF);
        out.write(ADDR_TYPE_DOMAIN);
        byte[] domainBytes = domain.getBytes("UTF-8");
        out.write(domainBytes.length & 0xFF);
        out.write(domainBytes);
        return out.toByteArray();
    }
}
