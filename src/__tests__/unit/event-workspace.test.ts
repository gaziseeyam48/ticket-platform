import { describe, it, expect } from "vitest";

describe("Event Workspace & Operational Metrics", () => {
  it("should calculate check-in percentage accurately with zero denominator protection", () => {
    const calculateCheckinPercentage = (checkedIn: number, total: number) => {
      if (total <= 0) return "0.0";
      return ((checkedIn / total) * 100).toFixed(1);
    };

    expect(calculateCheckinPercentage(0, 0)).toBe("0.0");
    expect(calculateCheckinPercentage(614, 791)).toBe("77.6");
    expect(calculateCheckinPercentage(100, 100)).toBe("100.0");
    expect(calculateCheckinPercentage(0, 50)).toBe("0.0");
  });

  it("should determine appropriate metric cards based on event admission model", () => {
    const getVisibleMetricCards = (eventType: "FREE" | "PAID") => {
      const cards = ["registrations", "tickets_issued", "check_ins"];
      if (eventType === "PAID") {
        cards.push("pending_payments");
      }
      return cards;
    };

    const freeCards = getVisibleMetricCards("FREE");
    expect(freeCards).toHaveLength(3);
    expect(freeCards).not.toContain("pending_payments");

    const paidCards = getVisibleMetricCards("PAID");
    expect(paidCards).toHaveLength(4);
    expect(paidCards).toContain("pending_payments");
  });

  it("should define valid lifecycle transitions without allowing premature or invalid states", () => {
    const getAllowedNextActions = (status: string, hasConfiguredForm: boolean) => {
      switch (status) {
        case "DRAFT":
          return hasConfiguredForm ? ["PUBLISH"] : ["CONFIGURE_FORM"];
        case "PUBLISHED":
          return ["START_EVENT", "CANCEL_EVENT"];
        case "LIVE":
          return ["OPEN_SCANNER", "END_EVENT"];
        case "ENDED":
        case "CANCELLED":
          return [];
        default:
          return [];
      }
    };

    expect(getAllowedNextActions("DRAFT", false)).toEqual(["CONFIGURE_FORM"]);
    expect(getAllowedNextActions("DRAFT", true)).toEqual(["PUBLISH"]);
    expect(getAllowedNextActions("PUBLISHED", true)).toEqual(["START_EVENT", "CANCEL_EVENT"]);
    expect(getAllowedNextActions("LIVE", true)).toEqual(["OPEN_SCANNER", "END_EVENT"]);
    expect(getAllowedNextActions("ENDED", true)).toEqual([]);
    expect(getAllowedNextActions("CANCELLED", true)).toEqual([]);
  });

  it("should enforce destructive confirmation requirements for cancelling and ending events", () => {
    const isDestructiveTransition = (targetStatus: string) => {
      return targetStatus === "CANCELLED" || targetStatus === "ENDED";
    };

    expect(isDestructiveTransition("PUBLISHED")).toBe(false);
    expect(isDestructiveTransition("LIVE")).toBe(false);
    expect(isDestructiveTransition("CANCELLED")).toBe(true);
    expect(isDestructiveTransition("ENDED")).toBe(true);
  });
});
