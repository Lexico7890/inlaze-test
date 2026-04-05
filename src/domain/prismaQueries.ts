import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export type GroupedOperatorRoas = {
    operatorId: string;
    operatorName: string;
    campaigns: {
        campaignId: string;
        campaignName: string;
        averageRoas: number;
    }[];
};

export async function getWorstRoasCampaignsByOperator(): Promise<GroupedOperatorRoas[]> {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const aggregatedMetrics = await prisma.campaignMetric.groupBy({
        by: ['campaignId'],
        where: {
            recordedAt: { gte: sevenDaysAgo },
        },
        _avg: { roas: true },
        orderBy: {
            _avg: { roas: 'asc' },
        },
    });

    const campaignIds = aggregatedMetrics.map((m: any) => m.campaignId);

    const campaignsData = await prisma.campaign.findMany({
        where: { id: { in: campaignIds } },
        include: { operator: true },
    });

    const groupedResult: Record<string, GroupedOperatorRoas> = {};
    for (const metric of aggregatedMetrics) {
        const campaignDetail = campaignsData.find((c: any) => c.id === metric.campaignId);
        if (!campaignDetail || metric._avg.roas === null) continue;

        const opId = campaignDetail.operatorId;

        if (!groupedResult[opId]) {
            groupedResult[opId] = {
                operatorId: opId,
                operatorName: campaignDetail.operator.name,
                campaigns: []
            };
        }

        groupedResult[opId].campaigns.push({
            campaignId: campaignDetail.id,
            campaignName: campaignDetail.name,
            averageRoas: metric._avg.roas
        });
    }

    return Object.values(groupedResult);
}