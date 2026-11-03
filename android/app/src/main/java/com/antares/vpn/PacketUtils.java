package com.antares.vpn;

import java.nio.ByteBuffer;

/**
 * PacketUtils
 * Analyseur et constructeur de paquets IP (IPv4), TCP et UDP pour l'interface TUN Android.
 */
public class PacketUtils {

    public static final int PROTOCOL_ICMP = 1;
    public static final int PROTOCOL_TCP = 6;
    public static final int PROTOCOL_UDP = 17;

    public static final int TCP_FLAG_FIN = 0x01;
    public static final int TCP_FLAG_SYN = 0x02;
    public static final int TCP_FLAG_RST = 0x04;
    public static final int TCP_FLAG_PSH = 0x08;
    public static final int TCP_FLAG_ACK = 0x10;
    public static final int TCP_FLAG_URG = 0x20;

    public static class ParsedPacket {
        public int version;
        public int protocol;
        public byte[] srcIp = new byte[4];
        public byte[] dstIp = new byte[4];
        public int srcPort;
        public int dstPort;
        public int ipHeaderLen;
        public int transportHeaderLen;
        public int totalLength;
        public int flags; // TCP flags
        public long seqNumber;
        public long ackNumber;
        public byte[] payload;
    }

    public static ParsedPacket parse(byte[] buffer, int length) {
        if (length < 20) return null;
        int version = (buffer[0] >> 4) & 0x0F;
        if (version != 4) return null; // Uniquement IPv4 pour ce transport

        ParsedPacket p = new ParsedPacket();
        p.version = 4;
        p.ipHeaderLen = (buffer[0] & 0x0F) * 4;
        if (length < p.ipHeaderLen) return null;

        p.totalLength = ((buffer[2] & 0xFF) << 8) | (buffer[3] & 0xFF);
        if (p.totalLength > length) {
            p.totalLength = length;
        }

        p.protocol = buffer[9] & 0xFF;
        System.arraycopy(buffer, 12, p.srcIp, 0, 4);
        System.arraycopy(buffer, 16, p.dstIp, 0, 4);

        int pos = p.ipHeaderLen;

        if (p.protocol == PROTOCOL_UDP && length >= pos + 8) {
            p.srcPort = ((buffer[pos] & 0xFF) << 8) | (buffer[pos + 1] & 0xFF);
            p.dstPort = ((buffer[pos + 2] & 0xFF) << 8) | (buffer[pos + 3] & 0xFF);
            int udpLen = ((buffer[pos + 4] & 0xFF) << 8) | (buffer[pos + 5] & 0xFF);
            p.transportHeaderLen = 8;
            int payloadLen = Math.max(0, udpLen - 8);
            if (pos + 8 + payloadLen <= p.totalLength) {
                p.payload = new byte[payloadLen];
                System.arraycopy(buffer, pos + 8, p.payload, 0, payloadLen);
            }
        } else if (p.protocol == PROTOCOL_TCP && length >= pos + 20) {
            p.srcPort = ((buffer[pos] & 0xFF) << 8) | (buffer[pos + 1] & 0xFF);
            p.dstPort = ((buffer[pos + 2] & 0xFF) << 8) | (buffer[pos + 3] & 0xFF);
            p.seqNumber = (((long)(buffer[pos + 4] & 0xFF) << 24) |
                           ((long)(buffer[pos + 5] & 0xFF) << 16) |
                           ((long)(buffer[pos + 6] & 0xFF) << 8)  |
                           ((long)(buffer[pos + 7] & 0xFF)));
            p.ackNumber = (((long)(buffer[pos + 8] & 0xFF) << 24) |
                           ((long)(buffer[pos + 9] & 0xFF) << 16) |
                           ((long)(buffer[pos + 10] & 0xFF) << 8) |
                           ((long)(buffer[pos + 11] & 0xFF)));

            p.transportHeaderLen = ((buffer[pos + 12] >> 4) & 0x0F) * 4;
            p.flags = buffer[pos + 13] & 0xFF;

            int payloadOffset = pos + p.transportHeaderLen;
            int payloadLen = Math.max(0, p.totalLength - payloadOffset);
            if (payloadLen > 0 && payloadOffset + payloadLen <= length) {
                p.payload = new byte[payloadLen];
                System.arraycopy(buffer, payloadOffset, p.payload, 0, payloadLen);
            } else {
                p.payload = new byte[0];
            }
        }

        return p;
    }

