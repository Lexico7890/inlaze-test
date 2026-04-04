import { CampaignStatus } from "./types";

export function evaluateCampaignStatus(metric: number): CampaignStatus {
    if (metric < 6.0) return "critical";
    if (metric < 7.0) return "warning";
    return "ok";
}