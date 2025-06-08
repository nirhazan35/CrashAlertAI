# CrashAlertAI Backend

The backend API service for CrashAlertAI - a robust Node.js/Express application providing secure data management, real-time communication, and business logic for the traffic accident detection system.

## 🎯 Overview

This Node.js backend serves as the central API and data management layer for the CrashAlertAI system. It handles user authentication, accident data management, real-time notifications, camera management, and secure communication between the frontend and AI model service.

## 🛠️ Technology Stack

### Core Technologies
- **Node.js**: JavaScript runtime environment
- **Express.js 4.21.2**: Fast, unopinionated web framework
- **CommonJS**: Module system

### Database & ODM
- **MongoDB**: NoSQL document database
- **Mongoose 8.9.1**: Elegant MongoDB object modeling

### Authentication & Security
- **JSON Web Tokens (JWT) 9.0.2**: Stateless authentication
- **bcryptjs 2.4.3**: Password hashing and encryption
- **Cookie Parser 1.4.7**: HTTP cookie parsing
- **Sanitize HTML 2.14.0**: HTML sanitization for security

### Real-time Communication
- **Socket.IO 4.8.1**: Bi-directional real-time communication

### Email & Notifications
- **Nodemailer 6.9.16**: Email sending capabilities

### Configuration & Environment
- **dotenv 16.4.7**: Environment variable management
- **CORS 2.8.5**: Cross-Origin Resource Sharing

### Development & Testing
- **Jest 29.7.0**: JavaScript testing framework
- **Supertest 7.0.0**: HTTP assertion testing
- **MongoDB Memory Server 10.1.4**: In-memory MongoDB for testing
- **Nodemon 3.1.9**: Development auto-restart

## 📁 Project Structure

```
backend/
├── src/
│   ├── controllers/         # Request handlers and business logic
│   │   ├── authController.js      # Authentication endpoints
│   │   ├── accidentController.js  # Accident management
│   │   ├── cameraController.js    # Camera management
│   │   ├── userController.js      # User management
│   │   └── dashboardController.js # Dashboard data
│   ├── models/             # Mongoose database models
│   │   ├── User.js         # User data model
│   │   ├── Accident.js     # Accident incident model
│   │   ├── Camera.js       # Camera configuration model
│   │   └── Alert.js        # Alert notification model
│   ├── routes/             # API route definitions
│   │   ├── auth.js         # Authentication routes
│   │   ├── accidents.js    # Accident management routes
│   │   ├── cameras.js      # Camera management routes
│   │   ├── users.js        # User management routes
│   │   └── dashboard.js    # Dashboard data routes
│   ├── middleware/         # Custom middleware functions
│   │   ├── auth.js         # Authentication middleware
│   │   ├── validation.js   # Input validation
│   │   ├── errorHandler.js # Global error handling
│   │   ├── rateLimiter.js  # Rate limiting
│   │   └── logger.js       # Request logging
│   ├── services/           # Business logic services
│   │   ├── authService.js  # Authentication business logic
│   │   ├── emailService.js # Email sending service
│   │   ├── notificationService.js # Push notifications
│   │   └── modelService.js # AI model communication
│   ├── socket/             # WebSocket event handlers
│   │   ├── socketHandler.js # Main socket connection handler
│   │   ├── accidentEvents.js # Accident-related events
│   │   ├── cameraEvents.js  # Camera status events
│   │   └── userEvents.js    # User activity events
│   └── util/               # Utility functions
│       ├── database.js     # Database connection
│       ├── constants.js    # Application constants
│       ├── helpers.js      # General helper functions
│       └── validators.js   # Data validation utilities
├── tests/                  # Test files
│   ├── controllers/        # Controller tests
│   ├── models/            # Model tests
│   ├── routes/            # Route integration tests
│   ├── services/          # Service unit tests
│   └── __mocks__/         # Test mocks and fixtures
├── index.js               # Application entry point
├── package.json           # Dependencies and scripts
├── package-lock.json      # Dependency lock file
├── jest.config.js         # Jest testing configuration
├── Dockerfile             # Docker container configuration
├── .dockerignore          # Docker ignore rules
└── .gitignore             # Git ignore rules
```

## 🚀 Getting Started

### Prerequisites
- **Node.js 18+**: JavaScript runtime
- **MongoDB**: Database server (local or cloud)
- **npm**: Package manager

### Installation
```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Set up environment variables (see below)
cp .env.example .env

# Start development server
npm run dev
```

The API will be available at `http://localhost:3001`

### Environment Variables
Create a `.env` file in the backend directory:

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Database
MONGO_URL=mongodb://localhost:27017/crashalert

# JWT Secrets (use strong, unique values in production)
ACCESS_TOKEN_SECRET=your_very_long_and_secure_access_token_secret
REFRESH_TOKEN_SECRET=your_very_long_and_secure_refresh_token_secret

# Email Configuration (for notifications)
EMAIL_ADDRESS=your_email@gmail.com
EMAIL_PASS=your_app_specific_password

