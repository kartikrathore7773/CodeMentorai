import cron from "node-cron";
import { runAutoGBPService } from "../services/autogbp.service.js";

export const startAutoGBP = () => {
  cron.schedule("0 9 * * *", async () => {
    try {
      await runAutoGBPService();
    } catch (err) {
      console.error(err.message);
    }
  });
};
