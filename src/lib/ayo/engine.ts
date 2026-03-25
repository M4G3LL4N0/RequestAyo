export type AyoCategory =
  | "ride"
  | "food"
  | "delivery"
  | "business"
  | "advice"
  | "shopping"
  | "travel"
  | "general";

export type AyoIntent = {
  primary: string;
  secondary: string[];
};

export type AyoProfile = {
  budgetSensitivity?: number; // 0-100
  speedSensitivity?: number; // 0-100  
  trustSensitivity?: number; // 0-100
  convenienceSensitivity?: number; // 0-100
  preferredProviders?: {
    providerName: string;
    providerType: string;
    preferenceScore: number; // 0-100  
  }[];
  dislikedProviders?: {
    providerName: string;
    providerType: string;
    rejectionScore: number; // 0-100
  }[];
  preferredCategories?: string[];
  metadata?: Record<string, unknown>;
};

export type AyoOption = {
  providerType: string;
  providerName: string;
  baseScore: number;
  adjustedScore: number;
  priceEstimate?: string;
  etaEstimate?: string;
  trustScore?: number;
  notes?: string;
  reasoning: string[];
  flags?: string[];
  metadata?: Record<string, unknown>;
};

export type AyoResult = {
  requestId: string;
  timestamp: string;
  detectedIntent: AyoIntent;
  category: AyoCategory;
  primary: AyoOption;
  alternatives: AyoOption[];
  summary: string;
  debug?: {
    profileInfluence?: Record<string, number>;
    providerPreferences?: Record<string, number>;
  };
};

function detectIntent(input: string): {category: AyoCategory, intent: AyoIntent} {
  const text = input.toLowerCase().trim();
  const words = text.split(/\s+/);
  const bigrams = words.slice(0, -1).map((_, i) => words.slice(i, i+2).join(' '));
  const trigrams = words.slice(0, -2).map((_, i) => words.slice(i, i+3).join(' '));

  // Detection patterns
  const patterns = {
    ride: [
      /(ride|uber|lyft|taxi|cab)/,
      /(get me to|need (a|to) go)/,
      /(pick me up|drop me off)/,
      /(drive|transport|carpool)/
    ],
    food: [
      /(food|eat|hungry|restaurant)/,
      /(order(?!.*ship)|takeout|delivery)/,
      /(dinner|lunch|breakfast|meal)/,
      /(hungry|starving|craving)/
    ],
    delivery: [
      /(deliver|ship|send|mail)/,
      /(package|parcel)/,
      /(ups|usps|fedex|dhl)/,
      /(same day|overnight)/,
      /(courier|dispatch)/ 
    ],
    business: [
      /(business|shop|store)/,
      /(mechanic|repair|service)/,
      /(haircut|barber|salon)/,
      /(doctor|dentist|appointment)/ 
    ],
    shopping: [
      /(buy|purchase)/,
      /(shop(|ping)|store)/,
      /(product|item|goods)/,
      /(best deal|price|cheap)/
    ],
    travel: [
      /(flight|airplane)/,
      /(hotel|accommodation)/,
      /(vacation|trip)/,
      /(travel|journey)/
    ],
    advice: [
      /(what should|how to)/,
      /(best way|recommend)/,
      /(should i|advice)/,
      /(opinion|suggestion)/
    ]
  };

  // Find matches  
  const matchedCategories = Object.entries(patterns)
    .filter(([_, regexes]) => regexes.some(r => r.test(text)))
    .map(([cat]) => cat as AyoCategory);

  // Determine primary category
  const category = matchedCategories.length > 0 
    ? matchedCategories[0] 
    : 'general';

  // Extract primary intent
  const primaryIntent = (() => {
    if (/cheap|budget|save money/.test(text)) return 'budget_focused';
    if (/fast|quick|urgent|asap/.test(text)) return 'speed_focused'; 
    if (/best|quality|luxury/.test(text)) return 'quality_focused';
    if (/nearby|close|local/.test(text)) return 'location_focused';
    return 'balanced';
  })();

  return {
    category,
    intent: {
      primary: primaryIntent,
      secondary: matchedCategories.slice(1)
    }
  };
}

function calculateOptionScores(
  options: AyoOption[],
  profile?: AyoProfile
): AyoOption[] {
  return options.map(opt => {
    const reasoning: string[] = [];
    let adjustedScore = opt.baseScore;
    
    // Apply profile preferences
    if (profile) {
      // Budget sensitivity (0-100)
      const budgetWeight = profile.budgetSensitivity ?? 50;
      if (opt.priceEstimate) {
        const priceImpact = budgetWeight > 70 ? 
          (budgetWeight - 70) * 0.15 :
          budgetWeight < 30 ? 
            (30 - budgetWeight) * -0.1 : 
            0;
        adjustedScore += priceImpact;
        reasoning.push(`Budget sensitivity ${budgetWeight} adjusted score by ${priceImpact.toFixed(1)}`);
      }

      // Speed sensitivity  
      const speedWeight = profile.speedSensitivity ?? 50;
      if (opt.etaEstimate) {
        const speedImpact = speedWeight > 70 ?
          (speedWeight - 70) * 0.12 :
          speedWeight < 30 ?
            (30 - speedWeight) * -0.08 :
            0;
        adjustedScore += speedImpact;
        reasoning.push(`Speed sensitivity ${speedWeight} adjusted score by ${speedImpact.toFixed(1)}`);
      }

      // Preferred providers boost  
      if (profile.preferredProviders) {
        const prefMatch = profile.preferredProviders.find(
          p => p.providerName === opt.providerName && p.providerType === opt.providerType
        );
        if (prefMatch) {
          const prefBoost = Math.min(10, prefMatch.preferenceScore / 10);
          adjustedScore += prefBoost;
          reasoning.push(`Preferred provider "${opt.providerName}" boosted score by ${prefBoost.toFixed(1)}`);
        }
      }

      // Disliked providers penalty
      if (profile.dislikedProviders) {
        const dislikeMatch = profile.dislikedProviders.find(
          p => p.providerName === opt.providerName && p.providerType === opt.providerType
        );
        if (dislikeMatch) {
          const dislikePenalty = Math.min(15, dislikeMatch.rejectionScore / 6.67);
          adjustedScore -= dislikePenalty;
          reasoning.push(`Disliked provider "${opt.providerName}" penalized score by ${dislikePenalty.toFixed(1)}`);
        }
      }
    }

    // Ensure score stays within bounds
    adjustedScore = Math.max(0, Math.min(100, adjustedScore));

    return {
      ...opt,
      adjustedScore,
      reasoning
    };
  });
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