# Internal API Security (for model service communication)
INTERNAL_SECRET=your_internal_api_secret

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001

# Rate Limiting
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX_REQUESTS=100
```

## 🔗 API Endpoints

### Authentication Routes (`/api/auth`)
```javascript
POST   /api/auth/register        # User registration
POST   /api/auth/login           # User login
POST   /api/auth/refresh         # Refresh access token
POST   /api/auth/logout          # User logout
GET    /api/auth/profile         # Get user profile
PUT    /api/auth/profile         # Update user profile
POST   /api/auth/forgot-password # Password reset request
POST   /api/auth/reset-password  # Password reset confirmation
```

### Accident Management (`/api/accidents`)
```javascript
GET    /api/accidents           # List all accidents (with pagination)
POST   /api/accidents           # Create new accident report
GET    /api/accidents/:id       # Get specific accident details
PUT    /api/accidents/:id       # Update accident information
DELETE /api/accidents/:id       # Delete accident record
PUT    /api/accidents/:id/status # Update accident status
POST   /api/accidents/:id/assign # Assign accident to user
GET    /api/accidents/stats     # Get accident statistics
```

### Camera Management (`/api/cameras`)
```javascript
GET    /api/cameras             # List all cameras
POST   /api/cameras             # Add new camera
GET    /api/cameras/:id         # Get camera details
PUT    /api/cameras/:id         # Update camera configuration
DELETE /api/cameras/:id         # Remove camera
PUT    /api/cameras/:id/status  # Update camera status
GET    /api/cameras/locations   # Get camera locations for mapping
```

### User Management (`/api/users`)
```javascript
GET    /api/users               # List all users (admin only)
GET    /api/users/:id           # Get user details
PUT    /api/users/:id           # Update user information
DELETE /api/users/:id           # Delete user account
PUT    /api/users/:id/role      # Update user role (admin only)
GET    /api/users/activity      # Get user activity logs
```

### Dashboard Data (`/api/dashboard`)
```javascript
GET    /api/dashboard/overview  # Dashboard overview statistics
GET    /api/dashboard/charts    # Chart data for analytics
GET    /api/dashboard/alerts    # Recent alerts and notifications
GET    /api/dashboard/activity  # System activity feed
```

## 🔐 Authentication & Security

### JWT Authentication
```javascript
// Authentication middleware
const authenticateToken = (req, res, next) => {
  const token = req.cookies.accessToken || 
                req.headers['authorization']?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }
  
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};
```

### Password Security
```javascript
// Password hashing
const hashPassword = async (password) => {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
};

// Password verification
const verifyPassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};
```

### Input Validation & Sanitization
```javascript
// Input validation middleware
const validateAccident = (req, res, next) => {
  const { location, description, cameraId } = req.body;
  
  // Sanitize HTML content
  req.body.description = sanitizeHtml(description);
  
  // Validate required fields
  if (!location || !cameraId) {
    return res.status(400).json({ 
      error: 'Location and camera ID are required' 
    });
  }
  
  next();
};
```

## 🗄️ Database Models

### User Model
```javascript
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['admin', 'operator', 'viewer'], 
    default: 'viewer' 
  },
  isActive: { type: Boolean, default: true },
  lastLogin: Date,
  preferences: {
    emailNotifications: { type: Boolean, default: true },
    theme: { type: String, default: 'light' }
  }
}, { timestamps: true });
```

### Accident Model
```javascript
const accidentSchema = new mongoose.Schema({
  cameraId: { type: String, required: true },
  location: { type: String, required: true },
  date: { type: Date, default: Date.now },
  severity: { 
    type: String, 
    enum: ['low', 'medium', 'high'], 
    default: 'medium' 
  },
  status: { 
    type: String, 
    enum: ['active', 'resolved', 'investigating'], 
    default: 'active' 
  },
  description: String,
  video: String, // Google Drive URL
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  falsePositive: { type: Boolean, default: false },
  confidence: Number, // AI model confidence score
  coordinates: {
    latitude: Number,
    longitude: Number
  }
}, { timestamps: true });
```

### Camera Model
```javascript
const cameraSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: { type: String, required: true },
  coordinates: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true }
  },
  status: { 
    type: String, 
    enum: ['active', 'inactive', 'maintenance'], 
    default: 'active' 
  },
  stream_url: String,
  installation_date: { type: Date, default: Date.now },
  last_maintenance: Date,
  settings: {
    resolution: String,
    fps: Number,
    night_vision: Boolean
  }
}, { timestamps: true });
```

## 🔄 Real-time Communication

### Socket.IO Implementation
```javascript
// Socket connection handler
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  // Join user to their role-based room
  socket.on('join_room', (data) => {
    socket.join(data.role);
  });
  
  // Handle accident alerts
  socket.on('accident_detected', (accidentData) => {
    // Broadcast to all operators and admins
    io.to('admin').to('operator').emit('accident_alert', accidentData);
    
    // Send email notifications
    emailService.sendAccidentAlert(accidentData);
  });
  
  // Handle camera status updates
  socket.on('camera_status', (statusData) => {
    io.emit('camera_update', statusData);
  });
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});
```

## 📧 Email Notifications

### Email Service Configuration
```javascript
// Email service setup
const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_ADDRESS,
    pass: process.env.EMAIL_PASS
  }
});

