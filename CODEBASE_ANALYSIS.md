# ByGagoos-Ink Codebase Analysis Report

**Analysis Date:** April 2026  
**Focus Areas:** Module relationships, data synchronization, API endpoints, real-time updates

---

## 1. MODULE CONNECTIONS & RELATIONSHIPS

### 1.1 Core Module Hierarchy

```
User (Authentication Root)
├── Client (Customer Data)
│   └── Design (Design Projects)
│       └── Order (Order Items)
└── Staff (Team Members)
```

### 1.2 Data Model Relationships

#### **Orders Module** (`backend/src/modules/orders/`)
- **Primary Fields:**
  - `client: ObjectId` → References `Clients` collection (required)
  - `items[].design: ObjectId` → References `Designs` collection
  - `user: ObjectId` → References `Users` collection (required - owner)
  - `createdBy: ObjectId` → References `Users` collection
  - `assignedTo: ObjectId` → References `Users` collection (staff)
  - `status: OrderStatus` enum (PENDING, IN_PROGRESS, REVIEW, etc.)
  - `paymentStatus: PaymentStatus` enum (PENDING, PARTIAL, PAID, etc.)

- **Relationship Flow:**
  ```
  Order.create()
  ├── Validates Client exists (same user scope)
  ├── Validates Design exists (same user scope)
  ├── Creates transaction session
  └── Populates nested references on retrieval
  ```

#### **Designs Module** (`backend/src/modules/designs/`)
- **Primary Fields:**
  - `client: ObjectId?` → References `Clients` collection (optional)
  - `user: ObjectId` → References `Users` collection (required - owner)
  - `createdBy: ObjectId` → References `Users` collection
  - `assignedTo: ObjectId?` → References `Users` collection
  - `status: DesignStatus` enum (DRAFT, PENDING, APPROVED, IN_PROGRESS, etc.)
  - `files: IDesignFile[]` → Cloudinary URLs

- **Relationship Flow:**
  ```
  Design.create()
  └── Validates Client exists if provided
  ```

#### **Clients Module** (`backend/src/modules/clients/`)
- **Primary Fields:**
  - `user: ObjectId` → References `Users` collection (required - owner)
  - `createdBy: ObjectId` → References `Users` collection
  - `email: String` → Unique per user (NOT globally unique)
  - `isActive: Boolean` → Soft delete flag

- **No downstream cascade** - Orders and Designs can exist without client

#### **Users Module** (`backend/src/modules/users/`)
- **Primary Fields:**
  - `email: String` → Unique globally
  - `role: UserRole` enum (CLIENT, STAFF, ADMIN, SUPER_ADMIN)
  - `isActive: Boolean` → Account status

#### **Staff Module** (`backend/src/modules/staff/`)
- **NOTE:** Separate from Users model
- **Primary Fields:**
  - `user: ObjectId?` → Optional reference to `Users` collection
  - `email: String` → Unique (separate namespace from Users)
  - `isActive: Boolean` → Active status
  - `department: String`, `role: String`, `skills: String[]`

### 1.3 Hooks & Relationships Analysis

**IMPORTANT FINDING:** Minimal inter-module hooks

```typescript
// backend/src/modules/orders/order.service.ts
async create(userId, data, createdBy) {
  // ✅ Validates client exists
  const client = await Client.findOne({ _id: data.clientId, user: userId });
  if (!client) throw 'Client not found';
  
  // ✅ Validates designs exist
  for (const item of data.items) {
    if (item.designId) {
      const design = await Design.findOne({ _id: item.designId, user: userId });
      if (!design) throw 'Design not found';
    }
  }
  
  // ❌ NO cascading updates to designs or clients
  // ❌ NO event emission
  // ❌ NO pub/sub notification
}
```

**No bidirectional updates:**
- Creating an Order does NOT update Client's order count
- Creating an Order does NOT change Design status
- Updating Order status does NOT notify assignees
- Creating/updating Staff does NOT notify Dashboard

---

## 2. FRONTEND DATA SYNCHRONIZATION

