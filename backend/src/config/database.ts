import mongoose from 'mongoose';
import { env } from './env';

export const connectDatabase = async (): Promise<void> => {
  try {
    mongoose.set('strictQuery', true);
    
    await mongoose.connect(env.MONGODB_URI);
    console.log('✅ Connecté à MongoDB');
    
    mongoose.connection.on('error', (error) => {
      console.error('❌ Erreur MongoDB:', error);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('🔌 Déconnecté de MongoDB');
    });
    
    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('👋 Connexion MongoDB fermée');
      process.exit(0);
    });
  } catch (error) {
    console.error('❌ Erreur de connexion MongoDB:', error);
    process.exit(1);
  }
};
console.log(`✅ Connecté à MongoDB : ${mongoose.connection.db?.databaseName}`);