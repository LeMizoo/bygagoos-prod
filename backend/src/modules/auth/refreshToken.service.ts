// backend/src/modules/auth/refreshToken.service.ts

import crypto from 'crypto';
import redis from '../../config/redis';

export class RefreshTokenService {
  private static readonly PREFIX = 'refresh_token:';
  private static readonly BLACKLIST_PREFIX = 'blacklist:';
  private static readonly REFRESH_TOKEN_EXPIRY = 60 * 60 * 24 * 7; // 7 jours en secondes

  /**
   * Génère un nouveau refresh token cryptographiquement sécurisé
   */
  static generateToken(): string {
    return crypto.randomBytes(64).toString('hex');
  }

  /**
   * Stocke un refresh token dans Redis avec une expiration de 7 jours
   */
  static async storeToken(userId: string, token: string): Promise<void> {
    try {
      const key = this.PREFIX + token;
      
      // Stocker avec métadonnées pour traçabilité
      await redis.setEx(
        key,
        this.REFRESH_TOKEN_EXPIRY,
        JSON.stringify({
          userId,
          createdAt: new Date().toISOString(),
          isValid: true,
          lastUsedAt: null
        })
      );
      
      console.log(`✅ Refresh token stocké pour l'utilisateur ${userId}`);
    } catch (error) {
      console.error('❌ Erreur lors du stockage du refresh token:', error);
      throw new Error('Impossible de stocker le refresh token');
    }
  }

  /**
   * Vérifie et récupère l'userId à partir d'un refresh token
   */
  static async verifyToken(token: string): Promise<string | null> {
    try {
      const key = this.PREFIX + token;
      const data = await redis.get(key);
      
      if (!data) {
        console.log('⚠️ Refresh token non trouvé ou expiré');
        return null;
      }

      // Parser les données JSON
      let tokenData;
      try {
        tokenData = JSON.parse(data);
      } catch {
        // Compatibilité ascendante avec l'ancien format (simple string)
        return data;
      }

      // Vérifier si le token est toujours valide
      if (!tokenData.isValid) {
        console.log('⚠️ Refresh token révoqué');
        return null;
      }

      // Mettre à jour la date de dernière utilisation (asynchrone, ne pas bloquer)
      this.updateLastUsed(key, tokenData).catch(console.error);

      return tokenData.userId;
    } catch (error) {
      console.error('❌ Erreur lors de la vérification du refresh token:', error);
      return null;
    }
  }

  /**
   * Met à jour la date de dernière utilisation (méthode interne)
   */
  private static async updateLastUsed(key: string, tokenData: any): Promise<void> {
    try {
      const ttl = await redis.ttl(key);
      if (ttl > 0) {
        await redis.setEx(
          key,
          ttl,
          JSON.stringify({
            ...tokenData,
            lastUsedAt: new Date().toISOString()
          })
        );
      }
    } catch (error) {
      // Non bloquant, on ignore l'erreur
      console.debug('Note: impossible de mettre à jour lastUsed');
    }
  }

  /**
   * Révoque un refresh token (logout)
   */
  static async revokeToken(token: string): Promise<boolean> {
    try {
      const key = this.PREFIX + token;
      const data = await redis.get(key);
      
      if (!data) {
        console.log('⚠️ Tentative de révocation d\'un token inexistant');
        return false;
      }

      // Parser les données
      let tokenData;
      try {
        tokenData = JSON.parse(data);
      } catch {
        // Ancien format, on supprime simplement
        await redis.del(key);
        console.log('✅ Refresh token supprimé (ancien format)');
        return true;
      }

      // Marquer comme invalide plutôt que supprimer (pour audit)
      await redis.setEx(
        key,
        this.REFRESH_TOKEN_EXPIRY, // Conserver l'expiration originale
        JSON.stringify({
          ...tokenData,
          isValid: false,
          revokedAt: new Date().toISOString()
        })
      );

      // Ajouter à la blacklist pour invalidation immédiate
      const blacklistKey = this.BLACKLIST_PREFIX + token;
      await redis.setEx(blacklistKey, this.REFRESH_TOKEN_EXPIRY, 'revoked');

      console.log(`✅ Refresh token révoqué avec succès`);
      return true;
    } catch (error) {
      console.error('❌ Erreur lors de la révocation du refresh token:', error);
      return false;
    }
  }

