# CrashAlertAI Frontend

The frontend component of CrashAlertAI - a modern React-based web application providing an intuitive interface for traffic accident monitoring and management.

## 🎯 Overview

This React application serves as the user interface for the CrashAlertAI system, providing real-time monitoring capabilities, accident management, and administrative functions through a responsive and modern web interface.

## 🛠️ Technology Stack

### Core Technologies
- **React 18.3.1**: Latest React with hooks and functional components
- **JavaScript (ES6+)**: Modern JavaScript features
- **Create React App**: Build tooling and development server

### UI Framework & Components
- **Mantine 7.17.7**: Primary UI component library
  - Core components, hooks, and utilities
  - Date picker components
  - Form management
  - Carousel and charts
  - Notifications system
- **Material-UI 6.4.6**: Additional UI components
- **Tabler Icons React**: Comprehensive icon set
- **Framer Motion**: Animation and transitions

### Data & Communication
- **Socket.IO Client**: Real-time communication with backend
- **JWT Decode**: Token-based authentication handling
- **Date-fns & Day.js**: Date manipulation and formatting
- **Recharts**: Data visualization and analytics

### Routing & Navigation
- **React Router DOM 6.20.0**: Client-side routing and navigation

## 📁 Project Structure

```
frontend/
├── public/                   # Static assets
│   ├── index.html           # Main HTML template
│   └── favicon.ico          # Application icon
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── common/         # Generic components
│   │   ├── charts/         # Chart components
│   │   ├── forms/          # Form components
│   │   └── layout/         # Layout components
│   ├── pages/              # Application pages/views
│   │   ├── Dashboard/      # Main dashboard
│   │   ├── Accidents/      # Accident management
│   │   ├── Cameras/        # Camera management
│   │   ├── Users/          # User management
│   │   └── Settings/       # Application settings
│   ├── services/           # API service calls
│   │   ├── api.js          # API configuration
│   │   ├── auth.js         # Authentication services
│   │   ├── accidents.js    # Accident-related API calls
│   │   └── cameras.js      # Camera-related API calls
│   ├── context/            # React context providers
│   │   ├── AuthContext.js  # Authentication state
│   │   ├── SocketContext.js # Socket connection
│   │   └── ThemeContext.js # Theme management
│   ├── authentication/     # Auth components
│   │   ├── Login.js        # Login component
│   │   ├── Register.js     # Registration component
│   │   └── ProtectedRoute.js # Route protection
│   ├── theme/              # UI theming
│   │   ├── colors.js       # Color palette
│   │   ├── mantineTheme.js # Mantine theme config
│   │   └── globalStyles.js # Global CSS styles
│   ├── util/               # Utility functions
│   │   ├── helpers.js      # General helper functions
│   │   ├── constants.js    # Application constants
│   │   └── formatters.js   # Data formatting utilities
│   ├── App.js              # Main application component
│   └── index.js            # Application entry point
├── tests/                  # Test files
│   ├── components/         # Component tests
│   ├── pages/              # Page tests
│   ├── services/           # Service tests
│   └── __mocks__/          # Test mocks
├── coverage/               # Test coverage reports
├── build/                  # Production build output
├── package.json            # Dependencies and scripts
├── package-lock.json       # Dependency lock file
├── jest.config.js          # Jest testing configuration
├── babel.config.js         # Babel transpilation config
├── nginx.conf              # Nginx production config
├── Dockerfile              # Docker container config
├── .dockerignore           # Docker ignore rules
└── .gitignore              # Git ignore rules
```

## 🚀 Getting Started

### Prerequisites
- **Node.js 18+**: JavaScript runtime
- **npm**: Package manager (comes with Node.js)

### Installation
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

The application will be available at `http://localhost:3000`

### Environment Variables
Create a `.env` file in the frontend directory:

```env
# Backend API Configuration
REACT_APP_URL_BACKEND=http://localhost:3001

# Optional: Additional configuration
REACT_APP_SOCKET_URL=http://localhost:3001
REACT_APP_VERSION=1.0.0
```

## 🧪 Testing

### Running Tests
```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode (development)
npm run test:watch
```

### Test Configuration
- **Jest**: Testing framework with jsdom environment
- **React Testing Library**: Component testing utilities
- **User Event Library**: User interaction simulation
- **Custom Matchers**: Jest DOM matchers for better assertions

### Test Structure
```bash
tests/
├── components/
│   ├── Dashboard.test.js
│   ├── AccidentCard.test.js
│   └── CameraMap.test.js
├── pages/
│   ├── Login.test.js
│   └── Dashboard.test.js
├── services/
│   ├── api.test.js
│   └── auth.test.js
└── utils/
    └── helpers.test.js
```

## 🏗️ Build & Deployment

### Development Build
```bash
# Start development server with hot reload
npm start
```

### Production Build
```bash
# Create optimized production build
npm run build

# The build folder contains the compiled application
```

