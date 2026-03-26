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
  
  // Enhanced detection patterns with weights
  const patterns: Record<AyoCategory, {regex: RegExp, weight: number}[]> = {
    ride: [
      {regex: /(ride|uber|lyft|taxi|cab)/, weight: 1.0},
      {regex: /(get me to|need (a|to) go)/, weight: 0.9},
      {regex: /(pick me up|drop me off)/, weight: 0.95},
      {regex: /(drive|transport|carpool)/, weight: 0.8}
    ],
    food: [
      {regex: /(food|eat|hungry|restaurant)/, weight: 1.0},
      {regex: /(order(?!.*ship)|takeout|delivery)/, weight: 0.95},
      {regex: /(dinner|lunch|breakfast|meal)/, weight: 0.85},
      {regex: /(hungry|starving|craving)/, weight: 0.9}
    ],
    delivery: [
      {regex: /(deliver|ship|send|mail)/, weight: 1.0},
      {regex: /(package|parcel)/, weight: 0.9},
      {regex: /(ups|usps|fedex|dhl)/, weight: 0.95},
      {regex: /(same day|overnight)/, weight: 0.85},
      {regex: /(courier|dispatch)/, weight: 0.8}
    ],
    business: [
      {regex: /(business|shop|store)/, weight: 1.0},
      {regex: /(mechanic|repair|service)/, weight: 0.9},
      {regex: /(haircut|barber|salon)/, weight: 0.85},
      {regex: /(doctor|dentist|appointment)/, weight: 0.95}
    ],
    shopping: [
      {regex: /(buy|purchase)/, weight: 1.0},
      {regex: /(shop(|ping)|store)/, weight: 0.9},
      {regex: /(product|item|goods)/, weight: 0.85},
      {regex: /(best deal|price|cheap)/, weight: 0.95}
    ],
    travel: [
      {regex: /(flight|airplane)/, weight: 1.0},
      {regex: /(hotel|accommodation)/, weight: 0.9},
      {regex: /(vacation|trip)/, weight: 0.85},
      {regex: /(travel|journey)/, weight: 0.8}
    ],
    advice: [
      {regex: /(what should|how to)/, weight: 1.0},
      {regex: /(best way|recommend)/, weight: 0.95},
      {regex: /(should i|advice)/, weight: 0.9},
      {regex: /(opinion|suggestion)/, weight: 0.85}
    ]
  };

  // Calculate category scores
  const categoryScores = Object.entries(patterns).map(([cat, regexes]) => {
    const score = regexes.reduce((sum, {regex, weight}) => {
      return sum + (regex.test(text) ? weight : 0);
    }, 0);
    return {category: cat as AyoCategory, score};
  }).filter(({score}) => score > 0);

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
      // Enhanced budget sensitivity with non-linear scaling
      const budgetWeight = profile.budgetSensitivity ?? 50;
      if (opt.priceEstimate) {
        const priceImpact = Math.tanh((budgetWeight - 50) / 25) * 10;
        adjustedScore += priceImpact;
        reasoning.push(`Budget sensitivity ${budgetWeight} adjusted score by ${priceImpact.toFixed(1)}`);
      }

      // Enhanced speed sensitivity with exponential decay
      const speedWeight = profile.speedSensitivity ?? 50;
      if (opt.etaEstimate) {
        const speedImpact = Math.exp(-Math.abs(speedWeight - 50) / 25) * 8;
        adjustedScore += speedImpact;
        reasoning.push(`Speed sensitivity ${speedWeight} adjusted score by ${speedImpact.toFixed(1)}`);
      }

      // Enhanced trust sensitivity with sigmoid function
      const trustWeight = profile.trustSensitivity ?? 50;
      if (opt.trustScore) {
        const trustImpact = 1 / (1 + Math.exp(-(trustWeight - 50) / 10)) * 6;
        adjustedScore += trustImpact;
        reasoning.push(`Trust sensitivity ${trustWeight} adjusted score by ${trustImpact.toFixed(1)}`);
      }

      // Enhanced provider preferences with diminishing returns
      if (profile.preferredProviders) {
        const prefMatch = profile.preferredProviders.find(
          p => p.providerName === opt.providerName && p.providerType === opt.providerType
        );
        if (prefMatch) {
          const prefBoost = Math.log1p(prefMatch.preferenceScore) * 2;
          adjustedScore += prefBoost;
          reasoning.push(`Preferred provider "${opt.providerName}" boosted score by ${prefBoost.toFixed(1)}`);
        }
      }

      // Enhanced disliked providers with exponential penalty
      if (profile.dislikedProviders) {
        const dislikeMatch = profile.dislikedProviders.find(
          p => p.providerName === opt.providerName && p.providerType === opt.providerType
        );
        if (dislikeMatch) {
          const dislikePenalty = Math.exp(dislikeMatch.rejectionScore / 25) * -1.5;
          adjustedScore += dislikePenalty;
          reasoning.push(`Disliked provider "${opt.providerName}" penalized score by ${dislikePenalty.toFixed(1)}`);
        }
      }
    }

    // Ensure score stays within bounds with soft clipping
    adjustedScore = 100 / (1 + Math.exp(-(adjustedScore - 50) / 25));

    return {
      ...opt,
      adjustedScore: Math.round(adjustedScore),
      reasoning,
      flags: [
        ...(opt.flags || []),
        ...(adjustedScore > 90 ? ['top_pick'] : []),
        ...(adjustedScore < 30 ? ['low_confidence'] : [])
      ]
    };
  });
}

export function generateAyoRecommendation(
  input: string,
  profile?: AyoProfile
): AyoResult {
  const { category, intent } = detectIntent(input);
  
  // Base options with enhanced reasoning
  const baseOptions: Record<AyoCategory, AyoOption[]> = {
    ride: [
      {
        providerType: "ride",
        providerName: "UberX",
        baseScore: 81,
        priceEstimate: "$18-$24",
        etaEstimate: "6 min",
        trustScore: 78,
        notes: "Balanced speed and availability.",
        reasoning: [
          "Consistent availability across most areas",
          "Reliable pricing estimates",
          "Wide driver network"
        ]
      },
      {
        providerType: "ride",
        providerName: "Lyft",
        baseScore: 84,
        priceEstimate: "$17-$23",
        etaEstimate: "5 min",
        trustScore: 82,
        notes: "Best overall current ride option.",
        reasoning: [
          "Slightly better pricing than competitors",
          "Fastest average pickup times",
          "Excellent driver ratings"
        ]
      },
      {
        providerType: "ride",
        providerName: "Transit + Walk",
        baseScore: 72,
        priceEstimate: "$2-$5",
        etaEstimate: "18 min",
        trustScore: 88,
        notes: "Cheapest option if you can trade speed for savings.",
        reasoning: [
          "Most cost-effective solution",
          "Environmentally friendly",
          "Highest reliability score"
        ]
      }
    ],

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
