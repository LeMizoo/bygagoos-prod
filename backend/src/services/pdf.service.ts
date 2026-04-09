// backend/src/services/pdf.service.ts

import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { formatPrice } from '../core/utils/formatters';

export const generatePDF = async (type: string, data: any): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ 
        margin: 50,
        size: 'A4'
      });
      
      const buffers: Buffer[] = [];
      
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });
      
      if (type === 'invoice') {
        generateInvoice(doc, data.order);
      }
      
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

const generateInvoice = (doc: PDFKit.PDFDocument, order: any) => {
  const { client, designs, orderNumber, createdAt, price, taxRate } = order;
  
  // En-tête
  doc.fontSize(20).font('Helvetica-Bold').text('FACTURE', 50, 50);
  doc.fontSize(10).font('Helvetica').text(`N° ${orderNumber}`, 50, 75);
  doc.text(`Date: ${new Date(createdAt).toLocaleDateString('fr-FR')}`, 50, 90);
  
  // Informations société
  doc.fontSize(12).font('Helvetica-Bold').text('ByGagoos-Ink', 400, 50);
  doc.fontSize(10).font('Helvetica')
    .text('123 Rue du Design', 400, 70)
    .text('75001 Paris', 400, 85)
    .text('contact@bygagoos-ink.com', 400, 100)
    .text('SIRET: 123 456 789 00012', 400, 115);
  
  // Informations client
  doc.fontSize(12).font('Helvetica-Bold').text('Facturer à:', 50, 150);
  doc.fontSize(10).font('Helvetica')
    .text(`${client.firstName} ${client.lastName}`, 50, 170)
    .text(client.company || '', 50, 185)
    .text(client.email, 50, 200)
    .text(client.phone || '', 50, 215);
  
  if (client.address) {
    doc.text(client.address.street || '', 50, 230)
      .text(`${client.address.postalCode || ''} ${client.address.city || ''}`, 50, 245);
  }
  
  // Tableau des articles
  const tableTop = 300;
  
  // En-têtes du tableau
  doc.fontSize(10).font('Helvetica-Bold');
  doc.text('Description', 50, tableTop);
  doc.text('Qté', 300, tableTop);
  doc.text('Prix unitaire', 350, tableTop);
  doc.text('Total', 450, tableTop);
  
  // Ligne de séparation
  doc.moveTo(50, tableTop + 15)
     .lineTo(550, tableTop + 15)
     .stroke();
  
  // Articles
  let y = tableTop + 30;
  doc.fontSize(10).font('Helvetica');
  
  designs.forEach((item: any) => {
    doc.text(item.design.title, 50, y, { width: 240 });
    doc.text(item.quantity.toString(), 300, y);
    doc.text(formatPrice(item.price), 350, y);
    doc.text(formatPrice(item.price * item.quantity), 450, y);
    y += 20;
  });
  
  // Ligne de séparation
  doc.moveTo(50, y + 10)
     .lineTo(550, y + 10)
     .stroke();
  
  // Totaux
  y += 30;
  const subtotal = price.subtotal;
  const tax = price.tax;
  const total = price.total;
  
  doc.text('Sous-total:', 350, y);
  doc.text(formatPrice(subtotal), 450, y);
  
  y += 20;
  doc.text(`TVA (${taxRate}%):`, 350, y);
  doc.text(formatPrice(tax), 450, y);
  
  y += 20;
  doc.fontSize(12).font('Helvetica-Bold')
    .text('TOTAL TTC:', 350, y)
    .text(formatPrice(total), 450, y);
  
  // Pied de page
  const bottomY = 700;
  doc.fontSize(8).font('Helvetica');
  doc.text('Merci de votre confiance !', 50, bottomY);
  doc.text('Paiement dû sous 30 jours', 50, bottomY + 15);
  
  // Numéro de page
  doc.text('Page 1/1', 500, bottomY);
};