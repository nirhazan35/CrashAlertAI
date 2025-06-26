CrashAlertAI Frontend
====================

Overview
--------
This is the frontend for CrashAlertAI, a modern React application for real-time accident monitoring, user management, camera management, and analytics. It connects to the CrashAlertAI backend and provides a responsive, role-based dashboard for users and administrators.

Directory Structure
-------------------
- **pages/**: Main application pages (Dashboard, Statistics, History, Live Camera, Admin, Auth, etc.)
- **components/**: Reusable UI components (Sidebar, Notifications, Accident Logs, etc.)
- **services/**: API and socket services for backend communication and real-time updates.
- **context/**: React context providers for global state (accident logs, authentication).
- **util/**: Utility functions (e.g., sound notifications).
- **authentication/**: Auth context and route protection.

Setup & Installation
--------------------
1. **Install dependencies:**
   ```
   cd frontend
   npm install
   ```
2. **Environment variables:** Create a `.env` file in the frontend root with the following variables:
   ```
   REACT_APP_URL_BACKEND: <your-backend-url>   # e.g. http://localhost:3001
   ```
3. **Start the development server:**
   ```
   npm start
   ```
   The app runs on port **3000** by default.

Main Features
-------------
- **Authentication:** Login, registration (admin only), JWT session management, protected routes, and role-based access (user/admin).
- **Dashboard:** Real-time accident alerts, filtering, and quick access to accident details.
- **Statistics & Analytics:** Visualizations of accident data, trends, severity, false positives, and export to CSV.
- **Accident History:** Browse, filter, and export handled accident logs.
- **Live Camera Feed:** View live camera statuses and risk levels.
- **Camera Management:** Admins can add new cameras and assign cameras to users.
- **User Management:** Admins can register and delete users, and manage user roles.
- **Notifications:** Real-time notifications for admins, with a notification center.
- **Password Management:** Request password change, reset password, and notify users of changes.
- **Health Check:** `/health` route for frontend status.
- **Responsive Design:** Built with Mantine and MUI for a modern UI.

Key Pages & Components
----------------------
- **Dashboard:** Real-time accident alerts, filtering, and details.
- **Statistics:** Charts and analytics for accident data.
- **History:** Handled accident logs with export and filtering.
- **Live Camera:** Live status and risk of all cameras.
- **Admin Page:** Admin dashboard for user and camera management.
- **Login/Register:** Auth forms for users and admins.
- **Sidebar:** Navigation for all main sections, with admin-only links.
- **Notifications:** Real-time notification dropdown for admins.
- **ProtectedRoute:** Route protection and role-based access control.

Environment Variables
---------------------
- `REACT_APP_URL_BACKEND`: URL of the backend server (e.g., http://localhost:3001)

Testing
-------
- Run tests with:
  ```
  npm test
  ```

Build
-----
- To build for production:
  ```
  npm run build
  ```

Notes
-----
- The frontend expects the backend to be running and accessible at the URL specified in `REACT_APP_URL_BACKEND`.
- For real-time features, the backend must support Socket.IO and CORS for the frontend's origin.
- For any issues, check the browser console and network tab for errors. 