// Send accident alert email
const sendAccidentAlert = async (accidentData) => {
  const mailOptions = {
    from: process.env.EMAIL_ADDRESS,
    to: getAdminEmails(), // Get admin email list
    subject: `🚨 Accident Alert - ${accidentData.location}`,
    html: generateAccidentEmailTemplate(accidentData)
  };
  
  try {
    await transporter.sendMail(mailOptions);
    console.log('Accident alert email sent successfully');
  } catch (error) {
    console.error('Failed to send accident alert email:', error);
  }
};
```

## 🧪 Testing

### Running Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- --testPathPattern=controllers/authController
```

### Test Configuration
```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'node',
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/index.js',
    '!**/node_modules/**'
  ],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  testMatch: ['**/tests/**/*.test.js']
};
```

### Test Examples
```javascript
// Example controller test
describe('Authentication Controller', () => {
  beforeEach(async () => {
    await User.deleteMany({});
  });
  
  describe('POST /api/auth/login', () => {
    it('should login user with valid credentials', async () => {
      // Create test user
      const user = new User({
        username: 'testuser',
        email: 'test@example.com',
        password: await hashPassword('password123')
      });
      await user.save();
      
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user.email).toBe('test@example.com');
    });
  });
});
```

## 🐳 Docker Deployment

### Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S crashalert -u 1001

USER crashalert

EXPOSE 3001

CMD ["node", "index.js"]
```

### Docker Commands
```bash
# Build image
docker build -t crashalert-backend .

# Run container
docker run -p 3001:3001 --env-file .env crashalert-backend

# Run with Docker Compose
docker-compose up backend
```

## 🔧 Configuration & Environment

### Production Configuration
```javascript
// Production-specific settings
if (process.env.NODE_ENV === 'production') {
  // Use helmet for security headers
  app.use(helmet());
  
  // Enable trust proxy for load balancers
  app.set('trust proxy', 1);
  
  // Stricter CORS policy
  app.use(cors({
    origin: process.env.ALLOWED_ORIGINS?.split(','),
    credentials: true
  }));
}
```

### Rate Limiting
```javascript
// Rate limiting configuration
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW) * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS), // 100 requests
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false
});

app.use('/api/', limiter);
```

## 📊 Monitoring & Logging

### Request Logging
```javascript
// Custom logging middleware
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.url} - ${res.statusCode} - ${duration}ms`);
  });
  
  next();
};
```

### Error Handling
```javascript
// Global error handler
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation failed',
      details: err.message
    });
  }
  
  if (err.name === 'CastError') {
    return res.status(400).json({
      error: 'Invalid ID format'
    });
  }
  
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
};
```

## 🚀 Performance Optimization

### Database Indexing
```javascript
// Add indexes for better query performance
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
accidentSchema.index({ cameraId: 1, date: -1 });
accidentSchema.index({ location: 1, status: 1 });
cameraSchema.index({ 'coordinates.latitude': 1, 'coordinates.longitude': 1 });
```

### Connection Pooling
```javascript
// MongoDB connection with optimized settings
mongoose.connect(process.env.MONGO_URL, {
  maxPoolSize: 10, // Maintain up to 10 socket connections
  serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  bufferCommands: false, // Disable mongoose buffering
  bufferMaxEntries: 0 // Disable mongoose buffering
});
```

## 🐛 Troubleshooting

### Common Issues

#### MongoDB Connection Problems
```bash
# Check MongoDB status
mongosh --eval "db.runCommand('ping')"

# Verify connection string
echo $MONGO_URL
```

#### JWT Token Issues
```bash
# Verify JWT secrets are set
echo $ACCESS_TOKEN_SECRET
echo $REFRESH_TOKEN_SECRET

# Check token expiration in logs
```

#### Socket.IO Connection Problems
- Verify CORS configuration
- Check firewall settings
- Ensure Socket.IO versions match between frontend and backend

## 📚 Additional Resources

- [Express.js Documentation](https://expressjs.com/en/4x/api.html)
- [Mongoose ODM Guide](https://mongoosejs.com/docs/guide.html)
- [Socket.IO Server Documentation](https://socket.io/docs/v4/server-api/)
- [JWT Best Practices](https://auth0.com/blog/a-look-at-the-latest-draft-for-jwt-bcp/)
- [Node.js Security Checklist](https://blog.risingstack.com/node-js-security-checklist/)

## 🤝 Contributing

When contributing to the backend:

1. Follow RESTful API design principles
2. Write comprehensive tests for new endpoints
3. Use proper error handling and validation
4. Follow the established project structure
5. Update API documentation for new endpoints
6. Ensure security best practices are followed

---

**Backend** - Powering secure and scalable traffic monitoring intelligence. 