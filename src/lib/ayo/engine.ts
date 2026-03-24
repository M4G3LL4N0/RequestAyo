export type AyoCategory =
  | "ride"
  | "food"
  | "delivery"
  | "business"
  | "advice"
  | "general";

export type AyoProfile = {
  budgetSensitivity?: number;
  speedSensitivity?: number;
  trustSensitivity?: number;
  convenienceSensitivity?: number;
  preferredCategories?: string[];
  dislikedProviders?: string[];
};

export type AyoOption = {
  providerType: string;
  providerName: string;
  score: number;
  priceEstimate?: string;
  etaEstimate?: string;
  trustScore?: number;
  notes?: string;
  metadata?: Record<string, unknown>;
};

export type AyoResult = {
  category: AyoCategory;
  summary: string;
  options: AyoOption[];
};

function detectCategory(input: string): AyoCategory {
  const text = input.toLowerCase();

  if (
    text.includes("ride") ||
    text.includes("uber") ||
    text.includes("lyft") ||
    text.includes("get me there") ||
    text.includes("drive")
  ) {
    return "ride";
  }

  if (
    text.includes("food") ||
    text.includes("eat") ||
    text.includes("hungry") ||
    text.includes("restaurant") ||
    text.includes("order")
  ) {
    return "food";
  }

  if (
    text.includes("deliver") ||
    text.includes("send") ||
    text.includes("ship") ||
    text.includes("usps") ||
    text.includes("ups") ||
    text.includes("fedex")
  ) {
    return "delivery";
  }

  if (
    text.includes("business") ||
    text.includes("shop") ||
    text.includes("barber") ||
    text.includes("mechanic") ||
    text.includes("repair") ||
    text.includes("tire")
  ) {
    return "business";
  }

  if (
    text.includes("best way") ||
    text.includes("how should") ||
    text.includes("what should i do") ||
    text.includes("advice")
  ) {
    return "advice";
  }

  return "general";
}

function applyProfileBoost(base: number, trustScore: number, profile?: AyoProfile) {
  const trustSensitivity = profile?.trustSensitivity ?? 75;
  const convenienceSensitivity = profile?.convenienceSensitivity ?? 60;
  return (
    base +
    trustScore * (trustSensitivity / 100) * 0.15 +
    convenienceSensitivity * 0.05
  );
}

export function generateAyoRecommendation(
  input: string,
  profile?: AyoProfile
): AyoResult {
  const category = detectCategory(input);

  if (category === "ride") {
    const options: AyoOption[] = [
      {
        providerType: "ride",
        providerName: "UberX",
        score: applyProfileBoost(81, 78, profile),
        priceEstimate: "$18-$24",
        etaEstimate: "6 min",
        trustScore: 78,
        notes: "Balanced speed and availability."
      },
      {
        providerType: "ride",
        providerName: "Lyft",
        score: applyProfileBoost(84, 82, profile),
        priceEstimate: "$17-$23",
        etaEstimate: "5 min",
        trustScore: 82,
        notes: "Best overall current ride option."
      },
      {
        providerType: "ride",
        providerName: "Transit + Walk",
        score: applyProfileBoost(72, 88, profile),
        priceEstimate: "$2-$5",
        etaEstimate: "18 min",
        trustScore: 88,
        notes: "Cheapest option if you can trade speed for savings."
      }
    ].sort((a, b) => b.score - a.score);

    return {
      category,
      summary:
        "Ayo recommends Lyft as the best current mix of speed, reliability, and price.",
      options,
    };
  }

  if (category === "food") {
    const options: AyoOption[] = [
      {
        providerType: "food",
        providerName: "DoorDash Top Pick",
        score: applyProfileBoost(82, 80, profile),
        priceEstimate: "$22-$28",
        etaEstimate: "24 min",
        trustScore: 80,
        notes: "Best balance of speed and consistency."
      },
      {
        providerType: "food",
        providerName: "Uber Eats Best Value",
        score: applyProfileBoost(79, 76, profile),
        priceEstimate: "$16-$21",
        etaEstimate: "29 min",
        trustScore: 76,
        notes: "Lower total cost and solid quality."
      },
      {
        providerType: "food",
        providerName: "Pickup Nearby",
        score: applyProfileBoost(75, 90, profile),
        priceEstimate: "$14-$19",
        etaEstimate: "14 min",
        trustScore: 90,
        notes: "Best if you want the freshest option and lowest fees."
      }
    ].sort((a, b) => b.score - a.score);

    return {
      category,
      summary:
        "Ayo recommends a DoorDash top pick right now for the strongest overall convenience and consistency.",
      options,
    };
  }

  if (category === "delivery") {
    const options: AyoOption[] = [
      {
        providerType: "delivery",
        providerName: "UPS Ground",
        score: applyProfileBoost(86, 89, profile),
        priceEstimate: "$9-$14",
        etaEstimate: "2-4 days",
        trustScore: 89,
        notes: "Best default balance of cost and reliability."
      },
      {
        providerType: "delivery",
        providerName: "USPS Priority Mail",
        score: applyProfileBoost(80, 74, profile),
        priceEstimate: "$8-$12",
        etaEstimate: "2-3 days",
        trustScore: 74,
        notes: "Good if cost matters slightly more."
      },
      {
        providerType: "delivery",
        providerName: "FedEx Express Saver",
        score: applyProfileBoost(78, 84, profile),
        priceEstimate: "$16-$24",
        etaEstimate: "1-3 days",
        trustScore: 84,
        notes: "Good faster option if urgency is higher."
      }
    ].sort((a, b) => b.score - a.score);

    return {
      category,
      summary:
        "Ayo recommends UPS Ground as the strongest overall send option for most non-urgent deliveries.",
      options,
    };
  }

  if (category === "business") {
    const options: AyoOption[] = [
      {
        providerType: "business",
        providerName: "Highest Trust Local Option",
        score: applyProfileBoost(88, 92, profile),
        trustScore: 92,
        notes: "Best trust-weighted local recommendation."
      },
      {
        providerType: "business",
        providerName: "Best Value Local Option",
        score: applyProfileBoost(82, 80, profile),
        trustScore: 80,
        notes: "Best value recommendation for price-conscious users."
      },
      {
        providerType: "business",
        providerName: "Fastest Available Local Option",
        score: applyProfileBoost(79, 76, profile),
        trustScore: 76,
        notes: "Best if speed matters most."
      }
    ].sort((a, b) => b.score - a.score);

    return {
      category,
      summary:
        "Ayo recommends the highest-trust local option first, with price and speed alternatives behind it.",
      options,
    };
  }

  return {
    category,
    summary:
      "Ayo recommends starting with the highest-trust, lowest-friction option and refining from your preferences over time.",
    options: [
      {
        providerType: "general",
        providerName: "Ayo Smart Recommendation",
        score: applyProfileBoost(85, 85, profile),
        trustScore: 85,
        notes: "Ayo will improve recommendations as your request history grows."
      }
    ],
  };
}
