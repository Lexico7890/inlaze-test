import { evaluateCampaignStatus } from "./thresholds";

describe("evaluateCampaignStatus", () => {
    const originalEnv = process.env;

    beforeEach(() => {
        process.env = { ...originalEnv };
    });

    afterAll(() => {
        process.env = originalEnv;
    });

    it("should return 'critical' when metric is below critical threshold", () => {
        process.env.THRESHOLD_CRITICAL = "1.0";
        process.env.THRESHOLD_WARNING = "2.5";
        expect(evaluateCampaignStatus(0.9)).toBe("critical");
        expect(evaluateCampaignStatus(0.0)).toBe("critical");
    });

    it("should return 'warning' when metric is exactly at critical threshold or below warning threshold", () => {
        process.env.THRESHOLD_CRITICAL = "1.0";
        process.env.THRESHOLD_WARNING = "2.5";
        expect(evaluateCampaignStatus(1.0)).toBe("warning");
        expect(evaluateCampaignStatus(2.4)).toBe("warning");
    });

    it("should return 'ok' when metric is exactly at or above warning threshold", () => {
        process.env.THRESHOLD_CRITICAL = "1.0";
        process.env.THRESHOLD_WARNING = "2.5";
        expect(evaluateCampaignStatus(2.5)).toBe("ok");
        expect(evaluateCampaignStatus(5.0)).toBe("ok");
    });

    it("should use default thresholds if environment variables are not set", () => {
        delete process.env.THRESHOLD_CRITICAL;
        delete process.env.THRESHOLD_WARNING;

        expect(evaluateCampaignStatus(0.9)).toBe("critical");
        expect(evaluateCampaignStatus(2.4)).toBe("warning");
        expect(evaluateCampaignStatus(2.5)).toBe("ok");
    });

    it("should handle custom environment thresholds correctly", () => {
        process.env.THRESHOLD_CRITICAL = "5.0";
        process.env.THRESHOLD_WARNING = "8.0";

        expect(evaluateCampaignStatus(4.9)).toBe("critical");
        expect(evaluateCampaignStatus(7.9)).toBe("warning");
        expect(evaluateCampaignStatus(8.0)).toBe("ok");
    });
});
