# EKS Three-Tier Web Application Portal

A modern, responsive three-tier application demonstration comprising a static Web Frontend, an Express.js Backend REST API, and a MongoDB Database. This portal features real-time connection status monitoring, a glassmorphic aesthetic with dark/light mode toggles, and seamless user registration.

The repository is structured to run locally for development and is pre-configured for containerization and deployment to Kubernetes (such as Amazon EKS).

---

## 🏛️ Project Architecture

![Project Architecture Diagram](screenshots/architecture_diagram.svg)

----

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
├── k8s/                   # Kubernetes namespace, deployment, service, and ingress manifests
├── helm/                  # Helm charts blueprints (empty)
├── terraform/             # AWS EKS IaC configs (VPC, IAM, EKS, Node Group)
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

## 🐳 Quickstart with Docker Compose

To boot up the entire three-tier stack (Frontend, Backend, and MongoDB Database) with a single command, you can use the configured `docker-compose.yml` file.

1. **Start all services:**
   From the repository root directory, run:
   ```bash
   docker compose up --build
   ```
2. **Access the application:**
   - **Web Portal (Frontend)**: Go to [http://localhost:8000](http://localhost:8000) (runs on port 8000).
   - **Express API (Backend)**: Accessible at [http://localhost:5000](http://localhost:5000).
   - **MongoDB**: Exposed on port `27017` to the host.

3. **Stop all services:**
   ```bash
   docker compose down
   ```

---

## 🛠️ DevOps Infrastructure Architecture & Features

This project utilizes a modern DevOps stack to automate deployments, secure container configurations, and manage cloud infrastructure as code.

### 1. Multi-Container Orchestration (Docker & Compose)
- **Container Isolation**: Multi-stage docker builds isolate compiler environments from the final production images, reducing attack surface and bundle size.
- **Docker Compose Networking**: Defines a bridge network mapping frontend proxy, backend Express application, and isolated database with environment references for rapid local replication.

### 2. High-Availability AWS Networking (VPC via Terraform)
- **Subnet Distribution**: Deploys the infrastructure across 4 subnets inside a custom VPC (2 Public subnets and 2 Private subnets across multiple Availability Zones).
- **Public/Private Boundaries**: Database workloads and EC2 worker nodes reside in the private subnets, while the ingress gateways reside in the public subnets.
- **EKS Subnet Auto-Discovery Tags**: Public subnets are tagged with `kubernetes.io/role/elb = 1` and private subnets with `kubernetes.io/role/internal-elb = 1`. This allows the EKS Load Balancer Controller to automatically identify subnet scopes when creating load balancers.

### 3. AWS Identity Integration (OIDC & IRSA)
- **IAM OIDC Identity Provider**: Associated with the EKS cluster control plane to establish trust between AWS IAM and the Kubernetes service accounts.
- **IAM Roles for Service Accounts (IRSA)**: Grants granular, temporary IAM permissions directly to the Kubernetes pods (like the Load Balancer Controller) using standard web-identity tokens instead of hardcoded long-lived credentials.

### 4. Application Load Balancing (ALB Ingress)
- **AWS Load Balancer Controller**: Manages Application Load Balancers (ALB) dynamically on AWS.
- **Target Type Routing**: The Ingress resource uses `target-type: ip` mapping, which directs external HTTP requests directly to the target pods' IP addresses without needing node-port configurations, maximizing routing performance.


---

## 🏗️ Cloud Infrastructure Provisioning (AWS EKS via Terraform)

To deploy the entire network and EKS cluster on AWS:

1. **Configure your AWS credentials:**
   ```bash
   aws configure
   ```

2. **Navigate into the Terraform directory:**
   ```bash
   cd terraform
   ```

3. **Initialize Terraform:**
   ```bash
   terraform init
   ```

4. **Verify resources execution plan:**
   ```bash
   terraform plan
   ```

5. **Deploy the EKS Infrastructure:**
   ```bash
   terraform apply
   ```

---

## ☸️ Kubernetes deployment (Amazon EKS / Minikube)

Once the EKS cluster or a local Minikube cluster is running, configure and deploy your application tiers:

1. **Deploy Namespace:**
   ```bash
   kubectl apply -f k8s/namespace.yaml
   ```

2. **Deploy MongoDB Database:**
   ```bash
   kubectl apply -f k8s/mongodb/
   ```

3. **Deploy Backend API:**
   ```bash
   kubectl apply -f k8s/backend/
   ```

4. **Deploy Frontend Portal:**
   ```bash
   kubectl apply -f k8s/frontend/
   ```

5. **Expose and route traffic via Ingress:**
   ```bash
   kubectl apply -f k8s/ingress/
   ```


---

## 📸 Screenshots & Visual Verification

Below is the step-by-step visual documentation of the EKS Three-Tier infrastructure setup:

1. **Architecture Diagram**
   ![1. Architecture Diagram](screenshots/architecture_diagram.svg)

2. **Final Website** ⭐⭐⭐⭐⭐
   ![2. Final Website](screenshots/website.png)

3. **EKS Cluster**
   ![3. EKS Cluster](screenshots/eks_cluster.png)

4. **Compute / Node Group**
   ![4. Compute / Node Group](screenshots/eks_cluster_compute.png)

5. **VPC**
   ![5. VPC](screenshots/vpc.png)

6. **Load Balancer**
   ![6. Load Balancer](screenshots/load_balancer.png)

7. **Target Groups**
   ![7. Target Groups](screenshots/target_groups.png)

8. **Docker Hub**
   ![8. Docker Hub](screenshots/docker_hub.png)

9. **kubectl get all**
   ![9. kubectl get all](screenshots/kubectl_all.png)
   
10. **Ingress**
    ![10. Ingress](screenshots/kubectl_ingress.png)

---

## 🛠️ Troubleshooting

### MongoDB connection failure (`ECONNRESET` / Hangs on `localhost`)
Node.js (version 17+) resolves `localhost` to the IPv6 address (`::1`) by default. Depending on your OS and Docker settings, port forwarding might reject or drop IPv6 traffic to containers.

**Fix:** Change the hostname in your `backend/.env` file from `localhost` to forced IPv4:
```ini
MONGO_URI=mongodb://admin:testpass123@127.0.0.1:27017/threetier?authSource=admin
```
Then restart your node script.
