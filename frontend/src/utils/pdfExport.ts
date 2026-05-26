import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import autoTable from 'jspdf-autotable';

// Types pour les rapports
export interface TripReport {
  id: string;
  date: string;
  driverName: string;
  vehiclePlate: string;
  pickupLocation: string;
  dropLocation: string;
  distance: number;
  fare: number;
  status: string;
}

export interface DriverStats {
  driverId: string;
  driverName: string;
  totalTrips: number;
  totalDistance: number;
  totalRevenue: number;
  averageRating: number;
}

export interface ReportOptions {
  title: string;
  subtitle?: string;
  startDate?: Date;
  endDate?: Date;
  logo?: string;
}

class PDFExportService {
  private static instance: PDFExportService;
  
  static getInstance(): PDFExportService {
    if (!PDFExportService.instance) {
      PDFExportService.instance = new PDFExportService();
    }
    return PDFExportService.instance;
  }

  // Formater la date
  private formatDate(date: Date): string {
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Ajouter l'en-tête du rapport
  private async addHeader(doc: jsPDF, options: ReportOptions): Promise<void> {
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Logo (si disponible)
    if (options.logo) {
      try {
        const img = new Image();
        img.src = options.logo;
        await new Promise((resolve) => { img.onload = resolve; });
        doc.addImage(img, 'PNG', 14, 10, 30, 30);
      } catch (error) {
        console.warn('Logo not loaded:', error);
      }
    }
    
    // Titre
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(245, 158, 11); // Amber
    doc.text(options.title, pageWidth / 2, 25, { align: 'center' });
    
    // Sous-titre
    if (options.subtitle) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      doc.text(options.subtitle, pageWidth / 2, 38, { align: 'center' });
    }
    
    // Période
    if (options.startDate && options.endDate) {
      doc.setFontSize(10);
      doc.setTextColor(150, 150, 150);
      const periodText = `Période: ${this.formatDate(options.startDate)} - ${this.formatDate(options.endDate)}`;
      doc.text(periodText, pageWidth / 2, 48, { align: 'center' });
    }
    
    // Date d'export
    doc.setFontSize(9);
    doc.setTextColor(180, 180, 180);
    doc.text(`Généré le: ${this.formatDate(new Date())}`, pageWidth - 14, 15, { align: 'right' });
  }

  // Ajouter un pied de page
  private addFooter(doc: jsPDF, pageNumber: number, totalPages: number): void {
    const pageWidth = doc.internal.pageSize.getWidth();
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `ByGagoos Prod - Rapport Taxi - Page ${pageNumber} / ${totalPages}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  // Exporter le rapport journalier des courses
  async exportDailyTripsReport(trips: TripReport[], options: ReportOptions): Promise<void> {
    const doc = new jsPDF('landscape');
    let currentPage = 1;
    const totalPages = Math.ceil(trips.length / 20) + 1;
    
    await this.addHeader(doc, options);
    
    // Résumé
    const totalFares = trips.reduce((sum, t) => sum + t.fare, 0);
    const totalDistance = trips.reduce((sum, t) => sum + t.distance, 0);
    const completedTrips = trips.filter(t => t.status === 'COMPLETED').length;
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('Résumé de la période', 14, 65);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const summaryY = 75;
    doc.text(`📊 Total courses: ${trips.length}`, 14, summaryY);
    doc.text(`✅ Courses terminées: ${completedTrips}`, 14, summaryY + 8);
    doc.text(`💰 Revenus totaux: ${totalFares.toLocaleString()} Ar`, 14, summaryY + 16);
    doc.text(`📏 Distance totale: ${totalDistance.toFixed(1)} km`, 14, summaryY + 24);
    doc.text(`⭐ Note moyenne: ${(trips.reduce((sum, t) => sum + (t.status === 'COMPLETED' ? 4.5 : 0), 0) / (completedTrips || 1)).toFixed(1)} / 5`, 14, summaryY + 32);
    
    // Tableau des courses
    autoTable(doc, {
      startY: 115,
      head: [['Date', 'Chauffeur', 'Véhicule', 'Trajet', 'Distance', 'Prix', 'Statut']],
      body: trips.map(trip => [
        new Date(trip.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        trip.driverName,
        trip.vehiclePlate,
        `${trip.pickupLocation} → ${trip.dropLocation}`,
        `${trip.distance.toFixed(1)} km`,
        `${trip.fare.toLocaleString()} Ar`,
        trip.status === 'COMPLETED' ? '✓ Terminé' : trip.status === 'IN_PROGRESS' ? '⏳ En cours' : '⏸ Annulé'
      ]),
      theme: 'striped',
      headStyles: { fillColor: [245, 158, 11], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [249, 250, 251] },
      margin: { left: 14, right: 14 },
      didDrawPage: () => {
        this.addFooter(doc, currentPage, totalPages);
        currentPage++;
      }
    });
    
    doc.save(`rapport-courses-${new Date().toISOString().split('T')[0]}.pdf`);
  }

  // Exporter le rapport par chauffeur
  async exportDriversReport(drivers: DriverStats[], options: ReportOptions): Promise<void> {
    const doc = new jsPDF('landscape');
    let currentPage = 1;
    const totalPages = Math.ceil(drivers.length / 15) + 1;
    
    await this.addHeader(doc, options);
    
    // Statistiques globales
    const totalRevenue = drivers.reduce((sum, d) => sum + d.totalRevenue, 0);
    const totalTrips = drivers.reduce((sum, d) => sum + d.totalTrips, 0);
    const avgRating = drivers.reduce((sum, d) => sum + d.averageRating, 0) / (drivers.length || 1);
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Classement des chauffeurs', 14, 65);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`👥 Total chauffeurs: ${drivers.length}`, 14, 78);
    doc.text(`💰 CA total: ${totalRevenue.toLocaleString()} Ar`, 14, 86);
    doc.text(`📊 Total courses: ${totalTrips}`, 14, 94);
    doc.text(`⭐ Note moyenne: ${avgRating.toFixed(1)} / 5`, 14, 102);
    
    // Tableau des chauffeurs
    autoTable(doc, {
      startY: 115,
      head: [['#', 'Chauffeur', 'Courses', 'Distance (km)', 'Revenus', 'Note']],
      body: drivers
        .sort((a, b) => b.totalRevenue - a.totalRevenue)
        .map((driver, index) => [
          (index + 1).toString(),
          driver.driverName,
          driver.totalTrips.toString(),
          driver.totalDistance.toFixed(1),
          `${driver.totalRevenue.toLocaleString()} Ar`,
          `${driver.averageRating.toFixed(1)} ⭐`
        ]),
      theme: 'striped',
      headStyles: { fillColor: [245, 158, 11], textColor: 255, fontStyle: 'bold' },
      didDrawPage: () => {
        this.addFooter(doc, currentPage, totalPages);
        currentPage++;
      }
    });
    
    doc.save(`rapport-chauffeurs-${new Date().toISOString().split('T')[0]}.pdf`);
  }

  // Exporter une capture d'écran d'un dashboard
  async exportDashboardScreenshot(elementId: string, filename: string): Promise<void> {
    const element = document.getElementById(elementId);
    if (!element) {
      console.error(`Element ${elementId} not found`);
      return;
    }
    
    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false
      });
      
      const imgData = canvas.toDataURL('image/png');
      const doc = new jsPDF('landscape');
      const imgWidth = doc.internal.pageSize.getWidth() - 20;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      doc.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
      doc.save(`${filename}-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Error generating screenshot:', error);
    }
  }
}

export const pdfExport = PDFExportService.getInstance();