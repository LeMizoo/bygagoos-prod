// backend/src/services/email/templates/orderTemplates.ts

import { EmailTemplate, commonStyles } from '../../../core/config/email';
import { formatPrice } from '../../../core/utils/formatters';

export const orderTemplates = {
  // Commande créée
  orderCreated: (data: any): EmailTemplate => {
    const itemsList = data.order.designs.map((item: any) => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #707470;">${item.design.title}</td>
        <td style="padding: 10px; border-bottom: 1px solid #707470; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #707470; text-align: right;">${formatPrice(item.price)}</td>
        <td style="padding: 10px; border-bottom: 1px solid #707470; text-align: right;">${formatPrice(item.price * item.quantity)}</td>
      </tr>
    `).join('');

    return {
      subject: `✨ Commande #${data.order.orderNumber} confirmée - ByGagoos-Ink`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>${commonStyles}</head>
        <body>
          <div class="container">
            <div class="header">
              <h1>ByGagoos-Ink</h1>
              <p>Création de designs sur mesure</p>
            </div>
            
            <div class="content">
              <h2>Bonjour ${data.client.firstName},</h2>
              
              <p>Nous avons bien reçu votre commande <strong>#${data.order.orderNumber}</strong>.</p>
              
              <div class="order-details">
                <h3>Récapitulatif de votre commande</h3>
                
                <table style="width: 100%; border-collapse: collapse;">
                  <thead>
                    <tr style="background: #F7ECDC;">
                      <th style="padding: 10px; text-align: left;">Design</th>
                      <th style="padding: 10px; text-align: center;">Qté</th>
                      <th style="padding: 10px; text-align: right;">Prix unitaire</th>
                      <th style="padding: 10px; text-align: right;">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${itemsList}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colspan="3" style="padding: 10px; text-align: right;"><strong>Sous-total</strong></td>
                      <td style="padding: 10px; text-align: right;">${formatPrice(data.order.price.subtotal)}</td>
                    </tr>
                    <tr>
                      <td colspan="3" style="padding: 10px; text-align: right;">TVA (${data.order.price.taxRate}%)</td>
                      <td style="padding: 10px; text-align: right;">${formatPrice(data.order.price.tax)}</td>
                    </tr>
                    <tr>
                      <td colspan="3" style="padding: 10px; text-align: right;"><strong>Total TTC</strong></td>
                      <td style="padding: 10px; text-align: right;"><strong>${formatPrice(data.order.price.total)}</strong></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
              
              <div style="margin: 30px 0;">
                <p><strong>Date souhaitée :</strong> ${new Date(data.order.requestedDate).toLocaleDateString('fr-FR')}</p>
                <p><strong>Statut :</strong> <span class="status-badge status-pending">En attente de validation</span></p>
              </div>
              
              <div style="text-align: center;">
                <a href="${process.env.FRONTEND_URL}/client/orders/${data.order._id}" class="button">
                  Suivre ma commande
                </a>
              </div>
              
              <p>Nous vous tiendrons informé de l'avancement de votre commande.</p>
              
              <p>À très bientôt,<br>L'équipe ByGagoos-Ink</p>
            </div>
            
            <div class="footer">
              <p>© ${new Date().getFullYear()} ByGagoos-Ink. Tous droits réservés.</p>
              <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };
  },

  // Changement de statut
  orderStatusChanged: (data: any): EmailTemplate => {
    const statusLabels: Record<string, string> = {
      PENDING: 'En attente',
      IN_PROGRESS: 'En cours de création',
      REVIEW: 'Prêt pour révision',
      MODIFICATION: 'Modifications demandées',
      VALIDATED: 'Validé',
      PRODUCTION: 'En production',
      SHIPPED: 'Expédié',
      DELIVERED: 'Livré',
      CANCELLED: 'Annulé'
    };

    const statusColors: Record<string, string> = {
      PENDING: 'status-pending',
      IN_PROGRESS: 'status-progress',
      REVIEW: 'status-progress',
      VALIDATED: 'status-completed',
      DELIVERED: 'status-completed'
    };

    return {
      subject: `📦 Mise à jour commande #${data.order.orderNumber} - ${statusLabels[data.newStatus]}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>${commonStyles}</head>
        <body>
          <div class="container">
            <div class="header">
              <h1>ByGagoos-Ink</h1>
            </div>
            
            <div class="content">
              <h2>Bonjour ${data.client.firstName},</h2>
              
              <p>Le statut de votre commande <strong>#${data.order.orderNumber}</strong> a été mis à jour.</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <span class="status-badge ${statusColors[data.oldStatus] || ''}" style="margin-right: 10px;">
                  ${statusLabels[data.oldStatus] || data.oldStatus}
                </span>
                → 
                <span class="status-badge ${statusColors[data.newStatus] || ''}" style="margin-left: 10px;">
                  ${statusLabels[data.newStatus] || data.newStatus}
                </span>
              </div>
              
              ${data.comment ? `
                <div style="background: white; padding: 15px; border-radius: 8px; margin: 20px 0;">
                  <p><strong>Commentaire :</strong></p>
                  <p>${data.comment}</p>
                </div>
              ` : ''}
              
              ${data.newStatus === 'REVIEW' ? `
                <div style="background: #DBEAFE; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <h3 style="color: #1E40AF; margin-top: 0;">✨ Votre commande est prête !</h3>
                  <p>Vous pouvez maintenant consulter les previews et valider votre commande.</p>
                  <div style="text-align: center;">
                    <a href="${process.env.FRONTEND_URL}/client/orders/${data.order._id}" class="button">
                      Voir et valider
                    </a>
                  </div>
                </div>
              ` : ''}
              
              ${data.newStatus === 'DELIVERED' ? `
                <div style="background: #D1FAE5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <h3 style="color: #065F46; margin-top: 0;">🎉 Commande livrée !</h3>
                  <p>Nous espérons que vous êtes satisfait de votre commande.</p>
                  <p>N'hésitez pas à nous laisser votre avis !</p>
                </div>
              ` : ''}
              
              <div style="text-align: center;">
                <a href="${process.env.FRONTEND_URL}/client/orders/${data.order._id}" class="button">
                  Voir les détails
                </a>
              </div>
              
              <p>Cordialement,<br>L'équipe ByGagoos-Ink</p>
            </div>
            
            <div class="footer">
              <p>© ${new Date().getFullYear()} ByGagoos-Ink</p>
            </div>
          </div>
        </body>
        </html>
      `
    };
  },

  // Nouveau message
  newMessage: (data: any): EmailTemplate => {
    return {
      subject: `💬 Nouveau message - Commande #${data.order.orderNumber}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>${commonStyles}</head>
        <body>
          <div class="container">
            <div class="header">
              <h1>ByGagoos-Ink</h1>
            </div>
            
            <div class="content">
              <h2>Bonjour ${data.recipient.firstName},</h2>
              
              <p>Vous avez reçu un nouveau message de <strong>${data.sender.firstName} ${data.sender.lastName}</strong> concernant la commande <strong>#${data.order.orderNumber}</strong>.</p>
              
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p style="font-style: italic;">"${data.message.content}"</p>
              </div>
              
              <div style="text-align: center;">
                <a href="${process.env.FRONTEND_URL}/${data.recipient.role === 'CLIENT' ? 'client' : 'admin'}/orders/${data.order._id}" class="button">
                  Voir la conversation
                </a>
              </div>
              
              <p>À bientôt,<br>L'équipe ByGagoos-Ink</p>
            </div>
            
            <div class="footer">
              <p>© ${new Date().getFullYear()} ByGagoos-Ink</p>
            </div>
          </div>
        </body>
        </html>
      `
    };
  },

  // Rappel de commande
  orderReminder: (data: any): EmailTemplate => {
    return {
      subject: `⏰ Rappel - Commande #${data.order.orderNumber} à valider`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>${commonStyles}</head>
        <body>
          <div class="container">
            <div class="header">
              <h1>ByGagoos-Ink</h1>
            </div>
            
            <div class="content">
              <h2>Bonjour ${data.client.firstName},</h2>
              
              <p>Nous n'avons pas eu de retour concernant votre commande <strong>#${data.order.orderNumber}</strong>.</p>
              
              <p>Les previews sont disponibles et nous attendons votre validation pour lancer la production.</p>
              
              <div style="background: #FEF3C7; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0;"><strong>Sans réponse de votre part dans les 7 jours, la commande sera automatiquement annulée.</strong></p>
              </div>
              
              <div style="text-align: center;">
                <a href="${process.env.FRONTEND_URL}/client/orders/${data.order._id}" class="button">
                  Valider maintenant
                </a>
              </div>
              
              <p>Merci de votre confiance,<br>L'équipe ByGagoos-Ink</p>
            </div>
            
            <div class="footer">
              <p>© ${new Date().getFullYear()} ByGagoos-Ink</p>
            </div>
          </div>
        </body>
        </html>
      `
    };
  }
};