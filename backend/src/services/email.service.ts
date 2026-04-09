import nodemailer from 'nodemailer';
import { createTransporter, EmailTemplate } from '../core/config/email';
import { orderTemplates } from './email/templates/orderTemplates';
import User, { IUser } from '../modules/users/user.model'; // Chemin vérifié vers le modèle utilisateur
import Order from '../modules/orders/order.model';
import SMTPTransport from 'nodemailer/lib/smtp-transport';

export class EmailService {
  private static transporter: nodemailer.Transporter<SMTPTransport.SentMessageInfo>;

  /**
   * Initialise le transporteur de manière asynchrone
   */
  static async initialize(): Promise<void> {
    if (!this.transporter) {
      this.transporter = await createTransporter();
    }
  }

  /**
   * Envoi de base d'un email
   */
  static async sendEmail(to: string | string[], template: EmailTemplate) {
    await this.initialize();

    const recipients = Array.isArray(to) ? to : [to];

    const mailOptions = {
      from: `"ByGagoos-Ink" <${process.env.SMTP_FROM}>`,
      to: recipients.join(', '),
      subject: template.subject,
      html: template.html,
      text: template.text || template.html.replace(/<[^>]*>/g, '')
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      
      if (process.env.NODE_ENV !== 'production') {
        console.log('Email envoyé. URL de test :', nodemailer.getTestMessageUrl(info));
      }
      
      return info;
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'email :', error);
      throw error;
    }
  }

  /**
   * Notification après création d'une commande
   */
  static async sendOrderCreated(orderId: string): Promise<void> {
    const order = await Order.findById(orderId)
      .populate('client')
      .populate('designs.design');

    if (!order || !order.client) return;

    const client = order.client as any;
    
    // Notification Client
    await this.sendEmail(
      client.email,
      orderTemplates.orderCreated({ order, client })
    );

    // Notification Administrateurs
    const admins = await User.find({ 
      role: { $in: ['ADMIN', 'SUPER_ADMIN'] },
      isActive: true 
    });

    if (admins.length > 0) {
      await this.sendEmail(
        admins.map((admin: IUser) => admin.email),
        orderTemplates.orderCreated({ 
          order, 
          client,
          isAdmin: true 
        })
      );
    }
  }

  /**
   * Notification de changement de statut de commande
   */
  static async sendOrderStatusChanged(
    orderId: string, 
    oldStatus: string, 
    newStatus: string,
    comment?: string
  ): Promise<void> {
    const order = await Order.findById(orderId).populate('client');
    if (!order || !order.client) return;

    const client = order.client as any;
    
    await this.sendEmail(
      client.email,
      orderTemplates.orderStatusChanged({ 
        order, 
        client,
        oldStatus,
        newStatus,
        comment
      })
    );
  }

  /**
   * Notification pour un nouveau message dans le chat
   */
  static async sendNewMessage(orderId: string, messageId: string): Promise<void> {
    const order = await Order.findById(orderId)
      .populate('client')
      .populate('messages.user');

    if (!order) return;

    const message = (order as any).messages.find((m: any) => m._id.toString() === messageId);
    if (!message) return;

    const sender = message.user as any;
    const recipient = order.client as any;

    // Email au client si l'admin répond
    if (recipient._id.toString() !== sender._id.toString()) {
      await this.sendEmail(
        recipient.email,
        orderTemplates.newMessage({
          order,
          recipient,
          sender,
          message
        })
      );
    }

    // Email aux admins si le client écrit
    if (sender.role === 'CLIENT') {
      const admins = await User.find({ 
        role: { $in: ['ADMIN', 'SUPER_ADMIN'] },
        isActive: true 
      });

      if (admins.length > 0) {
        await this.sendEmail(
          admins.map((admin: IUser) => admin.email),
          orderTemplates.newMessage({
            order,
            recipient: { firstName: 'Equipe', role: 'ADMIN' } as any,
            sender,
            message
          })
        );
      }
    }
  }

  /**
   * Tâche de rappel pour les commandes en attente de revue
   */
  static async sendReminders(): Promise<void> {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const orders = await Order.find({
      status: 'REVIEW',
      updatedAt: { $lte: sevenDaysAgo },
      isActive: true
    }).populate('client');

    for (const order of orders) {
      const client = order.client as any;
      
      await this.sendEmail(
        client.email,
        orderTemplates.orderReminder({ order, client })
      );

      // Logique automatique : passage en modification si pas de réponse
      order.status = 'MODIFICATION' as any;
      if ('history' in order) {
        (order.history as any).push({
          status: 'MODIFICATION',
          changedBy: null,
          comment: 'Rappel automatique - Délai de validation dépassé (7j)',
          createdAt: new Date()
        });
      }
      await order.save();
    }
  }
}