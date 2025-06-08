# CrashAlertAI

An intelligent real-time traffic accident detection and alert system powered by AI, designed to monitor traffic cameras and automatically detect accidents with instant notifications.

## 🚀 Overview

CrashAlertAI is a comprehensive full-stack application that combines cutting-edge computer vision with real-time web technologies to provide automated accident detection for traffic management systems. The system processes video feeds from traffic cameras, uses YOLOv11 deep learning models to detect accidents, and provides real-time alerts through a modern web interface.

## 🏗️ Architecture

The project follows a microservices architecture with three main components:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│                 │    │                 │    │                 │
│    Frontend     │◄──►│     Backend     │◄──►│  Model Service  │
│   (React App)   │    │   (Node.js API) │    │  (Python/YOLO)  │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│                 │    │                 │    │                 │
│   Nginx Server  │    │   MongoDB       │    │ Google Drive    │
│   (Port 80)     │    │   (Database)    │    │ (Video Storage) │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🎯 Key Features

### 🔍 AI-Powered Accident Detection
- **YOLOv11 Model**: State-of-the-art object detection specifically trained for traffic accidents
- **Real-time Processing**: Processes video feeds with configurable confidence thresholds
- **Smart Cooldown**: Prevents duplicate alerts with intelligent timing mechanisms
- **Automatic Video Trimming**: Extracts relevant clips around detected incidents

### 🌐 Modern Web Interface
- **Real-time Dashboard**: Live monitoring of camera feeds and alerts
- **Interactive Maps**: Visual representation of camera locations and incidents
- **User Management**: Role-based access control with authentication
- **Responsive Design**: Built with Mantine UI for optimal user experience

### 🔄 Real-time Communication
- **WebSocket Integration**: Instant notifications using Socket.IO
- **Email Alerts**: Automated email notifications for critical incidents
- **API Integration**: RESTful APIs for external system integration

### 📊 Data Management
- **MongoDB Database**: Scalable document storage for incidents and user data
- **Google Drive Integration**: Secure cloud storage for video evidence
- **Data Analytics**: Historical data analysis and reporting capabilities

## 🛠️ Technology Stack

### Frontend
- **React 18.3.1**: Modern UI framework with hooks and functional components
- **Mantine 7.17.7**: Comprehensive React components library
- **Material-UI**: Additional UI components and theming
- **Socket.IO Client**: Real-time communication
- **React Router**: Client-side routing
- **JWT Decode**: Token-based authentication
- **Recharts**: Data visualization and analytics

### Backend
- **Node.js**: JavaScript runtime environment
- **Express.js**: Web application framework
- **MongoDB**: NoSQL database with Mongoose ODM
- **Socket.IO**: Real-time bidirectional communication
- **JWT**: JSON Web Token authentication
- **bcryptjs**: Password hashing and security
- **Nodemailer**: Email service integration
- **CORS**: Cross-origin resource sharing

### Model Service
- **Python 3.x**: Core programming language
- **FastAPI**: High-performance async web framework
- **YOLOv11**: Ultra-fast object detection model
- **OpenCV**: Computer vision library
- **PyTorch**: Deep learning framework
- **Google Drive API**: Cloud storage integration
- **FFmpeg**: Video processing and trimming

### DevOps & Deployment
- **Docker**: Containerization for all services
- **Docker Compose**: Multi-container orchestration
- **CircleCI**: Continuous integration and deployment
- **Nginx**: Web server and reverse proxy
- **Render**: Cloud deployment platform

## 📦 Project Structure

```
CrashAlertAI/
├── frontend/                 # React application
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/           # Application pages
│   │   ├── services/        # API service calls
│   │   ├── context/         # React context providers
│   │   ├── authentication/  # Auth components
│   │   └── theme/          # UI theming
│   ├── public/             # Static assets
│   ├── tests/              # Jest test files
│   └── Dockerfile          # Frontend container config
│
├── backend/                  # Node.js API server
│   ├── src/
│   │   ├── controllers/     # Request handlers
│   │   ├── models/         # Database models
│   │   ├── routes/         # API route definitions
│   │   ├── middleware/     # Custom middleware
│   │   ├── services/       # Business logic
│   │   ├── socket/         # WebSocket handlers
│   │   └── util/          # Utility functions
│   ├── tests/              # Jest test files
│   └── Dockerfile          # Backend container config
│
├── model-service/           # Python AI service
│   ├── app.py              # FastAPI application
│   ├── uploader.py         # Google Drive integration
│   ├── test_app.py         # Service tests
│   ├── requirements.txt    # Python dependencies
│   ├── videos/            # Video processing directory
│   └── Dockerfile         # Model service container
│
├── weights/                 # AI model weights
├── secrets/                # Configuration files
├── .circleci/              # CI/CD configuration
├── docker-compose.yml      # Multi-service orchestration
└── CI_CD_SETUP.md         # Deployment documentation
```

## 🚀 Quick Start

