# System Design Experiment 2: Load Balancing with Docker & Node.js

## 1. Overview & Objective
This project demonstrates Layer 7 (Application Layer) Load Balancing across multiple heterogeneous backend instances running as isolated Docker containers.

The application reuses a production-ready **MERN CRUD Backend** (Express, Mongoose, Item Model, Controllers, REST Routes) and puts a custom Node.js Load Balancer in front to compare:
1. **Round Robin (RR)**: Static sequential request dispatching irrespective of backend processing time.
2. **Least Connections (LC)**: Dynamic load dispatching to the backend with the fewest active in-flight connections.

---

## 2. Architecture

```
                       CLIENT (client.js)
                                |
                                | HTTP Requests (30 requests, Concurrency: 10)
                                ↓
                      ┌───────────────────┐
                      │   Load Balancer   │
                      │  (load_balancer.js│
                      │    Port: 8000     │
                      └─────────┬─────────┘
                                |
             ┌──────────────────┼──────────────────┐
             ↓                  ↓                  ↓
       Backend 1          Backend 2          Backend 3
    Server 1 (Fast)    Server 2 (Slow)   Server 3 (Medium)
     Delay: 0.05s       Delay: 0.40s       Delay: 0.15s
     Port: 5000         Port: 5000         Port: 5000
             \                  |                  /
              \                 |                 /
               └────────────────┴────────────────┘
                                |
                             MongoDB
                           Port: 27017
```

---

## 3. Project Structure

```
Exp2_Docker/
│
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection logic
│   ├── controllers/
│   │   └── itemController.js     # Full CRUD controller actions
│   ├── models/
│   │   └── Item.js               # Mongoose Item Schema
│   ├── routes/
│   │   └── itemRoutes.js         # RESTful API route definitions
│   ├── .env                      # Environment config
│   ├── .env.example              # Example environment template
│   ├── package.json              # Express, Mongoose, CORS, Morgan dependencies
│   └── server.js                 # Express server with /load-test and /api/items
│
├── Dockerfile                    # Container definition for Node.js backend
├── docker-compose.yml            # Multi-container orchestration (3 backends + LB + Mongo)
├── load_balancer.js              # Round Robin & Least Connections Load Balancer
├── client.js                     # Concurrent benchmark traffic generator
└── README.md                     # Documentation & Lab manual guide
```

---

## 4. REST API & Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Server status and uptime |
| `GET` | `/load-test` | Simulates heterogeneous latency & returns container ID |
| `GET` | `/api/items` | Retrieve all items (supports filtering by `category`, `inStock`, `search`) |
| `GET` | `/api/items/:id` | Retrieve single item by ID |
| `POST` | `/api/items` | Create new item (`name`, `price`, `description`, `category`, `inStock`) |
| `PUT` | `/api/items/:id` | Update item by ID |
| `DELETE` | `/api/items/:id` | Delete item by ID |

---

## 5. Step-by-Step Execution Guide

### Step 1: Start Docker Desktop
Ensure Docker Desktop is open and running on your system.

### Step 2: Build & Launch with Round Robin (`MODE=rr`)
Open **Terminal 1** (PowerShell):
```powershell
cd C:\SystemDesign\Exp2_Docker
docker compose up --build
```
You will observe:
```
LOAD BALANCER ONLINE ON PORT 8000
ALGORITHM : RR
```

### Step 3: Run Benchmark for Round Robin
Open **Terminal 2**:
```powershell
cd C:\SystemDesign\Exp2_Docker
node client.js
```
**Expected Observation:**
- Each server receives ~33.3% of the requests (10 requests each).
- Total time is dominated by the slow server (~400ms per request).

### Step 4: Switch to Least Connections (`MODE=least_conn`)
1. In **Terminal 1**, press `Ctrl + C` then run:
   ```powershell
   docker compose down
   ```
2. Open `docker-compose.yml` and change:
   ```yaml
   environment:
     MODE: "least_conn"
   ```
3. Restart cluster:
   ```powershell
   docker compose up
   ```

### Step 5: Run Benchmark for Least Connections
In **Terminal 2**:
```powershell
node client.js
```
**Expected Observation:**
- Fast Server handles significantly more requests (~18-22 requests).
- Slow Server handles far fewer requests (~2-4 requests).
- Overall execution time is drastically reduced.

---

## 6. Observation Table Template

| Metric | Round Robin (RR) | Least Connections (LC) |
|---|---|---|
| **Routing Strategy** | Cyclic / Sequential | Dynamic (Min Active In-Flight) |
| **Server 1 (Fast: 50ms) Requests** | ~10 (33.3%) | ~20 (66.7%) |
| **Server 2 (Slow: 400ms) Requests** | ~10 (33.3%) | ~3 (10.0%) |
| **Server 3 (Med: 150ms) Requests** | ~10 (33.3%) | ~7 (23.3%) |
| **Total Completion Time** | ~3.5 - 4.5s | ~1.2 - 1.8s |
| **Throughput / Efficiency** | Bottlenecked by slow server | Optimized across capacity |

---

## 7. Viva Q&A Cheat Sheet

1. **Why does Least Connections outperform Round Robin here?**
   - Round Robin distributes requests blind to server capabilities or current queue depth. When backends have heterogeneous processing speeds, the slow server becomes a bottleneck. Least Connections dynamically routes new requests to whichever backend finishes earlier and has the lowest in-flight workload.

2. **Why do we listen on `0.0.0.0` instead of `localhost` inside Docker?**
   - Inside a Docker container, `localhost` (127.0.0.1) only loopbacks within that container itself. `0.0.0.0` binds to all network interfaces, allowing Docker bridge networks to forward incoming traffic from other containers and the host.

3. **How does Docker resolve container hostnames like `backend1`?**
   - Docker Compose creates an internal bridge network with an embedded DNS server that automatically resolves container names to their internal IP addresses.
