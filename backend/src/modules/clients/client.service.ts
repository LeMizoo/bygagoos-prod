import { Types } from 'mongoose';
import Client, { IClient } from './client.model';
import { CreateClientDto, UpdateClientDto, QueryClientDto, ClientResponseDTO } from './dto';
import { AppError } from '../../core/utils/errors/AppError';
import { HTTP_STATUS } from '../../core/constants/httpStatus';
import logger from '../../core/utils/logger';
import { UserRole } from '../../core/types/userRoles';
import eventEmitter, { AppEvent } from '../../core/utils/eventEmitter';

export class ClientService {
  private buildScopeFilter(userId: string, role?: UserRole): Record<string, unknown> {
    if (role === UserRole.SUPER_ADMIN || role === UserRole.ADMIN) {
      return {};
    }

    return { user: new Types.ObjectId(userId) };
  }

  /**
   * Récupère tous les clients d'un utilisateur
   */
  async findAll(userId: string, query: QueryClientDto, role?: UserRole): Promise<{
    clients: ClientResponseDTO[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    try {
      const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc', search, isActive, tags } = query;
      const skip = (page - 1) * limit;

      // Construction du filtre
      const filter: any = this.buildScopeFilter(userId, role);
      
      if (isActive !== undefined) {
        filter.isActive = isActive;
      }

      if (tags && tags.length > 0) {
        filter.tags = { $in: tags };
      }
      
      if (search) {
        filter.$or = [
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { company: { $regex: search, $options: 'i' } }
        ];
      }

      // Construction du tri
      const sort: any = {};
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

      // Exécution des requêtes
      const [clients, total] = await Promise.all([
        Client.find(filter)
          .sort(sort)
          .skip(skip)
          .limit(limit)
          .lean(),
        Client.countDocuments(filter)
      ]);
      
      // Transformation
      let transformedClients;
      try {
        transformedClients = clients.map((client, index) => {
          try {
            return new ClientResponseDTO(client);
          } catch (transformError) {
            logger.error(`Erreur lors de la transformation du client ${index}:`, transformError);
            return null; // Retourner null pour les clients qui causent des erreurs
          }
        }).filter(client => client !== null); // Filtrer les null
      } catch (error) {
        logger.error('Erreur dans le processus de transformation:', error);
        throw error;
      }

      const totalPages = Math.ceil(total / limit);

      return {
        clients: transformedClients,
        total,
        page,
        limit,
        totalPages
      };
    } catch (error) {
      logger.error('Erreur dans findAll clients:', error);
      throw new AppError('Erreur lors de la récupération des clients', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Récupère un client par son ID
   */
  async findById(id: string, userId: string, role?: UserRole): Promise<ClientResponseDTO> {
    try {
      if (!Types.ObjectId.isValid(id)) {
        throw new AppError('ID de client invalide', HTTP_STATUS.BAD_REQUEST);
      }

      const client = await Client.findOne({
        _id: id,
        ...this.buildScopeFilter(userId, role)
      }).lean();

      if (!client) {
        throw new AppError('Client non trouvé', HTTP_STATUS.NOT_FOUND);
      }

      return new ClientResponseDTO(client);
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Erreur dans findById client:', error);
      throw new AppError('Erreur lors de la récupération du client', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Crée un nouveau client
   */
  async create(userId: string, data: CreateClientDto, createdBy: string): Promise<ClientResponseDTO> {
    try {
      // V?rifier si l'email existe d?j? pour cet utilisateur
      const existingClient = await Client.findOne({
        email: data.email,
        user: new Types.ObjectId(userId)
      });

      if (existingClient) {
        throw new AppError('Un client avec cet email existe d?j?', HTTP_STATUS.CONFLICT);
      }

      // Cr?er le client
      const client = await Client.create({
        ...data,
        user: new Types.ObjectId(userId),
        createdBy: new Types.ObjectId(createdBy),
        tags: data.tags || []
      });

      logger.info(`Nouveau client cr??: ${client.email} par utilisateur ${userId}`);
      // Émettre l'événement de création
      eventEmitter.emit(AppEvent.CLIENT_CREATED, {
        clientId: client._id.toString(),
        clientName: `${client.firstName} ${client.lastName}`,
        userId
      });
      return new ClientResponseDTO(client.toObject());
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Erreur dans create client:', error);
      throw new AppError('Erreur lors de la cr?ation du client', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Met à jour un client existant
   */
  async update(id: string, userId: string, data: UpdateClientDto, role?: UserRole): Promise<ClientResponseDTO> {
    try {
      if (!Types.ObjectId.isValid(id)) {
        throw new AppError('ID de client invalide', HTTP_STATUS.BAD_REQUEST);
      }

      // Vérifier si l'email existe déjà pour un autre client
      if (data.email) {
        const existingClient = await Client.findOne({
          email: data.email,
          ...this.buildScopeFilter(userId, role),
          _id: { $ne: id }
        });

        if (existingClient) {
          throw new AppError('Un client avec cet email existe déjà', HTTP_STATUS.CONFLICT);
        }
      }

      // Mettre à jour le client
      const client = await Client.findOneAndUpdate(
        { _id: id, ...this.buildScopeFilter(userId, role) },
        { $set: data },
        { new: true, runValidators: true }
      ).lean();

      if (!client) {
        throw new AppError('Client non trouvé', HTTP_STATUS.NOT_FOUND);
      }

      logger.info(`Client mis à jour: ${client.email}`);

      // Émettre l'événement de mise à jour
      eventEmitter.emit(AppEvent.CLIENT_UPDATED, {
        clientId: id,
        changes: data
      });

      return new ClientResponseDTO(client);
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Erreur dans update client:', error);
      throw new AppError('Erreur lors de la mise à jour du client', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Supprime un client (soft delete)
   */
  async delete(id: string, userId: string, role?: UserRole): Promise<void> {
    try {
      if (!Types.ObjectId.isValid(id)) {
        throw new AppError('ID de client invalide', HTTP_STATUS.BAD_REQUEST);
      }

      const result = await Client.findOneAndUpdate(
        { _id: id, ...this.buildScopeFilter(userId, role) },
        { isActive: false },
        { new: true }
      );

      if (!result) {
        throw new AppError('Client non trouvé', HTTP_STATUS.NOT_FOUND);
      }

      logger.info(`Client désactivé: ${result.email}`);

      // Émettre l'événement de suppression
      eventEmitter.emit(AppEvent.CLIENT_DELETED, {
        clientId: id
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Erreur dans delete client:', error);
      throw new AppError('Erreur lors de la suppression du client', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Récupère les statistiques des clients
   */
  async getStats(userId: string, role?: UserRole): Promise<{
    total: number;
    active: number;
    withCompany: number;
    recent: number;
    tags: Record<string, number>;
  }> {
    try {
      const scopeFilter = this.buildScopeFilter(userId, role);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const [total, active, withCompany, recent, tagAggregation] = await Promise.all([
        Client.countDocuments(scopeFilter),
        Client.countDocuments({ ...scopeFilter, isActive: true }),
        Client.countDocuments({ 
          ...scopeFilter,
          $and: [
            { company: { $exists: true } },
            { company: { $ne: null } },
            { company: { $ne: '' } }
          ]
        }),
        Client.countDocuments({
          ...scopeFilter,
          createdAt: { $gte: thirtyDaysAgo }
        }),
        Client.aggregate([
          { $match: scopeFilter },
          { $unwind: '$tags' },
          { $group: { _id: '$tags', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 10 }
        ])
      ]);

      const tags: Record<string, number> = {};
      tagAggregation.forEach((item: any) => {
        tags[item._id] = item.count;
      });

      return {
        total,
        active,
        withCompany,
        recent,
        tags
      };
    } catch (error) {
      logger.error('Erreur dans getStats clients:', error);
      throw new AppError('Erreur lors de la récupération des statistiques', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Recherche des clients
   */
  async search(userId: string, term: string, limit: number = 10, role?: UserRole): Promise<ClientResponseDTO[]> {
    try {
      const clients = await Client.find({
        ...this.buildScopeFilter(userId, role),
        isActive: true,
        $or: [
          { firstName: { $regex: term, $options: 'i' } },
          { lastName: { $regex: term, $options: 'i' } },
          { email: { $regex: term, $options: 'i' } },
          { company: { $regex: term, $options: 'i' } }
        ]
      })
      .limit(limit)
      .lean();

      return clients.map(client => new ClientResponseDTO(client));
    } catch (error) {
      logger.error('Erreur dans search clients:', error);
      throw new AppError('Erreur lors de la recherche des clients', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }

}