    /**
     * Construit un paquet IPv4 UDP pour renvoyer une réponse (ex: réponse DNS) vers le téléphone
     */
    public static byte[] buildUdpPacket(byte[] srcIp, int srcPort, byte[] dstIp, int dstPort, byte[] payload) {
        int udpLen = 8 + (payload != null ? payload.length : 0);
        int totalLen = 20 + udpLen;
        byte[] packet = new byte[totalLen];

        // 1. En-tête IPv4 (20 octets)
        packet[0] = 0x45; // Version 4, IHL 5
        packet[1] = 0x00; // DSCP / ECN
        packet[2] = (byte) ((totalLen >> 8) & 0xFF);
        packet[3] = (byte) (totalLen & 0xFF);
        packet[4] = 0x00; // Identification
        packet[5] = 0x01;
        packet[6] = 0x40; // Flags: Don't Fragment
        packet[7] = 0x00;
        packet[8] = 0x40; // TTL: 64
        packet[9] = (byte) PROTOCOL_UDP;
        packet[10] = 0x00; // Checksum (temporaire 0)
        packet[11] = 0x00;
        System.arraycopy(srcIp, 0, packet, 12, 4);
        System.arraycopy(dstIp, 0, packet, 16, 4);

        int ipCheck = calculateChecksum(packet, 0, 20);
        packet[10] = (byte) ((ipCheck >> 8) & 0xFF);
        packet[11] = (byte) (ipCheck & 0xFF);

        // 2. En-tête UDP (8 octets)
        packet[20] = (byte) ((srcPort >> 8) & 0xFF);
        packet[21] = (byte) (srcPort & 0xFF);
        packet[22] = (byte) ((dstPort >> 8) & 0xFF);
        packet[23] = (byte) (dstPort & 0xFF);
        packet[24] = (byte) ((udpLen >> 8) & 0xFF);
        packet[25] = (byte) (udpLen & 0xFF);
        packet[26] = 0x00; // Checksum UDP facultatif (0 = désactivé en IPv4)
        packet[27] = 0x00;

        if (payload != null && payload.length > 0) {
            System.arraycopy(payload, 0, packet, 28, payload.length);
        }

        return packet;
    }