### Prerequisites
- **Docker & Docker Compose**: For containerized deployment
- **Node.js 18+**: For local development
- **Python 3.8+**: For AI model service
- **MongoDB**: Database (included in Docker setup)

### 1. Clone Repository
```bash
git clone https://github.com/nirhazan35/CrashAlertAI.git
cd CrashAlertAI
```

### 2. Environment Setup
Create necessary environment files:

```bash
# Root directory .env
MONGO_URL=mongodb://mongo:27017/crashalert
ACCESS_TOKEN_SECRET=your_access_token_secret
REFRESH_TOKEN_SECRET=your_refresh_token_secret
EMAIL_ADDRESS=your_email@example.com
EMAIL_PASS=your_email_password
INTERNAL_SECRET=your_internal_api_secret
REACT_APP_URL_BACKEND=http://localhost:3001
INTERNAL_BACKEND_URL=http://backend:3001/api/accidents
ACCIDENT_THRESHOLD=0.7
```

### 3. Docker Deployment (Recommended)
```bash
# Build and start all services
docker-compose up --build

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:3001
# Model Service: http://localhost:8000
# MongoDB: localhost:27017
```

### 4. Local Development Setup
```bash
# Install all dependencies
npm run install:all

# Start individual services
npm run test:frontend        # Test frontend
npm run test:backend        # Test backend
cd model-service && python test_app.py  # Test model service
```

## 🧪 Testing

The project includes comprehensive testing for all components:

### Frontend Testing
```bash
cd frontend
npm test                    # Run all tests
npm run test:coverage      # Run with coverage report
npm run test:watch         # Watch mode for development
```

### Backend Testing
```bash
cd backend
npm test                   # Run API tests with Jest
```

### Model Service Testing
```bash
cd model-service
python test_app.py         # Direct testing
pytest                     # Using pytest framework
```

### Integration Testing
```bash
# Run all tests across services
npm run test               # Runs frontend and backend tests
```

## 🚀 Deployment

### Production Deployment with Render
The project is configured for automatic deployment using CircleCI and Render:

1. **Setup CircleCI**: Connect your GitHub repository
2. **Configure Environment Variables**: Add deployment hooks and secrets
3. **Deploy**: Push to main branch triggers automatic deployment

Detailed deployment instructions are available in [CI_CD_SETUP.md](CI_CD_SETUP.md).

### Manual Docker Deployment
```bash
# Production build
docker-compose -f docker-compose.yml up --build -d

# Monitor logs
docker-compose logs -f
```

## 🔧 Configuration

### Model Configuration
- **YOLO Weights**: Place your trained model in `weights/best.pt`
- **Confidence Threshold**: Adjust `ACCIDENT_THRESHOLD` (default: 0.7)
- **Video Processing**: Configure video directory and processing parameters

### API Configuration
- **Authentication**: JWT-based with configurable secrets
- **Database**: MongoDB connection string
- **Email**: SMTP configuration for notifications

### Frontend Configuration
- **Backend URL**: Configure API endpoint
- **Theme**: Customize UI theme and branding
- **Socket.IO**: Real-time connection settings

## 📊 API Documentation

### Authentication Endpoints
- `POST /api/auth/login` - User authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/refresh` - Token refresh

### Accident Management
- `GET /api/accidents` - List all accidents
- `POST /api/accidents` - Create new accident report
- `PUT /api/accidents/:id` - Update accident status
- `DELETE /api/accidents/:id` - Remove accident

### Camera Management
- `GET /api/cameras` - List all cameras
- `POST /api/cameras` - Add new camera
- `PUT /api/cameras/:id` - Update camera info

### Model Service
- `POST /run` - Process video for accident detection
- `GET /videos` - List available videos
- `GET /health` - Service health check

## 🤝 Contributing

1. **Fork the repository**
2. **Create feature branch**: `git checkout -b feature/AmazingFeature`
3. **Commit changes**: `git commit -m 'Add AmazingFeature'`
4. **Push to branch**: `git push origin feature/AmazingFeature`
5. **Open Pull Request**

### Development Guidelines
- Follow ESLint configuration for JavaScript/React
- Use PEP 8 for Python code
- Write tests for new features
- Update documentation as needed

## 📝 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- **Issues**: [GitHub Issues](https://github.com/nirhazan35/CrashAlertAI/issues)
- **Documentation**: Check individual service README files
- **CI/CD Help**: See [CI_CD_SETUP.md](CI_CD_SETUP.md)

## 🎯 Roadmap

### Upcoming Features
- [ ] Mobile application for alerts
- [ ] Advanced analytics dashboard
- [ ] Multi-camera correlation
- [ ] Machine learning model improvements
- [ ] Integration with traffic management systems
- [ ] Real-time streaming capabilities

### Performance Improvements
- [ ] Edge computing deployment
- [ ] Model optimization for faster inference
- [ ] Distributed processing capabilities
- [ ] Advanced caching strategies

---

**CrashAlertAI** - Making roads safer through intelligent monitoring and instant response.