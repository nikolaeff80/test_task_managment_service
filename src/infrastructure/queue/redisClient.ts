import Redis from "ioredis";
const redis = new Redis(process.env.REDIS_URL ?? "redis://localhost:6379");


export async function pushNotification(payload: any) {
  await redis.lpush("notifications", JSON.stringify(payload));
}
