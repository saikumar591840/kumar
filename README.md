# Team Task Manager

A full-stack, hyper-modern MERN application designed to help teams organize projects, assign tasks, and track real-time progress. Built with a focus on robust security, role-based access control, and a stunning glassmorphism user interface.

![Live Demo](https://img.shields.io/badge/Live_Demo-Coming_Soon-6366f1?style=for-the-badge)
![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB)
![MongoDB](https://img.shields.io/badge/MongoDB-%234ea94b.svg?style=for-the-badge&logo=mongodb&logoColor=white)

## ✨ Features

*   **Role-Based Access Control (RBAC):** Distinct `Admin` and `Member` privileges. Admins can create projects and assign tasks; Members are restricted to viewing and updating the status of tasks explicitly assigned to them.
*   **Kanban-Style Task Tracking:** Tasks are intelligently organized into `Todo`, `In Progress`, and `Done` columns for quick scannability.
*   **Live Dashboard Analytics:** A dynamic visual dashboard summarizing total, completed, pending, and overdue tasks using responsive inline CSS progress charts.
*   **Premium Glassmorphism UI:** Built from the ground up using custom vanilla CSS to achieve a stunning, responsive, dark-mode aesthetic with fluid micro-animations.
*   **Robust Security & Validation:** 
    *   JWT-based authentication
    *   Bcrypt password hashing
    *   Centralized global error-handling middleware intercepting Mongoose errors
    *   Strict client-side form validation to prevent blank submissions

## 🛠️ Tech Stack

*   **Frontend:** React (Vite), React Router v6, Axios, Custom CSS Variables
*   **Backend:** Node.js, Express.js
*   **Database:** MongoDB, Mongoose
*   **Authentication:** JSON Web Tokens (JWT), bcryptjs

## 🚀 Getting Started

To run this project locally on your machine, follow these steps:

### Prerequisites
*   [Node.js](https://nodejs.org/) installed
*   A local [MongoDB](https://www.mongodb.com/try/download/community) server running, or a free Atlas cluster.

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/yourusername/team-task-manager.git
    cd team-task-manager
    ```

2.  **Setup the Backend:**
    ```bash
    cd backend
    npm install
    ```
    Create a `.env` file in the `backend` directory:
    ```env
    PORT=5000
    MONGO_URI=mongodb://127.0.0.1:27017/taskmanager
    JWT_SECRET=your_super_secret_jwt_key
    NODE_ENV=development
    ```
    Start the backend server:
    ```bash
    npm run dev
    ```

3.  **Setup the Frontend:**
    Open a new terminal window.
    ```bash
    cd frontend
    npm install
    ```
    Create a `.env` file in the `frontend` directory:
    ```env
    VITE_API_URL=http://localhost:5000
    ```
    Start the Vite development server:
    ```bash
    npm run dev
    ```

4. **Visit the App:**
   Open `http://localhost:5173` in your browser.

## 🌐 Deployment Instructions

This application supports both a split deployment and a single backend-powered deployment. It is now ready to share.

### Environment examples

- `backend/.env.example`
- `frontend/.env.example`

Copy these into `backend/.env` and `frontend/.env` before running locally or deploying.

### Option 1: Deploy backend + frontend separately

1.  **Backend**
    *   Deploy the `backend/` folder as a Node.js service on Railway, Render, or Heroku.
    *   Use `npm install` and `npm start`.
    *   Set environment variables:
        * `PORT=5000`
        * `MONGO_URI=<your MongoDB connection string>`
        * `JWT_SECRET=<your jwt secret>`
        * `NODE_ENV=production`

2.  **Frontend**
    *   Deploy the `frontend/` folder on Vercel or Netlify.
    *   Set the environment variable:
        * `VITE_API_URL=https://<your-backend-url>`
    *   Build command: `npm install && npm run build`
    *   Publish directory: `dist`

### Option 2: Deploy a single backend service that serves the frontend

This repo now supports a single backend deployment with frontend build automation.

1.  Deploy the `backend/` folder as your service root.
2.  Use the build command:
    ```bash
    npm run build
    ```
3.  Use the start command:
    ```bash
    npm start
    ```
4.  The backend will serve the compiled React app from `frontend/dist` in production.

### Option 3: Deploy with Docker (recommended for full-stack share)

This repository includes a root-level `Dockerfile` and `docker-compose.yml` for a complete production deployment.

1.  Build and run locally with Docker Compose:
    ```bash
    docker compose up --build
    ```
2.  This will start:
    * `app` on `http://localhost:5000`
    * `mongo` as the database service
3.  Use the `MONGO_URI` in `docker-compose.yml` for future containerized deployments.

### Vercel frontend deployment

The `frontend/vercel.json` file is included for easy deployment on Vercel.

- Build command: `npm install && npm run build`
- Output directory: `dist`
- Set `VITE_API_URL` to your backend public URL.

### Example provider setup

- On **Render** or **Railway**, choose the `backend/` folder as the service root.
- Use `npm install` to install dependencies.
- The `heroku-postbuild` script will build the frontend automatically after install.
- Then `npm start` will launch the app.

## 🔗 Shareable deployment path

For the fastest public share link:

- **Option A:** Docker deployment with `docker compose up --build`
- **Option B:** Backend on Railway/Render and frontend on Vercel/Netlify

This repository is now fully deployment-ready with local Docker, cloud backend deploy, and hosted frontend configuration.

---
*Developed with production deployment support, Docker, and hosted frontend configuration.*
