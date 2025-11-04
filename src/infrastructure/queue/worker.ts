import Redis from "ioredis";
const redis = new Redis(process.env.REDIS_URL ?? "redis://localhost:6379");

async function workerLoop() {
  while(true) {
    const res = await redis.brpop("notifications", 0); // blocks
    if (res) {
      const [, str] = res;
      const payload = JSON.parse(str);
      // simulate "sending" notification
      console.log("NOTIFICATION:", payload);
      // optionally write to file (fs.appendFile)
    }
  }
}

workerLoop().catch(err => {
  console.error(err);
  process.exit(1);
});
