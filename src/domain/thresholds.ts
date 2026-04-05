import { CampaignStatus } from "./types";

export function evaluateCampaignStatus(metric: number): CampaignStatus {
    const criticalThreshold = parseFloat(process.env.THRESHOLD_CRITICAL || "1.0");
    const warningThreshold = parseFloat(process.env.THRESHOLD_WARNING || "2.5");

    if (metric < criticalThreshold) return "critical";
    if (metric < warningThreshold) return "warning";
    return "ok";
}