  /**
   * Vérifie si un token est blacklisté
   */
  static async isBlacklisted(token: string): Promise<boolean> {
    try {
      const blacklistKey = this.BLACKLIST_PREFIX + token;
      const result = await redis.get(blacklistKey);
      return result !== null;
    } catch (error) {
      console.error('❌ Erreur lors de la vérification de la blacklist:', error);
      return false;
    }
  }

  /**
   * Génère un nouveau token ET révoque l'ancien (rotation)
   */
  static async rotateToken(oldToken: string, userId: string): Promise<string> {
    try {
      // Révoquer l'ancien token
      await this.revokeToken(oldToken);

      // Générer et stocker le nouveau token
      const newToken = this.generateToken();
      await this.storeToken(userId, newToken);

      console.log(`🔄 Rotation de token effectuée pour l'utilisateur ${userId}`);
      return newToken;
    } catch (error) {
      console.error('❌ Erreur lors de la rotation du token:', error);
      throw new Error('Impossible d\'effectuer la rotation du token');
    }
  }

  /**
   * Révoque tous les tokens d'un utilisateur (sécurité)
   */
  static async revokeAllUserTokens(userId: string): Promise<number> {
    try {
      let revokedCount = 0;
      
      // Pattern matching pour trouver tous les tokens de l'utilisateur
      // Note: Cette opération peut être lourde si vous avez beaucoup de tokens
      // À utiliser avec parcimonie
      const keys = await redis.keys(this.PREFIX + '*');
      
      for (const key of keys) {
        const data = await redis.get(key);
        if (data) {
          try {
            const tokenData = JSON.parse(data);
            if (tokenData.userId === userId && tokenData.isValid !== false) {
              // Révoquer ce token
              await redis.setEx(
                key,
                this.REFRESH_TOKEN_EXPIRY,
                JSON.stringify({
                  ...tokenData,
                  isValid: false,
                  revokedAt: new Date().toISOString(),
                  revokedBy: 'batch'
                })
              );
              
              // Extraire le token de la clé
              const token = key.substring(this.PREFIX.length);
              const blacklistKey = this.BLACKLIST_PREFIX + token;
              await redis.setEx(blacklistKey, this.REFRESH_TOKEN_EXPIRY, 'revoked');
              
              revokedCount++;
            }
          } catch {
            // Ancien format, ignorer
            continue;
          }
        }
      }
      
      console.log(`✅ ${revokedCount} tokens révoqués pour l'utilisateur ${userId}`);
      return revokedCount;
    } catch (error) {
      console.error('❌ Erreur lors de la révocation des tokens:', error);
      return 0;
    }
  }

  /**
   * Nettoie les tokens expirés (utile pour les stats)
   */
  static async cleanup(): Promise<{ cleaned: number, remaining: number }> {
    try {
      const keys = await redis.keys(this.PREFIX + '*');
      let cleaned = 0;
      
      for (const key of keys) {
        const ttl = await redis.ttl(key);
        if (ttl <= 0) {
          await redis.del(key);
          cleaned++;
        }
      }
      
      const remaining = keys.length - cleaned;
      console.log(`🧹 Nettoyage: ${cleaned} tokens supprimés, ${remaining} restants`);
      
      return { cleaned, remaining };
    } catch (error) {
      console.error('❌ Erreur lors du nettoyage:', error);
      return { cleaned: 0, remaining: 0 };
    }
  }

  /**
   * Obtient des statistiques sur les tokens
   */
  static async getStats(): Promise<any> {
    try {
      const keys = await redis.keys(this.PREFIX + '*');
      const blacklistKeys = await redis.keys(this.BLACKLIST_PREFIX + '*');
      
      let validTokens = 0;
      let revokedTokens = 0;
      
      for (const key of keys) {
        const data = await redis.get(key);
        if (data) {
          try {
            const tokenData = JSON.parse(data);
            if (tokenData.isValid === false) {
              revokedTokens++;
            } else {
              validTokens++;
            }
          } catch {
            validTokens++; // Ancien format considéré comme valide
          }
        }
      }
      
      return {
        totalTokens: keys.length,
        validTokens,
        revokedTokens,
        blacklistedTokens: blacklistKeys.length,
        memory: 'Redis'
      };
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des stats:', error);
      return null;
    }
  }
}

export default RefreshTokenService;