### 2.1 Data Fetching Architecture

#### **Axios Setup**
```typescript
// frontend/src/api/axiosInstance.ts & client.ts
- Two axios instances created (redundant setup)
- Token auto-added to Authorization header
- Request interceptor strips double /api prefix
- Response interceptor handles 401 → token refresh
- 30s timeout for all requests
```

#### **React Query Usage**
```typescript
// frontend/src/hooks/useDataTable.ts
const { data, isLoading, error } = useQuery({
  queryKey,
  queryFn: fetchFn,
});

// After mutations:
createMutation.onSuccess = () => {
  queryClient.invalidateQueries({ queryKey });  // Forces refetch
};
```

### 2.2 Current GalleryPage Data Flow

**Frontend: GalleryPage.tsx**
- Uses static design data (hardcoded array in code)
- NOT connected to backend API
- NOT fetching from database
- No real-time updates

**Frontend: Admin Design Pages**
- Uses `adminDesignsApi.getAllDesigns()`
- Sends FormData for multipart uploads
- Axios instance with auth token
- Manual React Query invalidation after mutations

### 2.3 Store Architecture (Zustand)

```typescript
// Pattern for all stores (designStore, orderStore, clientStore)
export const useDesignStore = create<DesignStore>((set) => ({
  designs: [],
  isLoading: false,
  error: null,

  fetchDesigns: async (page = 1, limit = 10) => {
    set({ isLoading: true });
    try {
      const response = await api.get('/designs', { params: { page, limit } });
      set({ designs: response.data.data, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  }
}));
```

**Limitation:** Stores manually updated - no auto-invalidation

### 2.4 React Query Invalidation

```typescript
// Current pattern in all mutations
createMutation = useMutation({
  mutationFn: createFn,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey });  // Triggers full refetch
  }
});
```

**Scope:** Only invalidates exact queryKey, not related queries  
**Missing:** Cross-key invalidation (e.g., order created → client stats change)

### 2.5 Real-Time Mechanism Analysis

#### **Current:** HTTP Polling (Limited)
```typescript
// AdminDashboard.tsx - ONLY place with polling
useEffect(() => {
  const interval = setInterval(() => {
    if (!showFilters) refreshStats();
  }, 300000);  // Every 5 minutes
  
  return () => clearInterval(interval);
}, [period]);
```

#### **Current:** Manual Refetch on Action
```typescript
// OrderDetailsPage.tsx
handleSendMessage = async () => {
  await addMessage(id, { content: newMessage });
  setNewMessage("");
  fetchOrderById(id);  // Manual refresh
};
```

#### **NOT Implemented:** 
- ❌ WebSocket connections
- ❌ Server-Sent Events (SSE)
- ❌ Socket.io (service-worker.js references it but unused)
- ❌ Real-time subscriptions
- ❌ Push notifications from backend

### 2.6 Staff Changes Communication

**NO mechanism exists:**
- Staff updates don't trigger frontend refresh
- No dashboard notification on staff changes
- No audit log for staff modifications
- Frontend must manually poll `/staff` endpoint

---

## 3. API ENDPOINTS COMPLETE REFERENCE

### 3.1 Clients Endpoints
```
GET    /api/clients                    # List all clients (paginated, filtered)
GET    /api/clients/search             # Search clients by name/email
GET    /api/clients/stats              # Client statistics
GET    /api/clients/:id                # Get single client
POST   /api/clients                    # Create new client
PUT    /api/clients/:id                # Update client
DELETE /api/clients/:id                # Delete (soft) client
```

### 3.2 Designs Endpoints
```
GET    /api/designs                    # List all designs (paginated, filtered)
GET    /api/designs/stats              # Design statistics
GET    /api/designs/:id                # Get single design
POST   /api/designs                    # Create design (multipart/form-data)
PUT    /api/designs/:id                # Update design
DELETE /api/designs/:id                # Delete design
POST   /api/designs/:id/files          # Add design files
DELETE /api/designs/:id/files/:fileId  # Remove design file
```

