// backend/src/modules/auth/refreshToken.service.ts

import crypto from 'crypto';
import redis from '../../config/redis';

interface TokenData {
  userId: string;
  createdAt: string;
  isValid: boolean;
  lastUsedAt: string | null;
  revokedAt?: string;
}

export class RefreshTokenService {
  private static readonly PREFIX = 'refresh_token:';
  private static readonly BLACKLIST_PREFIX = 'blacklist:';
  private static readonly REFRESH_TOKEN_EXPIRY = 60 * 60 * 24 * 7; // 7 jours

  static generateToken(): string {
    return crypto.randomBytes(64).toString('hex');
  }

  static async storeToken(userId: string, token: string): Promise<void> {
    try {
      const key = this.PREFIX + token;
      const data: TokenData = {
        userId,
        createdAt: new Date().toISOString(),
        isValid: true,
        lastUsedAt: null
      };

      await redis.set(
        key,
        JSON.stringify(data),
        { ttl: this.REFRESH_TOKEN_EXPIRY }
      );
      
      console.log(`✅ Refresh token stocké pour l'utilisateur ${userId}`);
    } catch (error) {
      console.error('❌ Erreur lors du stockage du refresh token:', error);
      throw new Error('Impossible de stocker le refresh token');
    }
  }

  static async verifyToken(token: string): Promise<string | null> {
    try {
      const key = this.PREFIX + token;
      const data = await redis.get(key);
      
      if (!data) return null;

      let tokenData: TokenData;
      try {
        tokenData = JSON.parse(data);
      } catch {
        // Fallback si c'est une simple string (userId)
        return data;
      }

      if (!tokenData.isValid) return null;

      // Update asynchrone
      this.updateLastUsed(key, tokenData).catch(() => {});

      return tokenData.userId;
    } catch (error) {
      console.error('❌ Erreur vérification token:', error);
      return null;
    }
  }

  private static async updateLastUsed(key: string, tokenData: TokenData): Promise<void> {
    try {
      const updated: TokenData = {
        ...tokenData,
        lastUsedAt: new Date().toISOString()
      };
      await redis.set(key, JSON.stringify(updated), { ttl: this.REFRESH_TOKEN_EXPIRY });
    } catch {
      console.debug('Note: updateLastUsed échoué');
    }
  }

  static async revokeToken(token: string): Promise<boolean> {
    try {
      const key = this.PREFIX + token;
      const data = await redis.get(key);
      
      if (!data) return false;

      let tokenData: TokenData;
      try {
        tokenData = JSON.parse(data);
        const revoked: TokenData = { ...tokenData, isValid: false, revokedAt: new Date().toISOString() };
        await redis.set(key, JSON.stringify(revoked), { ttl: this.REFRESH_TOKEN_EXPIRY });
      } catch {
        await redis.del(key);
      }

      const blacklistKey = this.BLACKLIST_PREFIX + token;
      await redis.set(blacklistKey, 'revoked', { ttl: this.REFRESH_TOKEN_EXPIRY });

      return true;
    } catch {
      return false;
    }
  }

  static async rotateToken(oldToken: string, userId: string): Promise<string> {
    await this.revokeToken(oldToken);
    const newToken = this.generateToken();
    await this.storeToken(userId, newToken);
    return newToken;
  }

  static async revokeAllUserTokens(_userId: string): Promise<number> {
    // Note: Nécessite un index userId -> tokens dans Redis pour être efficace
    return 0;
  }
}

export default RefreshTokenService;