### Docker Deployment
```bash
# Build Docker image
docker build -t crashalert-frontend .

# Run container
docker run -p 3000:80 crashalert-frontend
```

### Nginx Configuration
The production deployment uses Nginx for serving static files and handling routing:

```nginx
server {
    listen 80;
    root /usr/share/nginx/html;
    index index.html;
    
    # Handle React Router
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Cache static assets
    location /static/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

## 🎨 UI Components & Styling

### Mantine Components
The application extensively uses Mantine components:
- **Layout**: AppShell, Grid, Container
- **Navigation**: Navbar, Breadcrumbs, Menu
- **Data Display**: Table, Card, Badge, Timeline
- **Feedback**: Notifications, Modal, Loading
- **Forms**: TextInput, Select, DatePicker, Button

### Theme Configuration
Custom theme with:
- **Color Palette**: Professional blue and gray scheme
- **Typography**: Clear, readable font hierarchy
- **Spacing**: Consistent padding and margins
- **Responsive**: Mobile-first approach

### Component Examples
```jsx
// Reusable Card Component
import { Card, Group, Text, Badge, Button } from '@mantine/core';

const AccidentCard = ({ accident }) => (
  <Card shadow="sm" padding="lg" radius="md" withBorder>
    <Group justify="space-between" mt="md" mb="xs">
      <Text weight={500}>{accident.location}</Text>
      <Badge color={accident.severity === 'high' ? 'red' : 'yellow'}>
        {accident.severity}
      </Badge>
    </Group>
    <Text size="sm" color="dimmed">
      {accident.description}
    </Text>
    <Button variant="light" fullWidth mt="md" radius="md">
      View Details
    </Button>
  </Card>
);
```

## 🔄 Real-time Features

### Socket.IO Integration
```jsx
// Socket context for real-time updates
import { createContext, useContext, useEffect } from 'react';
import io from 'socket.io-client';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const socket = io(process.env.REACT_APP_URL_BACKEND);
  
  useEffect(() => {
    socket.on('accident_alert', (data) => {
      // Handle real-time accident alerts
      showNotification({
        title: 'New Accident Detected',
        message: `Accident at ${data.location}`,
        color: 'red'
      });
    });
    
    return () => socket.disconnect();
  }, []);
  
  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};
```

## 🔐 Authentication

### Auth Context
```jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const login = async (credentials) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    
    if (response.ok) {
      const { token } = await response.json();
      localStorage.setItem('token', token);
      setUser(jwtDecode(token));
      return true;
    }
    return false;
  };
  
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };
  
  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
```

## 📊 Data Visualization

### Charts with Recharts
```jsx
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

const AccidentTrends = ({ data }) => (
  <LineChart width={600} height={300} data={data}>
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis dataKey="date" />
    <YAxis />
    <Tooltip />
    <Line type="monotone" dataKey="accidents" stroke="#8884d8" />
  </LineChart>
);
```

## 🔧 Configuration & Customization

### Available Scripts
```json
{
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "jest --config=jest.config.js",
    "test:watch": "jest --config=jest.config.js --watch",
    "test:coverage": "jest --config=jest.config.js --coverage",
    "eject": "react-scripts eject"
  }
}
```

### ESLint Configuration
The project uses React-specific ESLint rules for code quality:
- React hooks rules
- JSX best practices
- Accessibility guidelines
- Modern JavaScript standards

## 🚀 Performance Optimization

### Built-in Optimizations
- **Code Splitting**: Automatic route-based splitting
- **Tree Shaking**: Unused code elimination
- **Image Optimization**: Automatic image optimization
- **Caching**: Service worker for offline capability

### Bundle Analysis
```bash
# Analyze bundle size
npm run build
npx serve -s build
```

## 🐛 Troubleshooting

### Common Issues

#### Development Server Won't Start
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### Build Failures
```bash
# Check for TypeScript errors
npm run build 2>&1 | grep "TS"

# Increase memory for builds
export NODE_OPTIONS="--max-old-space-size=4096"
npm run build
```

#### Socket Connection Issues
- Verify backend URL in environment variables
- Check CORS configuration in backend
- Ensure Socket.IO versions match between frontend and backend

## 📚 Additional Resources

- [React Documentation](https://reactjs.org/docs)
- [Mantine UI Library](https://mantine.dev/)
- [Socket.IO Client Guide](https://socket.io/docs/v4/client-api/)
- [React Router Documentation](https://reactrouter.com/)
- [Jest Testing Framework](https://jestjs.io/docs/getting-started)

## 🤝 Contributing

When contributing to the frontend:

1. Follow the existing component structure
2. Use Mantine components when possible
3. Write tests for new components
4. Follow the established naming conventions
5. Update documentation for new features

---

**Frontend** - Providing an intuitive and responsive interface for intelligent traffic monitoring. 