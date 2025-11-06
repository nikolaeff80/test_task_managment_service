import Redis from "ioredis";
const redis = new Redis(process.env.REDIS_URL ?? "redis://localhost:6379");

async function workerLoop() {
  while(true) {
    const res = await redis.brpop("notifications", 0);
    if (res) {
      const [, str] = res;
      const payload = JSON.parse(str);
      console.log("NOTIFICATION:", payload);
    }
  }
}

workerLoop().catch(err => {
  console.error(err);
  process.exit(1);
});
