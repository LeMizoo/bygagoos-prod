// backend/src/jobs/emailReminders.ts

import cron from 'node-cron';
import { EmailService } from '../services/email.service';

// Exécuter tous les jours à 9h
cron.schedule('0 9 * * *', async () => {
  console.log('🔄 Exécution des rappels automatiques...');
  
  try {
    await EmailService.sendReminders();
    console.log('✅ Rappels envoyés avec succès');
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi des rappels:', error);
  }
});