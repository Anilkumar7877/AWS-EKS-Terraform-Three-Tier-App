# EKS Three-Tier Web Application Portal

A modern, responsive three-tier application demonstration comprising a static Web Frontend, an Express.js Backend REST API, and a MongoDB Database. This portal features real-time connection status monitoring, a glassmorphic aesthetic with dark/light mode toggles, and seamless user registration.

The repository is structured to run locally for development and is pre-configured for containerization and deployment to Kubernetes (such as Amazon EKS).

---

## 🏛️ Project Architecture

```mermaid
graph TD
    subgraph Frontend Tier
        FE[Static Web App: HTML5 / CSS3 / JS]
    end

    subgraph Backend Tier
        BE[Express.js / Node.js API Service]
    end

    subgraph Database Tier
        DB[(MongoDB Database Container)]
    end

    FE -->|HTTP / CORS Requests| BE
    BE -->|Mongoose ODM Connection| DB
```

---

## 📂 Repository Structure

The project folders are organized cleanly:

```text
EKS Three Tier/
├── backend/               # Backend Express Server
│   ├── controllers/       # Controller functions for handling API requests
│   ├── models/            # Mongoose schemas & models (User.js)
│   ├── routes/            # Route declarations (userRoutes.js, healthRoutes.js)
│   ├── app.js             # Main server entrypoint
│   ├── package.json       # Backend npm dependencies and scripts
│   └── .env.example       # Template env file for local settings
├── frontend/              # Frontend Web Client
│   ├── index.html         # Main dashboard layout
│   ├── style.css          # Glassmorphic responsive stylesheet
│   ├── app.js             # Frontend API integrations & theme manager
│   └── package.json       # Frontend scripts (http-server launcher)
├── k8s/                   # Kubernetes deployment manifest blueprints (empty)
├── helm/                  # Helm charts blueprints (empty)
├── terraform/             # IaC configurations (empty)
├── scripts/               # Helper scripts (empty)
├── docs/                  # Project documentation (empty)
└── .gitignore             # Root git exclusion settings
```

---

## 🚀 Getting Started (Local Development)

Follow these steps to run the three tiers locally on your machine.

### Prerequisites
- **Node.js** (v18 or newer recommended)
- **Docker Desktop** (or a local MongoDB installation)

---

### 1. Set Up the Database
Spin up a MongoDB instance inside Docker with authentication enabled:

```bash
docker run -d --name threetier-mongo -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=testpass123 \
  mongo:latest
```

This starts MongoDB and exposes it on port `27017` with credentials `admin` / `testpass123`.

---

### 2. Configure and Run the Backend API
Navigate to the `backend/` directory, configure your environment variables, and start the development server.

1. **Install dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Setup environment variables:**
   Copy the example configuration to a new `.env` file:
   ```bash
   cp .env.example .env
   ```
   If you are on Windows PowerShell, run:
   ```powershell
   Copy-Item .env.example .env
   ```

3. **Start the API Server:**
   Launch the server with live-reloads enabled via Nodemon:
   ```bash
   npm run dev
   ```
   *The backend will boot up and start listening on port `5000`.*

---

### 3. Run the Frontend Client
Navigate to the `frontend/` directory and spin up the development static file server.

1. **Launch dev server:**
   ```bash
   cd ../frontend
   npm run dev
   ```
   *This serving script automatically spins up `http-server` on port `3000`.*

2. **Access the application:**
   Open your web browser and go to [http://localhost:3000](http://localhost:3000).

---

## 🔌 REST API Documentation

### 1. Health Status
Verify the health and connection status of the backend API and MongoDB.
- **Route:** `GET /api/health`
- **Response Code (Healthy):** `200 OK`
- **Response Code (Unhealthy/DB disconnected):** `503 Service Unavailable`
- **Sample Payload:**
  ```json
  {
    "status": "UP",
    "timestamp": "2026-07-12T07:18:15.000Z",
    "services": {
      "api": { "status": "UP" },
      "database": { "status": "UP", "details": "connected" }
    }
  }
  ```

### 2. Fetch Users
Fetch all registered users, sorted in descending order of creation.
- **Route:** `GET /api/users`
- **Sample Payload:**
  ```json
  {
    "success": true,
    "count": 1,
    "data": [
      {
        "_id": "64b0f9f38f4d9c49a141b712",
        "name": "Jane Doe",
        "email": "jane.doe@example.com",
        "createdAt": "2026-07-12T07:44:00.000Z"
      }
    ]
  }
  ```

### 3. Create User
Register a new user in the database.
- **Route:** `POST /api/users`
- **Headers:** `Content-Type: application/json`
- **Payload:**
  ```json
  {
    "name": "Jane Doe",
    "email": "jane.doe@example.com"
  }
  ```
- **Success Response (`211 Created`):** Returns the saved user object.
- **Error Response (`400 Bad Request`):** Validation failure or email duplicate.

---

## 🛠️ Troubleshooting

### MongoDB connection failure (`ECONNRESET` / Hangs on `localhost`)
Node.js (version 17+) resolves `localhost` to the IPv6 address (`::1`) by default. Depending on your OS and Docker settings, port forwarding might reject or drop IPv6 traffic to containers.

**Fix:** Change the hostname in your `backend/.env` file from `localhost` to forced IPv4:
```ini
MONGO_URI=mongodb://admin:testpass123@127.0.0.1:27017/threetier?authSource=admin
```
Then restart your node script.