### 3.3 Orders Endpoints
```
GET    /api/orders                     # List all orders (paginated, filtered)
GET    /api/orders/stats               # Order statistics
GET    /api/orders/:id                 # Get single order
POST   /api/orders                     # Create order
PUT    /api/orders/:id                 # Update order
DELETE /api/orders/:id                 # Delete (archive) order
PATCH  /api/orders/:id/status          # Update order status
POST   /api/orders/:id/assign          # Assign order to staff
POST   /api/orders/:id/messages        # Add message to order
PATCH  /api/orders/:id/messages/read   # Mark messages as read
GET    /api/orders/client/:clientId    # Get orders for specific client
GET    /api/orders/:id/invoice         # Download invoice PDF
POST   /api/orders/:id/restore         # Restore archived order
```

### 3.4 Staff Endpoints
```
GET    /api/staff                      # List active staff
GET    /api/staff/stats                # Staff statistics
GET    /api/staff/:id                  # Get single staff member
POST   /api/staff                      # Create staff (admin only)
PUT    /api/staff/:id                  # Update staff (admin only)
DELETE /api/staff/:id                  # Delete staff (admin only)
PATCH  /api/staff/:id/toggle-status    # Toggle active/inactive
GET    /api/staff/department/:dept     # Get staff by department
GET    /api/staff/role/:role           # Get staff by role
```

### 3.5 Users Endpoints
```
POST   /api/users/change-password      # Change own password
GET    /api/users                      # List users (admin only)
GET    /api/users/:id                  # Get user (admin only)
PUT    /api/users/:id                  # Update user (admin only)
DELETE /api/users/:id                  # Delete user (admin only)
```

### 3.6 Auth Endpoints
```
POST   /api/auth/register              # Register new user
POST   /api/auth/login                 # Login
POST   /api/auth/logout                # Logout
POST   /api/auth/refresh-token         # Refresh JWT token
GET    /api/auth/me                    # Get current user
```

---

## 4. CURRENT CONNECTIONS & WORKING FEATURES

### ✅ **What's Connected:**

1. **User Ownership Model**
   - All clients, designs, orders scoped to user
   - MongoDB queries filter by `user: userId`
   - Prevents cross-user data access

2. **Validation Cascade (Orders)**
   - Creating order validates client exists
   - Creating order validates designs exist
   - Prevents orphaned orders

3. **Data Population (Populates)**
   ```typescript
   // Orders retrieved with nested data
   Order.findById(id)
     .populate('client', 'firstName lastName email')
     .populate('items.design', 'title')
     .populate('assignedTo', 'firstName lastName email')
   ```

4. **Authentication & Authorization**
   - JWT tokens validate identity
   - Role-based middleware enforces permissions
   - `@protect` middleware on all endpoints
   - `@authorize` middleware for admin-only actions

5. **Caching Layer**
   - Redis configured for query caching
   - Order controller clears `orders:*` pattern after mutations
   - Cache fallback to in-memory Map if Redis unavailable

6. **Frontend React Query**
   - Automatic cache invalidation after mutations
   - Window focus refetch enabled by default
   - Pagination and filtering via query params

### ❌ **What's Missing:**

1. **Inter-Module Event System**
   - No pub/sub between orders/designs/clients
   - No message queue (RabbitMQ, Redis Streams)
   - No event emitters

2. **Real-Time Updates**
   - No WebSocket implementation
   - No Socket.io integration (referenced but unused)
   - No SSE (Server-Sent Events)
   - Service Worker mentions `/socket.io/` but never establishes connection

3. **Bidirectional Updates**
   - Creating Order doesn't update Client's order list in real-time
   - Updating Design status doesn't notify Orders using it
   - Staff changes don't broadcast to dashboard
   - No order count or stats recalculation on mutations

4. **Audit Trail**
   - No activity log for order status changes
   - No user action tracking
   - No who/when/what history

5. **Cross-Database Transactions**
   - Order creation uses MongoDB transactions but only validates
   - No atomic updates across collections
   - No rollback if downstream operations fail

