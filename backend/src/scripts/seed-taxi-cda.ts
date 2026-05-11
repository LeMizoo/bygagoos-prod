// backend/src/scripts/seed-taxi-cda.ts
import dns from 'dns';
import mongoose from 'mongoose';
import { config } from 'dotenv';

dns.setServers(['8.8.8.8', '1.1.1.1']);
config({ path: '../.env' });

import { env } from '../config/env';

// Taxi models
import Vehicle from '../modules/taxi/vehicle.model';
import Trip from '../modules/taxi/trip.model';
import Maintenance from '../modules/taxi/maintenance.model';

// Restaurant models (exact field names)
import RestaurantTable from '../modules/restaurant/table.model';
import Reservation from '../modules/restaurant/reservation.model';
import MenuItem from '../modules/restaurant/menu.model';
import StockItem from '../modules/restaurant/stock.model';

const seed = async () => {
  console.log('🔌 Connexion à MongoDB...');
  await mongoose.connect(env.MONGODB_URI!, {
    serverSelectionTimeoutMS: 5000,
  });
  console.log('✅ Connecté');

  // Nettoyage
  await Promise.all([
    Vehicle.deleteMany({}),
    Trip.deleteMany({}),
    Maintenance.deleteMany({}),
    RestaurantTable.deleteMany({}),
    Reservation.deleteMany({}),
    MenuItem.deleteMany({}),
    StockItem.deleteMany({}),
  ]);
  console.log('🧹 Collections vidées');

  // ========== TAXI ==========
  const v1 = await Vehicle.create({
    registrationNumber: '1234TMA',
    type: 'CAR',
    currentStatus: 'ACTIVE',
    mileage: 24500,
    fuelLevel: 75,
    driver: null,
    insurance: {
      provider: 'ARO',
      policyNumber: 'POL123456',
      expiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
    },
  });

  const v2 = await Vehicle.create({
    registrationNumber: '5678TMA',
    type: 'MOTORCYCLE',
    currentStatus: 'ACTIVE',
    mileage: 12000,
    fuelLevel: 60,
    driver: null,
  });

  const v3 = await Vehicle.create({
    registrationNumber: '9012TMA',
    type: 'CAR',
    currentStatus: 'MAINTENANCE',
    mileage: 89300,
    fuelLevel: 30,
    driver: null,
  });

  const now = new Date();
  await Trip.create({
    vehicle: v1._id,
    passenger: 'M. Andry',
    pickupLocation: 'Aéroport Ivato',
    dropLocation: 'Centre ville Analakely',
    startTime: new Date(now.setHours(9, 0, 0)),
    fare: 15000,
    status: 'COMPLETED',
    distance: 18,
  });

  await Trip.create({
    vehicle: v2._id,
    passenger: 'Mme Voahangy',
    pickupLocation: 'Gare routière Mahamasina',
    dropLocation: 'Anosy',
    startTime: new Date(now.setHours(10, 30, 0)),
    fare: 8000,
    status: 'IN_PROGRESS',
    distance: 6,
  });

  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 5);
  await Maintenance.create({
    vehicle: v3._id,
    type: 'Vidange moteur',
    date: new Date(),
    cost: 120000,
    mechanic: 'Garage Fitaratra',
    notes: 'Vérifier aussi les freins',
    nextDueDate: nextWeek,
  });

  // ========== RESTAURANT ==========
  // Tables
  const locations = ['Terrasse', 'Salle principale', 'Salon privé', 'Bar'];
  for (let i = 1; i <= 12; i++) {
    let status = 'AVAILABLE';
    if (i <= 4) status = 'OCCUPIED';
    else if (i <= 6) status = 'RESERVED';
    await RestaurantTable.create({
      tableNumber: `T${i}`, // string
      capacity: i <= 4 ? 2 : 4,
      location: locations[i % locations.length],
      status,
      occupiedBy: status === 'OCCUPIED' ? { guestName: 'Client test', checkInTime: new Date() } : undefined,
    });
  }

  // Réservation aujourd'hui
  const table3 = await RestaurantTable.findOne({ tableNumber: 'T3' });
  const today = new Date();
  if (table3) {
    await Reservation.create({
      guestName: 'Rakoto',
      guestPhone: '0321234567',
      reservationDate: today,
      reservationTime: '20:00',
      partySize: 4,
      table: table3._id,
      status: 'CONFIRMED',
      specialRequests: 'Table près de la fenêtre',
    });
  }

  // Menu items
  await MenuItem.create({
    name: 'Zebu grillé',
    category: 'MAIN_COURSES',
    description: 'Pavé de zébu, frites maison et salade',
    price: 25000,
    isFeatured: true,
    isAvailable: true,
  });

  await MenuItem.create({
    name: 'Riz cantonais',
    category: 'MAIN_COURSES',
    description: 'Riz sauté aux légumes et poulet',
    price: 12000,
    isFeatured: true,
    isAvailable: true,
  });

  await MenuItem.create({
    name: 'Samoussas',
    category: 'APPETIZERS',
    description: '3 pièces, garniture bœuf ou poulet',
    price: 5000,
    isFeatured: false,
    isAvailable: true,
  });

  // Stock alerts (StockItem model)
  await StockItem.create({
    name: 'Huile de friture',
    category: 'Ingrédients',
    quantity: 4,
    unit: 'litres',
    minThreshold: 10,
    maxCapacity: 50,
    alertLevel: 'CRITICAL', // will be auto-set but explicit ok
    supplier: 'Distributor SARL',
  });

  await StockItem.create({
    name: 'Poulet',
    category: 'Viande',
    quantity: 15,
    unit: 'kg',
    minThreshold: 5,
    maxCapacity: 30,
    alertLevel: 'NORMAL',
  });

  console.log('✅ Données de démonstration insérées avec succès !');
  process.exit(0);
};

seed().catch((error) => {
  console.error('❌ Erreur seed :', error);
  process.exit(1);
});