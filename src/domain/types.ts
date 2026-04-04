export type CampaignStatus = "ok" | "warning" | "critical";

export type CampaignReport = {
    id: string;
    name: string;
    metric: number;
    status: CampaignStatus;
    evaluatedAt: Date;
};

export type ActionSuggestion = {
    campaignId: string;
    actionToTake: string;
};

export type LLMSummary = {
    generatedAt: Date;
    model: string;
    summary: string;
    criticalCampaignIds: string[];
    suggestedActions: ActionSuggestion[];
    rawResponse?: unknown;
};