6. **Frontend Polling**
   - Only dashboard has 5-minute polling
   - No polling for order updates
   - No background sync for status changes

---

## 5. REQUIRED FOR REAL-TIME UPDATES

### Needed Backend Implementations:

```typescript
// 1. Event Emitter Pattern
class OrderService {
  async create() {
    const order = await Order.create({...});
    
    // Emit event for other services
    eventBus.emit('order:created', order);
    return order;
  }
}

// 2. Redis Pub/Sub or Message Queue
eventBus.on('order:created', async (order) => {
  // Update client stats
  await updateClientOrderCount(order.client);
  // Notify subscribed users
  io.to(`user:${order.user}`).emit('order:created', order);
});

// 3. WebSocket Connection
const io = new Server(server, {
  cors: { origin: [...allowedOrigins] }
});

io.on('connection', (socket) => {
  socket.join(`user:${socket.handshake.auth.userId}`);
  socket.on('disconnect', () => {...});
});

// 4. Notification Service
class NotificationService {
  async notifyOrderCreated(order) {
    // Send to WebSocket
    // Send email
    // Push notification
  }
}
```

### Needed Frontend Implementations:

```typescript
// 1. Socket.io Client Connection
import io from 'socket.io-client';

const socket = io(API_URL, {
  auth: { token: localStorage.getItem('token') }
});

socket.on('order:created', (order) => {
  queryClient.invalidateQueries({ queryKey: ['orders'] });
  queryClient.invalidateQueries({ queryKey: ['clients', order.client] });
  toast.success(`Order ${order.orderNumber} created`);
});

// 2. Real-Time Subscriptions
socket.emit('subscribe:orders', { clientId });
socket.on('order:updated', (order) => {
  // Update store
});

// 3. Automatic Refetch on Focus
window.addEventListener('focus', () => {
  queryClient.refetchQueries();
});
```

---

## 6. SUMMARY & RECOMMENDATIONS

### Current State:
- ✅ Modular architecture with clear boundaries
- ✅ Strong data validation and access control
- ✅ Basic CRUD operations working
- ❌ **Zero real-time synchronization**
- ❌ **Manual data refresh required**
- ❌ **No inter-module communication**

### Priority Fixes (in order):

1. **High Priority - Real-Time Updates**
   - Install Socket.io: `npm install socket.io socket.io-client`
   - Implement WebSocket server in backend
   - Connect frontend Socket.io client
   - Broadcast status changes and notifications

2. **High Priority - Event System**
   - Implement Node.js EventEmitter pattern
   - Create service-to-service notifications
   - Broadcast changes across connected clients

3. **Medium Priority - Audit Trail**
   - Add audit log schema
   - Track who changed what and when
   - Display activity timeline in UI

4. **Medium Priority - Cross-Module Invalidation**
   - When order created → invalidate client stats
   - When design updated → invalidate orders using it
   - Auto-invalidate dependent queries

5. **Low Priority - Offline Support**
   - Add Service Worker for offline caching
   - Sync queue for offline mutations
   - Reconnection handling

### Files to Focus On:
- Backend: `src/index.ts` (add Socket.io)
- Backend: `src/modules/orders/order.service.ts` (add events)
- Frontend: `src/api/client.ts` (add Socket.io connection)
- Frontend: `src/hooks/useDataTable.ts` (add cross-key invalidation)

---

## Key Findings Table

| Aspect | Status | Details |
|--------|--------|---------|
| Module Relationships | ✅ Defined | User → Client → Design → Order |
| Data Validation | ✅ Working | Cascade validation on order creation |
| API Endpoints | ✅ Complete | 25+ endpoints across 5 modules |
| Frontend Fetching | ✅ Working | Axios + React Query |
| Real-Time Updates | ❌ Missing | No WebSocket, polling only |
| Inter-Module Events | ❌ Missing | No pub/sub or event system |
| Staff Synchronization | ❌ Missing | No notifications on staff changes |
| Audit Trail | ❌ Missing | No activity tracking |
| Caching | ✅ Working | Redis with fallback |
| Authentication | ✅ Working | JWT with refresh |
