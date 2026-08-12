const http = require("http");

const LB_URL = "http://localhost:8000";

const TOTAL_REQUESTS = 30;
const CONCURRENT_WORKERS = 10;

function sendRequest(id) {
  return new Promise((resolve) => {
    const start = Date.now();

    http
      .get(LB_URL, (response) => {
        let data = "";

        response.on("data", (chunk) => {
          data += chunk;
        });

        response.on("end", () => {
          try {
            const payload = JSON.parse(data);
            resolve({
              server: payload.server,
              time: Date.now() - start
            });
          } catch {
            resolve({
              server: null,
              time: Date.now() - start
            });
          }
        });
      })
      .on("error", () => {
        resolve({
          server: null,
          time: Date.now() - start
        });
      });
  });
}

async function main() {
  console.log("==================================================");
  console.log("   LAYER 1: CLIENT TRAFFIC GENERATOR");
  console.log("==================================================");

  console.log(
    `Sending ${TOTAL_REQUESTS} requests with concurrency level = ${CONCURRENT_WORKERS}...\n`
  );

  const startTime = Date.now();
  const results = [];
  let nextRequest = 0;

  async function worker() {
    while (true) {
      const id = nextRequest++;
      if (id >= TOTAL_REQUESTS) break;

      const result = await sendRequest(id);
      results.push(result);
    }
  }

  const workers = [];
  for (let i = 0; i < CONCURRENT_WORKERS; i++) {
    workers.push(worker());
  }

  await Promise.all(workers);

  const totalTime = (Date.now() - startTime) / 1000;

  const counts = {};
  for (const result of results) {
    if (result.server) {
      counts[result.server] = (counts[result.server] || 0) + 1;
    }
  }

  console.log("--------------------------------------------------");
  console.log("               EXECUTION RESULTS");
  console.log("--------------------------------------------------");
  console.log(`Total Processing Time: ${totalTime.toFixed(2)} seconds\n`);

  console.log("Backend Target             | Requests | Distribution");
  console.log("-".repeat(60));

  for (const [server, count] of Object.entries(counts)) {
    const percentage = ((count / TOTAL_REQUESTS) * 100).toFixed(1);
    console.log(
      `${server.padEnd(27)} | ${String(count).padEnd(8)} | ${percentage}%`
    );
  }

  console.log("--------------------------------------------------");
}

main();
