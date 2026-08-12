import http from "http";

const MODE = process.env.MODE || "rr";

const BACKENDS = [
  {
    name: "Server 1 (Fast)",
    url: "http://backend1:5000/load-test"
  },
  {
    name: "Server 2 (Slow)",
    url: "http://backend2:5000/load-test"
  },
  {
    name: "Server 3 (Medium)",
    url: "http://backend3:5000/load-test"
  }
];

let rrIndex = 0;

const activeConnections = {
  backend1: 0,
  backend2: 0,
  backend3: 0
};

function getBackendKey(url) {
  return new URL(url).hostname;
}

function selectBackend() {
  if (MODE === "least_conn") {
    return BACKENDS.reduce((best, current) => {
      const bestConnections = activeConnections[getBackendKey(best.url)];
      const currentConnections = activeConnections[getBackendKey(current.url)];

      return currentConnections < bestConnections ? current : best;
    });
  }

  // Round Robin
  const backend = BACKENDS[rrIndex];
  rrIndex = (rrIndex + 1) % BACKENDS.length;
  return backend;
}

const server = http.createServer((req, res) => {
  const backend = selectBackend();
  const key = getBackendKey(backend.url);

  activeConnections[key]++;

  console.log(`[${MODE.toUpperCase()}] -> ${backend.name} | Active: ${activeConnections[key]}`);

  http
    .get(backend.url, (backendResponse) => {
      let data = "";

      backendResponse.on("data", (chunk) => {
        data += chunk;
      });

      backendResponse.on("end", () => {
        activeConnections[key]--;

        res.writeHead(200, {
          "Content-Type": "application/json"
        });
        res.end(data);
      });
    })
    .on("error", (error) => {
      activeConnections[key]--;

      res.writeHead(500, {
        "Content-Type": "application/json"
      });
      res.end(
        JSON.stringify({
          error: error.message
        })
      );
    });
});

server.listen(8000, "0.0.0.0", () => {
  console.log(`Load Balancer running on port 8000 | Algorithm: ${MODE.toUpperCase()}`);
});
