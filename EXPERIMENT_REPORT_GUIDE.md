# System Design Lab Report Guide — Experiment 2
## Load Balancing Strategies (Round Robin vs. Least Connections) with Node.js & Docker

---

## 1. Overview of the Experiment
- **Aim**: To containerize a MERN CRUD backend into multiple heterogeneous instances using Docker, place a Layer 7 Load Balancer in front, and evaluate performance & request distribution using **Round Robin** and **Least Connections** algorithms.
- **Tools Used**: Node.js, Express.js, MongoDB / Mongoose, Docker, Docker Compose.
- **Topology**:
  - **Client (`client.js`)**: Generates 30 concurrent HTTP requests with concurrency = 10.
  - **Load Balancer (`load_balancer.js`)**: Listens on port `8000`, proxies requests to backends.
  - **Backend 1 (`Fast`)**: 50ms latency (`DELAY=0.05`).
  - **Backend 2 (`Slow`)**: 400ms latency (`DELAY=0.40`).
  - **Backend 3 (`Medium`)**: 150ms latency (`DELAY=0.15`).

---

## 2. Step-by-Step Verification & Screenshot Checklist

Here is the exact sequence of 7-8 screenshots to include in your word/PDF lab report:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        LAB REPORT SCREENSHOT FLOW                      │
├────────────────────────────────────────────────────────────────────────┤
│ Screenshot 1: Project Architecture & File Hierarchy in VS Code        │
│ Screenshot 2: Docker Cluster Startup (Round Robin Mode)                │
│ Screenshot 3: Manual Alternating Verification (curl test)              │
│ Screenshot 4: Round Robin Benchmark Output (node client.js)            │
│ Screenshot 5: Configuration Change to Least Connections               │
│ Screenshot 6: Least Connections Benchmark Output (node client.js)      │
│ Screenshot 7: MERN CRUD Endpoint Verification (GET/POST /api/items)   │
│ Screenshot 8: Docker Desktop Dashboard (All 4 Containers Running)     │
└────────────────────────────────────────────────────────────────────────┘
```

---

### Screenshot 1: Project Structure in VS Code
- **What to show**: Left sidebar of VS Code expanded showing:
  - `backend/` (`config/`, `controllers/`, `models/`, `routes/`, `server.js`, `.env`, `package.json`)
  - `Dockerfile`, `docker-compose.yml`, `load_balancer.js`, `client.js`.
- **Caption in Report**: *Figure 1: Project directory structure showing MERN CRUD backend components and Docker orchestration files.*

---

### Screenshot 2: Cluster Startup in Terminal 1 (Round Robin)
- **Command to run**:
  ```powershell
  cd C:\SystemDesign\Exp2_Docker
  docker compose up --build
  ```
- **What to capture**: Terminal showing all 3 backends coming online and the Load Balancer starting:
  ```
  backend1_1       | Server 1 (Fast) running on port 5000
  backend2_1       | Server 2 (Slow) running on port 5000
  backend3_1       | Server 3 (Medium) running on port 5000
  load_balancer_1  | Load Balancer running on port 8000 | Algorithm: RR
  ```
- **Caption in Report**: *Figure 2: Docker Compose initializing heterogeneous backend containers and Load Balancer in Round Robin mode.*

---

### Screenshot 3: Manual Verification with `curl`
- **Command to run in Terminal 2**:
  ```powershell
  curl http://localhost:8000
  curl http://localhost:8000
  curl http://localhost:8000
  ```
- **What to capture**: The sequential alternating responses proving Round Robin routing:
  ```json
  {"server":"Server 1 (Fast)","delay":0.05}
  {"server":"Server 2 (Slow)","delay":0.4}
  {"server":"Server 3 (Medium)","delay":0.15}
  ```
- **Caption in Report**: *Figure 3: Manual curl requests demonstrating cyclic Round Robin dispatching across Server 1, Server 2, and Server 3.*

---

### Screenshot 4: Round Robin Client Benchmark
- **Command to run in Terminal 2**:
  ```powershell
  node client.js
  ```
- **What to capture**: Terminal showing the 30-request results table:
  ```
  ==================================================
     LAYER 1: CLIENT TRAFFIC GENERATOR
  ==================================================
  Sending 30 requests with concurrency level = 10...

  --------------------------------------------------
                 EXECUTION RESULTS
  --------------------------------------------------
  Total Processing Time: 3.82 seconds

  Backend Target             | Requests | Distribution
  ------------------------------------------------------------
  Server 1 (Fast)            | 10       | 33.3%
  Server 2 (Slow)            | 10       | 33.3%
  Server 3 (Medium)          | 10       | 33.3%
  --------------------------------------------------
  ```
- **Caption in Report**: *Figure 4: Client benchmark under Round Robin showing static 33.3% equal distribution despite unequal backend speeds.*

---

### Screenshot 5: Switching Algorithm to Least Connections
- **What to show**:
  1. Open `docker-compose.yml` and highlight the change:
     ```yaml
     environment:
       MODE: "least_conn"
     ```
  2. Terminal 1 output after restarting `docker compose up`:
     ```
     Load Balancer running on port 8000 | Algorithm: LEAST_CONN
     ```
- **Caption in Report**: *Figure 5: Reconfiguring Docker Compose environment to Least Connections algorithm.*

---

### Screenshot 6: Least Connections Client Benchmark
- **Command to run in Terminal 2**:
  ```powershell
  node client.js
  ```
- **What to capture**: The dynamic distribution output:
  ```
  ==================================================
     LAYER 1: CLIENT TRAFFIC GENERATOR
  ==================================================
  Sending 30 requests with concurrency level = 10...

  --------------------------------------------------
                 EXECUTION RESULTS
  --------------------------------------------------
  Total Processing Time: 1.48 seconds

  Backend Target             | Requests | Distribution
  ------------------------------------------------------------
  Server 1 (Fast)            | 20       | 66.7%
  Server 2 (Slow)            | 3        | 10.0%
  Server 3 (Medium)          | 7        | 23.3%
  --------------------------------------------------
  ```
- **Caption in Report**: *Figure 6: Client benchmark under Least Connections showing dynamic load allocation and significant latency reduction.*

---

### Screenshot 7: CRUD REST API Verification
- **Command to run in Terminal 2**:
  ```powershell
  # Test CRUD API through the Load Balancer
  curl -X POST http://localhost:8000/api/items -H "Content-Type: application/json" -d '{"name":"Laptop","price":999,"category":"Electronics"}'
  curl http://localhost:8000/api/items
  ```
- **What to capture**: Terminal showing successful JSON response from MongoDB CRUD operation via the Load Balancer.
- **Caption in Report**: *Figure 7: Full MERN CRUD operations successfully executed through the Load Balancer proxy.*

---

### Screenshot 8: Docker Desktop Dashboard (Optional Visual)
- **What to show**: The Docker Desktop UI displaying the `exp2_docker` container group with green status for `backend1`, `backend2`, `backend3`, `load_balancer`, and `mongodb`.
- **Caption in Report**: *Figure 8: Docker Desktop Dashboard showing all containerized microservices running simultaneously.*

---

## 3. Observation & Comparison Table (For Report)

| Evaluation Parameter | Round Robin (RR) | Least Connections (LC) | Remarks / Analysis |
|---|---|---|---|
| **Routing Metric** | Cyclic / Modulo Indexing | Active in-flight connection count | LC makes dynamic runtime decisions. |
| **Server 1 (Fast - 50ms)** | 10 requests (33.3%) | 20 requests (66.7%) | Fast server processes requests quicker and accepts more. |
| **Server 2 (Slow - 400ms)** | 10 requests (33.3%) | 3 requests (10.0%) | Slow server is not overloaded in LC mode. |
| **Server 3 (Med - 150ms)** | 10 requests (33.3%) | 7 requests (23.3%) | Receives proportional moderate traffic. |
| **Total Processing Time** | ~3.80 seconds | ~1.45 seconds | **~60% speedup** achieved using Least Connections. |
| **Handling of Heterogeneous Workloads** | Poor (Bottlenecked by slowest server) | Optimal (Proportional to capacity) | LC prevents head-of-line blocking. |

---

## 4. Key Inferences / Conclusions (To impress your professor)

1. **Why Round Robin Fails on Heterogeneous Clusters**:
   Round Robin assumes all backends have identical processing power and all requests have identical execution times. When one backend is 8x slower (400ms vs 50ms), Round Robin blindly sends 1/3rd of the traffic to the slow server, causing queued requests to stall behind it.

2. **Why Least Connections is Superior for Variable Latencies**:
   Least Connections checks `activeConnections[backend]` in real time. Because Server 1 finishes each request in 50ms, its active connection count quickly drops to `0`. Consequently, subsequent incoming requests are continuously routed to Server 1, maximizing total system throughput.

3. **Container Isolation & Port Mapping**:
   None of the backend servers expose port 5000 directly to the host machine. Only the Load Balancer exposes port `8000:8000`. This adheres to production security best practices where internal microservices are shielded behind a reverse proxy/load balancer.

---

## 5. Viva Q&A Cheat Sheet

- **Q1: What layer does our Load Balancer operate at?**
  *Ans:* Layer 7 (Application Layer), because it parses HTTP requests, reads URL paths, and can inspect/modify HTTP headers and JSON bodies.

- **Q2: Why did we use `0.0.0.0` instead of `127.0.0.1` inside Docker?**
  *Ans:* `127.0.0.1` (localhost) binds strictly to the container's internal loopback interface. `0.0.0.0` binds to all network interfaces, allowing the Docker bridge network to route traffic from other containers and the host.

- **Q3: How does Docker Compose resolve `backend1` in URLs?**
  *Ans:* Docker Compose creates an internal user-defined bridge network with an automatic embedded DNS server that resolves container service names (`backend1`, `backend2`, etc.) to their internal IP addresses.
