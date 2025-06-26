CrashAlertAI Backend
====================

Overview
--------
This is the backend for CrashAlertAI, a Node.js/Express application designed to manage accident detection, user authentication, camera management, and real-time notifications via Socket.IO. The backend connects to a MongoDB database and provides a RESTful API for frontend and internal services.

Directory Structure
-------------------
- **controllers/**: Business logic for accidents, users, cameras, authentication, etc.
- **routes/**: Express route definitions for API endpoints (accidents, users, cameras, auth).
- **models/**: Mongoose models for MongoDB collections (User, Camera, Accident, AuthLogs).
- **services/**: Email, ML simulation, and socket services.
- **middleware/**: Authentication, authorization, and IP processing middleware.
- **socket/**: Real-time communication setup using Socket.IO.
- **util/**: Utility functions (date formatting, DB connection, logging).

Setup & Installation
--------------------
1. **Install dependencies:**
   ```
   cd backend
   npm install
   ```
2. **Environment variables:** Create a `.env` file in the backend root with the following variables:
   ```
   MONGO_URL: MongoDB connection string (e.g., mongodb://localhost:27017/crashalert)
   ACCESS_TOKEN_SECRET: Secret key for signing JWT access tokens
   INTERNAL_SECRET: Secret key for internal service authentication (model-service)
   EMAIL_ADDRESS: Email address used for sending notifications 
   EMAIL_PASS: Password or app password for the email account
   REACT_APP_URL_FRONTEND: Frontend URL allowed for CORS (e.g., http://localhost:3000)
   ```
3. **Start the server:**
   - For development (with auto-reload):
     ```
     npm run dev
     ```
   - For production:
     ```
     npm start
     ```
   The server runs on port **3001** by default.

Main Features
-------------
- **User Authentication:** JWT-based login, registration, role-based access (admin/user), session management, and password change notifications.
- **Accident Management:** Create, update, and track accident reports, including severity, status, and assignment.
- **Camera Management:** Add, assign, and list cameras and their locations.
- **Real-Time Notifications:** Socket.IO for live updates and notifications (requires authentication via token).
- **Email Notifications:** Sends emails for password changes and accident alerts.
- **Logging:** Auth logs for login/logout/register events, including IP/device info.
- **IP Processing:** Middleware to extract and clean client IP addresses.
- **ML Simulation:** (Optional) Simulate accident events for testing.

API Endpoints
-------------
### Auth (`/auth`)
- `POST /auth/login` — User login
- `POST /auth/register` — Register new user (admin only)
- `POST /auth/logout` — Logout
- `GET /auth/authMe` — Refresh token
- `GET /auth/logs` — Get authentication logs (admin only)

### Users (`/users`)
- `GET /users/get-role` — Get current user's role
- `GET /users/get-all-users` — List all users (admin only)
- `POST /users/get-assigned-cameras` — Get cameras assigned to users (admin only)
- `POST /users/request-password-change` — Request password change
- `POST /users/change-password` — Change password (admin only)
- `POST /users/notify-password-change` — Notify password change (admin only)
- `DELETE /users/:id` — Delete user (admin only)

### Cameras (`/cameras`)
- `GET /cameras/get-cameras` — List all cameras
- `GET /cameras/get-id_location` — List camera locations
- `POST /cameras/assign-cameras` — Assign cameras (admin only)
- `POST /cameras/add-new-camera` — Add new camera (admin only)

### Accidents (`/accidents`)
- `GET /accidents/active-accidents` — List active accidents
- `POST /accidents/handle-accident` — Create/handle new accident
- `POST /accidents/accident-status-update` — Update accident status
- `GET /accidents/handled-accidents` — List handled accidents
- `POST /accidents/update-accident-details` — Update accident details
- `POST /accidents/internal-new-accident` — Internal endpoint (requires INTERNAL_SECRET)

### Health Check
- `GET /health` — Returns 'OK' if server is running

### Root
- `GET /` — Returns a welcome message

### Socket.IO
- Real-time features available at the same host/port. Authenticate with a JWT token using the `auth.token` property when connecting.

Models
------
- **User:** username, email, password, role (admin/user), assignedCameras, etc.
- **Camera:** cameraId, location, date, users, demoVideo
- **Accident:** cameraId, location, date, severity, video, assignedTo, status, falsePositive
- **AuthLogs:** username, type (Login/Logout/Register), result, ipAddress, etc.

Testing
-------
- Run tests with:
  ```
  npm test
  ```

Docker
------
- A `Dockerfile` is provided for containerization. Exposes port 3001.

