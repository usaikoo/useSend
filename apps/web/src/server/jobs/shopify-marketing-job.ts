import { Queue, Worker } from "bullmq";
import { createWorkerHandler, TeamJob } from "../queue/bullmq-context";
import {
  DEFAULT_QUEUE_OPTIONS,
  SHOPIFY_MARKETING_QUEUE,
} from "../queue/queue-constants";
import { getRedis, BULL_PREFIX } from "../redis";
import { ShopifyMarketingEngine } from "../service/shopify-marketing-engine";
import { logger } from "../logger/log";

const MARKETING_TICK_MS = 5 * 60 * 1000;

type MarketingJob = TeamJob<Record<string, never>>;

export class ShopifyMarketingSchedulerService {
  private static schedulerQueue = new Queue<MarketingJob>(
    SHOPIFY_MARKETING_QUEUE,
    {
      connection: getRedis(),
      prefix: BULL_PREFIX,
      skipVersionCheck: true,
    },
  );

  static worker = new Worker(
    SHOPIFY_MARKETING_QUEUE,
    createWorkerHandler(async () => {
      await ShopifyMarketingEngine.evaluateAllActiveStores();
    }),
    {
      connection: getRedis(),
      prefix: BULL_PREFIX,
      skipVersionCheck: true,
    },
  );

  static async start() {
    await this.schedulerQueue.add(
      "tick",
      {},
      {
        ...DEFAULT_QUEUE_OPTIONS,
        repeat: { every: MARKETING_TICK_MS },
        jobId: "shopify-marketing-tick",
      },
    );

    logger.info("Shopify marketing scheduler started");
  }
}
