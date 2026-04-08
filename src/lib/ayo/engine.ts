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
  reasoningDetails?: {
    topReason?: string;
    tradeoff?: string;
    whyNow?: string;
    confidence?: number;
  };
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

function validateProfileSensitivity(score: number | undefined, fieldName: string): number {
  if (score === undefined) return 50;
  if (score < 0 || score > 100) {
    console.warn(`Invalid ${fieldName} value ${score}, clamping to 0-100 range`);
    return Math.max(0, Math.min(100, score));
  }
  return score;
}

function calculateOptionScores(
  options: AyoOption[],
  profile?: AyoProfile
): AyoOption[] {
  // Validate profile scores
  const validatedProfile = profile ? {
    ...profile,
    budgetSensitivity: validateProfileSensitivity(profile.budgetSensitivity, 'budgetSensitivity'),
    speedSensitivity: validateProfileSensitivity(profile.speedSensitivity, 'speedSensitivity'),
    trustSensitivity: validateProfileSensitivity(profile.trustSensitivity, 'trustSensitivity'),
    convenienceSensitivity: validateProfileSensitivity(profile.convenienceSensitivity, 'convenienceSensitivity')
  } : undefined;
  return options.map(opt => {
    const reasoning: string[] = [];
    let adjustedScore = opt.baseScore;
    
    // Apply profile preferences
    if (validatedProfile) {
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
    general: [
      {
        providerType: "general",
        providerName: "Ayo Default",
        baseScore: 75,
        notes: "General recommendation when no specific category matches.",
        reasoning: [
          "Broad applicability",
          "Balanced approach",
          "Reliable default"
        ]
      }
    ],
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
    food: [
      {
        providerType: "food",
        providerName: "DoorDash Top Pick",
        baseScore: 82,
        priceEstimate: "$22-$28",
        etaEstimate: "24 min",
        trustScore: 80,
        notes: "Best balance of speed and consistency.",
        reasoning: [
          "Wide restaurant selection",
          "Reliable delivery times",
          "Good customer support"
        ]
      },
      {
        providerType: "food",
        providerName: "Uber Eats Best Value",
        baseScore: 79,
        priceEstimate: "$16-$21",
        etaEstimate: "29 min",
        trustScore: 76,
        notes: "Lower total cost and solid quality.",
        reasoning: [
          "Competitive pricing",
          "Good restaurant partnerships",
          "Easy to use app"
        ]
      },
      {
        providerType: "food",
        providerName: "Pickup Nearby",
        baseScore: 75,
        priceEstimate: "$14-$19",
        etaEstimate: "14 min",
        trustScore: 90,
        notes: "Best if you want the freshest option and lowest fees.",
        reasoning: [
          "Freshest food quality",
          "No delivery fees",
          "Support local businesses"
        ]
      }
    ],
    delivery: [
      {
        providerType: "delivery",
        providerName: "UPS Ground",
        baseScore: 86,
        priceEstimate: "$9-$14",
        etaEstimate: "2-4 days",
        trustScore: 89,
        notes: "Best default balance of cost and reliability.",
        reasoning: [
          "Wide coverage area",
          "Reliable tracking",
          "Good customer service"
        ]
      },
      {
        providerType: "delivery",
        providerName: "USPS Priority Mail",
        baseScore: 80,
        priceEstimate: "$8-$12",
        etaEstimate: "2-3 days",
        trustScore: 74,
        notes: "Good if cost matters slightly more.",
        reasoning: [
          "Cost-effective",
          "Wide network",
          "Government-backed"
        ]
      },
      {
        providerType: "delivery",
        providerName: "FedEx Express Saver",
        baseScore: 78,
        priceEstimate: "$16-$24",
        etaEstimate: "1-3 days",
        trustScore: 84,
        notes: "Good faster option if urgency is higher.",
        reasoning: [
          "Fast delivery options",
          "Reliable service",
          "Good for time-sensitive packages"
        ]
      }
    ],
    business: [
      {
        providerType: "business",
        providerName: "Highest Trust Local Option",
        baseScore: 88,
        trustScore: 92,
        notes: "Best trust-weighted local recommendation.",
        reasoning: [
          "Highest customer satisfaction",
          "Proven track record",
          "Excellent reviews"
        ]
      },
      {
        providerType: "business",
        providerName: "Best Value Local Option",
        baseScore: 82,
        trustScore: 80,
        notes: "Best value recommendation for price-conscious users.",
        reasoning: [
          "Competitive pricing",
          "Good quality",
          "Budget-friendly"
        ]
      },
      {
        providerType: "business",
        providerName: "Fastest Available Local Option",
        baseScore: 79,
        trustScore: 76,
        notes: "Best if speed matters most.",
        reasoning: [
          "Quick turnaround",
          "Efficient service",
          "Time-sensitive solutions"
        ]
      }
    ],
    advice: [
      {
        providerType: "advice",
        providerName: "Ayo Expert",
        baseScore: 85,
        notes: "Personalized recommendation based on your needs.",
        reasoning: [
          "Context-aware suggestions",
          "Balanced perspective",
          "Trusted advice"
        ]
      }
    ],
    shopping: [
      {
        providerType: "shopping",
        providerName: "Best Value Retailer",
        baseScore: 82,
        notes: "Top-rated shopping option for your needs.",
        reasoning: [
          "Price-quality balance",
          "Reliable service",
          "Good return policy"
        ]
      }
    ],
    travel: [
      {
        providerType: "travel",
        providerName: "Top Travel Option",
        baseScore: 83,
        notes: "Recommended travel solution.",
        reasoning: [
          "Best value",
          "Reliable service",
          "Good customer support"
        ]
      }
    ]
  };

  const options = baseOptions[category] || baseOptions.general;
  const scoredOptions = calculateOptionScores(options, profile);
  
  const primary = scoredOptions[0];
  const alternatives = scoredOptions.slice(1);

  return {
    requestId: (() => {
      try {
        if (typeof window !== 'undefined' && window.crypto) {
          return window.crypto.randomUUID();
        }
        if (typeof require === 'function') {
          return require('crypto').randomUUID();
        }
        throw new Error('No UUID generation method available');
      } catch (err) {
        // Fallback to timestamp-based ID if crypto fails
        return `temp-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      }
    })(),
    timestamp: new Date().toISOString(),
    detectedIntent: intent,
    category,
    primary,
    alternatives,
    summary: `Ayo recommends ${primary.providerName} as your best option for ${category} needs.`,
    debug: {
      profileInfluence: profile ? {
        budgetSensitivity: profile.budgetSensitivity,
        speedSensitivity: profile.speedSensitivity,
        trustSensitivity: profile.trustSensitivity
      } : undefined
    }
  };
}
