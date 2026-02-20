db = db.getSiblingDB('bygagoos-ink');

// Create collections
db.createCollection('users');
db.createCollection('designs');
db.createCollection('orders');
db.createCollection('clients');
db.createCollection('staff');

// Create indexes
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "role": 1 });
db.designs.createIndex({ "title": 1 });
db.designs.createIndex({ "category": 1 });
db.orders.createIndex({ "userId": 1 });
db.orders.createIndex({ "status": 1 });
db.clients.createIndex({ "email": 1 }, { unique: true });
db.staff.createIndex({ "email": 1 }, { unique: true });

// Insert default admin user
db.users.insertOne({
  name: "Administrateur",
  email: "admin@bygagoos.com",
  password: "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj8lWZQjzHq", // Admin123!
  role: "admin",
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
});

print('Database initialized successfully');