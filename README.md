# Layer 7 Load Balancing with Node.js and Docker

A practical implementation of Layer 7 (Application Layer) Load Balancing across multiple containerized Node.js/Express backend instances using Docker Compose.

This project demonstrates and compares two core load balancing strategies:
1. **Round Robin (RR)**: Sequential distribution of incoming requests across all available servers.
2. **Least Connections (LC)**: Dynamic distribution routing requests to the server with the fewest active in-flight connections.

---

## System Architecture

```
                    Client (client.js)
                            |
                            | HTTP Requests
                            v
                  +-------------------+
                  |   Load Balancer   |
                  |     (Node.js)     |
                  |    Port: 8000     |
                  +---------+---------+
                            |
         +------------------+------------------+
         |                  |                  |
         v                  v                  v
    Backend 1          Backend 2          Backend 3
  Server 1 (Fast)    Server 2 (Slow)   Server 3 (Medium)
   Delay: 50ms        Delay: 400ms       Delay: 150ms
   Port: 5000         Port: 5000         Port: 5000
         \                  |                  /
          \                 |                 /
           +----------------+----------------+
                            |
                         MongoDB
                       Port: 27017
```

---

## Project Structure

```
.
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection setup
│   ├── controllers/
│   │   └── itemController.js     # CRUD controller logic
│   ├── models/
│   │   └── Item.js               # Mongoose schema
│   ├── routes/
│   │   └── itemRoutes.js         # API routes
│   ├── .env.example              # Environment variables template
│   ├── package.json              # Backend dependencies
│   └── server.js                 # Express server & load-test route
├── Dockerfile                    # Container definition for Node.js services
├── docker-compose.yml            # Multi-container orchestration
├── load_balancer.js              # Reverse proxy load balancer
├── client.js                     # Traffic generator for benchmarking
└── README.md
```

---

## REST API Endpoints

| Method | Route | Description |
|---|---|---|
| `GET` | `/load-test` | Simulates latency & returns container ID |
| `GET` | `/api/items` | Retrieve all items |
| `GET` | `/api/items/:id` | Retrieve single item by ID |
| `POST` | `/api/items` | Create a new item |
| `PUT` | `/api/items/:id` | Update an existing item |
| `DELETE` | `/api/items/:id` | Delete an item by ID |

---

## Getting Started

### Prerequisites
- [Docker](https://www.docker.com/) & Docker Compose
- [Node.js](https://nodejs.org/) (v18+)

### 1. Start the Cluster (Round Robin)

```bash
docker compose up --build
```

The load balancer will be listening on `http://localhost:8000`.

### 2. Run the Benchmark

In a separate terminal:

```bash
node client.js
```

### 3. Switch to Least Connections

1. Stop the running containers:
   ```bash
   docker compose down
   ```
2. In `docker-compose.yml`, change the load balancer mode:
   ```yaml
   environment:
     MODE: "least_conn"
   ```
3. Restart the cluster:
   ```bash
   docker compose up
   ```
4. Run the benchmark again:
   ```bash
   node client.js
   ```

---

## Performance Comparison

| Metric | Round Robin (RR) | Least Connections (LC) |
|---|---|---|
| **Routing Logic** | Cyclic / Modulo | Dynamic (Minimum Active Connections) |
| **Server 1 (Fast: 50ms)** | ~33.3% (10 requests) | ~66.7% (20 requests) |
| **Server 2 (Slow: 400ms)** | ~33.3% (10 requests) | ~10.0% (3 requests) |
| **Server 3 (Medium: 150ms)** | ~33.3% (10 requests) | ~23.3% (7 requests) |
| **Total Execution Time** | ~3.8s | ~1.4s |