    /**
     * Construit un paquet IPv4 TCP (SYN-ACK, ACK, PSH-ACK Data, ou FIN-ACK) vers le téléphone
     */
    public static byte[] buildTcpPacket(
            byte[] srcIp, int srcPort,
            byte[] dstIp, int dstPort,
            long seqNum, long ackNum,
            int flags,
            byte[] payload
    ) {
        int payloadLen = (payload != null) ? payload.length : 0;
        int tcpHeaderLen = 20;
        int totalLen = 20 + tcpHeaderLen + payloadLen;
        byte[] packet = new byte[totalLen];

        // 1. En-tête IPv4
        packet[0] = 0x45;
        packet[1] = 0x00;
        packet[2] = (byte) ((totalLen >> 8) & 0xFF);
        packet[3] = (byte) (totalLen & 0xFF);
        packet[4] = 0x00;
        packet[5] = 0x02;
        packet[6] = 0x40; // DF
        packet[7] = 0x00;
        packet[8] = 0x40; // TTL: 64
        packet[9] = (byte) PROTOCOL_TCP;
        packet[10] = 0x00;
        packet[11] = 0x00;
        System.arraycopy(srcIp, 0, packet, 12, 4);
        System.arraycopy(dstIp, 0, packet, 16, 4);

        int ipCheck = calculateChecksum(packet, 0, 20);
        packet[10] = (byte) ((ipCheck >> 8) & 0xFF);
        packet[11] = (byte) (ipCheck & 0xFF);

        // 2. En-tête TCP
        int pos = 20;
        packet[pos] = (byte) ((srcPort >> 8) & 0xFF);
        packet[pos + 1] = (byte) (srcPort & 0xFF);
        packet[pos + 2] = (byte) ((dstPort >> 8) & 0xFF);
        packet[pos + 3] = (byte) (dstPort & 0xFF);

        packet[pos + 4] = (byte) ((seqNum >> 24) & 0xFF);
        packet[pos + 5] = (byte) ((seqNum >> 16) & 0xFF);
        packet[pos + 6] = (byte) ((seqNum >> 8) & 0xFF);
        packet[pos + 7] = (byte) (seqNum & 0xFF);

        packet[pos + 8] = (byte) ((ackNum >> 24) & 0xFF);
        packet[pos + 9] = (byte) ((ackNum >> 16) & 0xFF);
        packet[pos + 10] = (byte) ((ackNum >> 8) & 0xFF);
        packet[pos + 11] = (byte) (ackNum & 0xFF);

        packet[pos + 12] = 0x50; // Data offset = 5 (20 octets), Reserved 0
        packet[pos + 13] = (byte) (flags & 0xFF);

        // Window size (ex: 65535)
        packet[pos + 14] = (byte) 0xFF;
        packet[pos + 15] = (byte) 0xFF;

        packet[pos + 16] = 0x00; // Checksum
        packet[pos + 17] = 0x00;
        packet[pos + 18] = 0x00; // Urgent pointer
        packet[pos + 19] = 0x00;

        if (payloadLen > 0) {
            System.arraycopy(payload, 0, packet, pos + 20, payloadLen);
        }

        // Calcul du checksum TCP avec pseudo-en-tête IP
        int tcpCheck = calculateTcpChecksum(packet, srcIp, dstIp, pos, tcpHeaderLen + payloadLen);
        packet[pos + 16] = (byte) ((tcpCheck >> 8) & 0xFF);
        packet[pos + 17] = (byte) (tcpCheck & 0xFF);

        return packet;
    }

    public static int calculateChecksum(byte[] buf, int offset, int length) {
        long sum = 0;
        int i = offset;
        while (i < offset + length - 1) {
            sum += ((buf[i] & 0xFF) << 8) | (buf[i + 1] & 0xFF);
            i += 2;
        }
        if (i < offset + length) {
            sum += (buf[i] & 0xFF) << 8;
        }
        while ((sum >> 16) != 0) {
            sum = (sum & 0xFFFF) + (sum >> 16);
        }
        return (int) (~sum & 0xFFFF);
    }

    public static int calculateTcpChecksum(byte[] packet, byte[] srcIp, byte[] dstIp, int tcpOffset, int tcpLen) {
        long sum = 0;

        // Pseudo-en-tête
        sum += ((srcIp[0] & 0xFF) << 8) | (srcIp[1] & 0xFF);
        sum += ((srcIp[2] & 0xFF) << 8) | (srcIp[3] & 0xFF);
        sum += ((dstIp[0] & 0xFF) << 8) | (dstIp[1] & 0xFF);
        sum += ((dstIp[2] & 0xFF) << 8) | (dstIp[3] & 0xFF);
        sum += PROTOCOL_TCP;
        sum += tcpLen;

        // Données TCP
        int i = tcpOffset;
        while (i < tcpOffset + tcpLen - 1) {
            sum += ((packet[i] & 0xFF) << 8) | (packet[i + 1] & 0xFF);
            i += 2;
        }
        if (i < tcpOffset + tcpLen) {
            sum += (packet[i] & 0xFF) << 8;
        }

        while ((sum >> 16) != 0) {
            sum = (sum & 0xFFFF) + (sum >> 16);
        }
        return (int) (~sum & 0xFFFF);
    }
}
