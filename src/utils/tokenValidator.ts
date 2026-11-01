/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { TokenInfo } from '../types/vpn';

// Preset tokens for evaluation and demonstration
const REGISTERED_TOKENS: Record<string, Partial<TokenInfo>> = {
  'ATRS-VIP-7788-X99': {
    tier: 'VIP_CYBER',
    status: 'active',
    expiresAt: '2027-11-01T00:00:00Z',
    maxSpeedMbps: 10000,
    devicesLimit: 10,
    vipServersUnlocked: true,
  },
  'ATRS-PRO-2026-NEO': {
    tier: 'PRO',
    status: 'active',
    expiresAt: '2027-04-15T00:00:00Z',
    maxSpeedMbps: 2500,
    devicesLimit: 5,
    vipServersUnlocked: true,
  },
  'ATRS-EXP-0000-OLD': {
    tier: 'PRO',
    status: 'expired',
    expiresAt: '2025-01-01T00:00:00Z',
    maxSpeedMbps: 1000,
    devicesLimit: 3,
    vipServersUnlocked: false,
  },
};

export interface TokenValidationResponse {
  valid: boolean;
  message: string;
  tokenInfo?: TokenInfo;
  isSimulatedBackend: boolean;
}

export class TokenValidator {
  /**
   * Validate token via simulated backend verification endpoint.
   * Clearly flags if using local simulation backend vs live cloud endpoint.
   */
  public static async validateToken(inputToken: string): Promise<TokenValidationResponse> {
    const cleaned = inputToken.trim().toUpperCase();

    // Emulate realistic network latency to simulate backend auth server
    await new Promise((resolve) => setTimeout(resolve, 800));

    if (!cleaned) {
      return {
        valid: false,
        message: 'Veuillez saisir un token d\'activation Antares valide.',
        isSimulatedBackend: true,
      };
    }

    // Check token format: ATRS-XXXX-XXXX-XXX or similar pattern
    const tokenRegex = /^ATRS-[A-Z0-9]{3,4}-[A-Z0-9]{4}-[A-Z0-9]{3,4}$/;
    if (!tokenRegex.test(cleaned)) {
      return {
        valid: false,
        message: 'Format de token invalide. Format attendu : ATRS-XXXX-XXXX-XXX (ex: ATRS-VIP-7788-X99).',
        isSimulatedBackend: true,
      };
    }

    const match = REGISTERED_TOKENS[cleaned];
    if (!match) {
      return {
        valid: false,
        message: 'Token inexistant ou révoqué par le serveur d\'authentification Antares.',
        isSimulatedBackend: true,
      };
    }

    if (match.status === 'expired') {
      return {
        valid: false,
        message: `Ce token est expiré depuis le ${new Date(match.expiresAt!).toLocaleDateString('fr-FR')}.`,
        isSimulatedBackend: true,
      };
    }

    const fullInfo: TokenInfo = {
      token: cleaned,
      tier: match.tier || 'PRO',
      status: 'active',
      expiresAt: match.expiresAt || '2027-12-31T23:59:59Z',
      maxSpeedMbps: match.maxSpeedMbps || 2500,
      devicesLimit: match.devicesLimit || 5,
      vipServersUnlocked: Boolean(match.vipServersUnlocked),
    };

    return {
      valid: true,
      message: `Token validé avec succès ! Accès ${fullInfo.tier} actif jusqu'au ${new Date(fullInfo.expiresAt).toLocaleDateString('fr-FR')}.`,
      tokenInfo: fullInfo,
      isSimulatedBackend: true,
    };
  }
}
