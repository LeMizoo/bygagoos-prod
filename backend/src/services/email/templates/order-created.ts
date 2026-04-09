// backend/src/services/email/templates/order-created.ts

export const orderCreatedTemplate = (data: any) => ({
  subject: `✨ Commande #${data.order.orderNumber} confirmée`,
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #164657;">Merci pour votre commande !</h1>
      
      <p>Bonjour ${data.client.firstName},</p>
      
      <p>Nous avons bien reçu votre commande n° <strong>#${data.order.orderNumber}</strong>.</p>
      
      <h2 style="color: #164657; margin-top: 30px;">Récapitulatif</h2>
      
      <table style="width: 100%; border-collapse: collapse;">
        <tr style="background: #F7ECDC;">
          <th style="padding: 10px; text-align: left;">Design</th>
          <th style="padding: 10px; text-align: center;">Quantité</th>
          <th style="padding: 10px; text-align: right;">Prix</th>
        </tr>
        ${data.order.designs.map((item: any) => `
          <tr style="border-bottom: 1px solid #707470;">
            <td style="padding: 10px;">${item.design.title}</td>
            <td style="padding: 10px; text-align: center;">${item.quantity}</td>
            <td style="padding: 10px; text-align: right;">${item.price} €</td>
          </tr>
        `).join('')}
        <tr>
          <td colspan="2" style="padding: 10px; text-align: right;"><strong>Total TTC</strong></td>
          <td style="padding: 10px; text-align: right;"><strong>${data.order.price.total} €</strong></td>
        </tr>
      </table>
      
      <div style="margin-top: 30px; padding: 20px; background: #F8F5EE; border-radius: 8px;">
        <p style="margin: 0;"><strong>Date souhaitée :</strong> ${new Date(data.order.requestedDate).toLocaleDateString('fr-FR')}</p>
        <p style="margin: 10px 0 0;"><strong>Statut :</strong> En attente de validation</p>
      </div>
      
      <div style="margin-top: 30px; text-align: center;">
        <a href="${process.env.FRONTEND_URL}/client/orders/${data.order._id}" 
           style="background: #164657; color: white; padding: 12px 30px; 
                  text-decoration: none; border-radius: 5px; display: inline-block;">
          Suivre ma commande
        </a>
      </div>
      
      <p style="margin-top: 30px; color: #707470; font-size: 0.9em;">
        L'équipe ByGagoos-Ink vous remercie pour votre confiance !
      </p>
    </div>
  `
});