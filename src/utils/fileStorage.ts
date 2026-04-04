import * as fs from 'fs';
import * as path from 'path';
import { CampaignReport } from '../domain/types';

export function saveReportsToFile(data: CampaignReport[], filename = 'campaigns.json'): void {
    const dir = path.join(__dirname, '../../data');
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    const filePath = path.join(dir, filename);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log(`Saved reports to ${filePath}`);
}