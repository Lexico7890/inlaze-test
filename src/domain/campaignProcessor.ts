import axios from 'axios';

export interface CampaignResult {
    id: string;
    clicks: number;
    impressions: number;
    ctr: number;
}

async function fetchCampaignData(campaignId: string): Promise<CampaignResult | null> {
    try {
        const response = await axios.get(`https://api.example.com/campaigns/${campaignId}`);
        const data = response.data;

        return {
            id: data.id,
            clicks: data.clicks,
            impressions: data.impressions,
            ctr: data.impressions > 0 ? data.clicks / data.impressions : 0
        };
    } catch (error) {
        console.error(`Error fetching data for campaign ${campaignId}:`, error);
        return null;
    }
}

export async function processCampaigns(ids: string[]): Promise<CampaignResult[]> {
    const results: CampaignResult[] = [];
    const CONCURRENCY_LIMIT = 3;

    for (let i = 0; i < ids.length; i += CONCURRENCY_LIMIT) {
        const chunk = ids.slice(i, i + CONCURRENCY_LIMIT);

        const chunkPromises = chunk.map(id => fetchCampaignData(id));
        const chunkResults = await Promise.all(chunkPromises);

        chunkResults.forEach(res => {
            if (res !== null) results.push(res);
        });
    }

    return results;
}

export function getCriticalCampaigns(campaigns: CampaignResult[]): CampaignResult[] {
    return campaigns
        .filter(c => c.ctr < 0.02)
        .sort((a, b) => a.ctr - b.ctr);
}