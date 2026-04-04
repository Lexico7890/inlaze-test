import axios from 'axios';
import { CampaignReport } from '../domain/types';

export async function sendToN8N(data: CampaignReport[]): Promise<void> {
    const webhookUrl = process.env.N8N_WEBHOOK_URL;

    if (!webhookUrl) {
        console.warn("No N8N_WEBHOOK_URL provided. Skipping trigger to N8N.");
        return;
    }

    try {
        await axios.post(webhookUrl, { campaigns: data });
        console.log("Successfully sent data to N8N Webhook.");
    } catch (error: any) {
        console.error("Failed to send data to N8N Webhook:", error.message);
    }
}