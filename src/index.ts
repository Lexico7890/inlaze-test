import * as dotenv from 'dotenv';
import { fetchMoviesAsCampaigns } from './adapters/TmdbStoreApi';
import { saveReportsToFile } from './utils/fileStorage';
import { sendToN8N } from './adapters/n8nWebhook';
import { generateCampaignSummary } from './adapters/openRouterApi';

dotenv.config();

async function runSystem() {
    try {
        console.log("Starting campaign evaluation process...");

        const reports = await fetchMoviesAsCampaigns();
        console.log(`Successfully processed ${reports.length} campaigns.`);

        saveReportsToFile(reports);

        await sendToN8N(reports);

        const summary = await generateCampaignSummary(reports);
        console.log("Summary:", summary);

        console.log("Process completed successfully.");
    } catch (error: any) {
        console.error("Critical error in system execution:", error.message);
        process.exit(1);
    }
}

runSystem();