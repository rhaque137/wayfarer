import { z } from "zod";
import { withActivityPhoto } from "@/lib/activity-media";

export const activitySchema = z.object({
  id: z.string().min(1),
  placeId: z.string().optional(),
  title: z.string().min(1).optional(),
  name: z.string().min(1),
  category: z.string().min(1).default("Activity"),
  description: z.string().min(1).default("Details are being refined."),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  locationName: z.string().optional(),
  address: z.string().optional(),
  rating: z.number().min(0).max(5).optional(),
  photoUrl: z.string().url().optional(),
  imageUrl: z.string().url().optional(),
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional(),
  startsAt: z.string().optional(),
  durationMinutes: z.number().int().positive().optional(),
  estimatedCost: z.number().min(0).optional(),
  currency: z.string().optional(),
  sourceName: z.string().optional(),
  sourceUrl: z.string().url().optional(),
  confidence: z.number().min(0).max(1).optional(),
  lastCheckedAt: z.string().optional(),
  verificationStatus: z.enum(["verified", "ai_suggestion", "needs_verification"]).default("ai_suggestion"),
  notes: z.string().optional(),
  locked: z.boolean().default(false),
  isLocked: z.boolean().optional(),
});

export const daySchema = z.object({
  id: z.string().min(1),
  dayNumber: z.number().int().positive(),
  title: z.string().min(1).optional(),
  date: z.string().min(1),
  summary: z.string().optional(),
  theme: z.string().optional(),
  activities: z.array(activitySchema).default([]),
});

export const budgetItemSchema = z.object({
  id: z.string().min(1),
  category: z.string().min(1),
  label: z.string().min(1),
  estimatedCost: z.number().min(0),
  actualCost: z.number().min(0).optional(),
  currency: z.string().min(1),
});

export const travelLegSchema = z.object({
  fromActivityId: z.string().min(1),
  toActivityId: z.string().min(1),
  mode: z.string().min(1),
  estimatedDurationMinutes: z.number().int().positive().optional(),
  notes: z.string().optional(),
});

export const tripSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1).optional(),
  name: z.string().min(1),
  destination: z.string().min(1),
  summary: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  tripLengthDays: z.number().int().positive().optional(),
  numPeople: z.number().int().positive().optional(),
  travelers: z.number().int().positive().optional(),
  budgetLevel: z.string().optional(),
  budgetCurrency: z.string().optional(),
  days: z.array(daySchema).min(1),
  budgetItems: z.array(budgetItemSchema).default([]),
  travelLegs: z.array(travelLegSchema).default([]),
  notes: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  sourcePrompt: z.string().optional(),
  isPublic: z.boolean().optional(),
  shareId: z.string().optional(),
  promptHash: z.string().optional(),
  status: z.enum(["draft", "generating", "complete", "failed"]).optional(),
  visibility: z.enum(["private", "local", "public_snapshot"]).optional(),
  schemaVersion: z.number().int().positive().optional(),
});

export const aiTripResponseSchema = z.object({
  message: z.string().min(1),
  trip: tripSchema.omit({ id: true }).extend({ id: z.string().optional() }).nullable(),
});

export type Activity = z.infer<typeof activitySchema>;
export type Day = z.infer<typeof daySchema>;
export type BudgetItem = z.infer<typeof budgetItemSchema>;
export type TravelLeg = z.infer<typeof travelLegSchema>;
export type Trip = z.infer<typeof tripSchema>;
export type AITripResponse = z.infer<typeof aiTripResponseSchema>;

export const GENERIC_PLACE_PATTERNS = [
  /^.+ central landmark$/i,
  /^.+ historic quarter walk$/i,
  /^.+ local food district$/i,
  /^central landmark$/i,
  /^historic quarter$/i,
  /^food district$/i,
  /^restaurant cluster$/i,
  /^photo stop$/i,
  /^orientation walk$/i,
  /^check-?in at hotel$/i,
];

const destinationDefaults: Record<string, { lat: number; lng: number; address: string }> = {
  lisbon: { lat: 38.7223, lng: -9.1393, address: "Lisbon, Portugal" },
  kyoto: { lat: 35.0116, lng: 135.7681, address: "Kyoto, Japan" },
  tokyo: { lat: 35.6762, lng: 139.6503, address: "Tokyo, Japan" },
  paris: { lat: 48.8566, lng: 2.3522, address: "Paris, France" },
  rome: { lat: 41.9028, lng: 12.4964, address: "Rome, Italy" },
  bali: { lat: -8.4095, lng: 115.1889, address: "Bali, Indonesia" },
  barcelona: { lat: 41.3874, lng: 2.1686, address: "Barcelona, Spain" },
  "new york": { lat: 40.7128, lng: -74.006, address: "New York, NY" },
  "new york city": { lat: 40.7128, lng: -74.006, address: "New York, NY" },
  nyc: { lat: 40.7128, lng: -74.006, address: "New York, NY" },
  toronto: { lat: 43.6532, lng: -79.3832, address: "Toronto, Ontario, Canada" },
  madrid: { lat: 40.4168, lng: -3.7038, address: "Madrid, Spain" },
};

export function parseDestinationFromPrompt(prompt: string) {
  const lower = prompt.toLowerCase();
  for (const key of Object.keys(destinationDefaults).sort((a, b) => b.length - a.length)) {
    if (lower.includes(key)) return titleCase(key);
  }
  const match = prompt.match(/\b(?:in|to|for)\s+([A-Z][A-Za-z\s-]{1,60}?)(?=\s+(?:with|including|near|focused on|featuring|that|where|and|under|around|on a)\b|[.,;:]|$)/);
  const destination = match?.[1]?.replace(/\s+(?:itinerary|trip|plan)$/i, "").trim();
  return destination || "Lisbon";
}

export function parseTripLengthDays(prompt: string) {
  const lower = prompt.toLowerCase();
  const explicit = lower.match(/\b(\d{1,2})\s*(?:day|days)\b/);
  if (explicit) return clampDays(Number(explicit[1]));

  const lengthLine = lower.match(/trip length:\s*(\d{1,2})/);
  if (lengthLine) return clampDays(Number(lengthLine[1]));

  const dateRange = lower.match(/(?:dates|travel dates):\s*[^.]*?(\d{1,2})\s*[–-]\s*(\d{1,2})/);
  if (dateRange) {
    const start = Number(dateRange[1]);
    const end = Number(dateRange[2]);
    if (Number.isFinite(start) && Number.isFinite(end) && end >= start) return clampDays(end - start + 1);
  }

  return undefined;
}

export function buildMockTrip(prompt: string, id = `local-${Date.now()}`): Trip {
  const destination = parseDestinationFromPrompt(prompt);
  const defaults = destinationDefaults[destination.toLowerCase()];
  const requestedDays = parseTripLengthDays(prompt) ?? 3;

  const trip: Trip = {
    id,
    title: `${destination} Starter Plan`,
    name: `${destination} Starter Plan`,
    destination,
    summary: "A practical starter itinerary you can edit, map, save, and refine with AI.",
    numPeople: 2,
    travelers: 2,
    tripLengthDays: requestedDays,
    budgetLevel: "Flexible",
    budgetCurrency: "USD",
    sourcePrompt: prompt,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    notes: "",
    days: buildFallbackDays(destination, requestedDays, defaults),
    budgetItems: [
      { id: "budget-lodging", category: "Lodging", label: "Hotel or apartment", estimatedCost: 320, currency: "USD" },
      { id: "budget-food", category: "Food", label: "Meals and snacks", estimatedCost: 160, currency: "USD" },
      { id: "budget-transit", category: "Transit", label: "Local transit", estimatedCost: 60, currency: "USD" },
      { id: "budget-activities", category: "Activities", label: "Tickets and tours", estimatedCost: 90, currency: "USD" },
      { id: "budget-misc", category: "Misc", label: "Buffer", estimatedCost: 75, currency: "USD" },
    ],
    travelLegs: [],
  };
  return applyPromptConstraints(trip, prompt);
}

function buildFallbackDays(
  destination: string,
  requestedDays: number,
  defaults?: { lat: number; lng: number; address: string },
): Day[] {
  const templates = getDestinationTemplates(destination);

  return Array.from({ length: requestedDays }, (_, idx) => {
    const template = templates[idx % templates.length];
    const dayNumber = idx + 1;
    return {
      id: `day${dayNumber}`,
      dayNumber,
      title: template.title,
      date: `Day ${dayNumber}`,
      summary: template.summary,
      theme: template.theme,
      activities: template.activities.map((activity, actIdx) =>
        withActivityPhoto({
          id: `act-${dayNumber}-${actIdx + 1}`,
          placeId: slug(activity.locationName),
          title: activity.title,
          name: activity.title,
          category: activity.category,
          description: activity.description,
          locationName: activity.locationName,
          address: activity.address ?? defaults?.address ?? destination,
          lat: activity.lat ?? (defaults ? defaults.lat + (idx * 0.012) + (actIdx * 0.006) : undefined),
          lng: activity.lng ?? (defaults ? defaults.lng + (idx * -0.01) + (actIdx * 0.007) : undefined),
          estimatedCost: activity.estimatedCost,
          currency: "USD",
          confidence: 0.72,
          verificationStatus: "ai_suggestion" as const,
          notes: "AI suggestion. Verify hours, transit, and booking details before travel.",
          locked: false,
        }, destination),
      ),
    };
  });
}

function getDestinationTemplates(destination: string) {
  if (destination.toLowerCase().includes("tokyo")) {
    return [
      {
        title: "Arrival, Shibuya, and first bites",
        summary: "Ease into Tokyo with a central neighborhood walk and a memorable food stop.",
        theme: "Arrival, orientation, food",
        activities: [
          templateActivity("Shibuya Crossing and Hachiko Square", "Landmark", "Start with Tokyo's most recognizable crossing, then explore nearby side streets.", "Shibuya Crossing", 0),
          templateActivity("Shibuya Sky", "Viewpoint", "Book a timed entry for skyline views, ideally near sunset.", "Shibuya Sky", 25),
          templateActivity("Nonbei Yokocho or Ebisu yokocho dinner", "Food", "Try a compact alley dinner area with izakaya-style small plates.", "Nonbei Yokocho", 45),
        ],
      },
      {
        title: "Markets, gardens, and Ginza",
        summary: "Pair food-focused exploring with a classic garden and polished city evening.",
        theme: "Food, gardens, city lights",
        activities: [
          templateActivity("Tsukiji Outer Market breakfast", "Food", "Sample seafood skewers, tamago, and coffee while the market is lively.", "Tsukiji Outer Market", 30),
          templateActivity("Hamarikyu Gardens", "Nature", "Walk the tidal pond gardens and pause at the teahouse.", "Hamarikyu Gardens", 10),
          templateActivity("Ginza galleries and depachika food halls", "Museum", "Browse design shops, small galleries, and basement food halls for dinner ideas.", "Ginza", 35),
        ],
      },
      {
        title: "Museums and modern Tokyo",
        summary: "A culture-heavy day built around specific museums and neighborhoods.",
        theme: "Museums, design, neighborhoods",
        activities: [
          templateActivity("teamLab Planets Toyosu", "Museum", "Reserve ahead for the immersive digital art experience.", "teamLab Planets Toyosu", 35),
          templateActivity("Kiyosumi Shirakawa coffee walk", "Food", "Explore roasteries and calm streets after the museum.", "Kiyosumi Shirakawa", 18),
          templateActivity("Mori Art Museum or Roppongi Hills", "Museum", "Finish with contemporary art and city views in Roppongi.", "Mori Art Museum", 30),
        ],
      },
      {
        title: "Asakusa, Ueno, and old Tokyo",
        summary: "Historic temples, museum options, and relaxed evening food.",
        theme: "History, museums, street food",
        activities: [
          templateActivity("Senso-ji Temple and Nakamise-dori", "Landmark", "Visit early if possible, then snack along the shopping street.", "Senso-ji Temple", 10),
          templateActivity("Tokyo National Museum in Ueno Park", "Museum", "Focus on the Japanese Gallery if time is limited.", "Tokyo National Museum", 20),
          templateActivity("Ameyoko Market dinner crawl", "Food", "Explore casual stalls and izakaya under the rail tracks.", "Ameyoko Market", 35),
        ],
      },
      {
        title: "Harajuku, Meiji, and final favorites",
        summary: "Mix a peaceful shrine, youth culture, and a final memorable meal.",
        theme: "Culture, shopping, food",
        activities: [
          templateActivity("Meiji Shrine", "Landmark", "Walk through the forested approach and visit the shrine before crowds build.", "Meiji Shrine", 0),
          templateActivity("Harajuku and Omotesando", "Shopping", "Explore design stores, street fashion, and cafes.", "Omotesando", 20),
          templateActivity("Shinjuku ramen or Golden Gai evening", "Food", "Choose a ramen shop or compact bar area for a final night out.", "Shinjuku", 40),
        ],
      },
    ];
  }
  if (isParis(destination)) {
    return [
      {
        title: "Saint-Germain, Left Bank, and the Musée d'Orsay",
        summary: "Start with a café ritual, world-class Impressionist art, and an evening in the Latin Quarter.",
        theme: "Coffee, art, neighborhood",
        activities: [
          templateActivity("Café de Flore breakfast", "Cafe", "Classic Saint-Germain café with legendary croissants and café crème. Arrive before 9 AM to beat crowds.", "Café de Flore", 18, "172 Boulevard Saint-Germain, 75006 Paris", 48.854, 2.3328),
          templateActivity("Musée d'Orsay", "Museum", "Impressionist masterworks in a stunning former railway station. Book timed tickets in advance.", "Musée d'Orsay", 16, "1 Rue de la Légion d'Honneur, 75007 Paris", 48.86, 2.3266),
          templateActivity("Sainte-Chapelle", "Landmark", "Gothic chapel on Île de la Cité with extraordinary medieval stained glass — compact and unmissable.", "Sainte-Chapelle", 13, "8 Boulevard du Palais, 75001 Paris", 48.8554, 2.3450),
          templateActivity("Frenchie Bar à Vins", "Restaurant", "Wine bar sibling of Frenchie restaurant; arrive early for a counter seat and natural wine with small plates.", "Frenchie Bar à Vins", 55, "6 Rue du Nil, 75002 Paris", 48.8631, 2.3489),
        ],
      },
      {
        title: "Le Marais, Île Saint-Louis, and Bastille",
        summary: "Medieval streets, the best falafel in Paris, Berthillon ice cream, and a covered market.",
        theme: "History, street food, neighborhoods",
        activities: [
          templateActivity("L'As du Fallafel lunch", "Restaurant", "Lior's legendary crispy falafel on Rue des Rosiers in the Jewish quarter. Cash only, line moves fast.", "L'As du Fallafel", 8, "34 Rue des Rosiers, 75004 Paris", 48.857, 2.3555),
          templateActivity("Place des Vosges and Maison de Victor Hugo", "Landmark", "Paris's oldest planned square. The Victor Hugo house museum is free and excellent.", "Place des Vosges", 0, "Place des Vosges, 75004 Paris", 48.8553, 2.3625),
          templateActivity("Île Saint-Louis and Berthillon", "Walk", "Walk the island's single main street, stop at Berthillon for sorbet, and admire the Seine from the quais.", "Île Saint-Louis", 10, "Île Saint-Louis, 75004 Paris", 48.8503, 2.3563),
          templateActivity("Marché des Enfants Rouges evening", "Food", "Paris's oldest covered market with Moroccan, Japanese, and French stalls — ideal for a casual dinner.", "Marché des Enfants Rouges", 30, "39 Rue de Bretagne, 75003 Paris", 48.8623, 2.3617),
        ],
      },
      {
        title: "Montmartre, Palais Royal, and sunset at Sacré-Cœur",
        summary: "Climb to the village-above-the-city, wander the arcades, and end with a hilltop sunset.",
        theme: "Views, art history, evening",
        activities: [
          templateActivity("Palais Royal gardens and galleries", "Walk", "Elegant arcaded gardens; browse concept stores under the arches and pause at the striped columns.", "Palais Royal", 0, "Place du Palais-Royal, 75001 Paris", 48.8638, 2.337),
          templateActivity("Montmartre and Place du Tertre", "Walk", "Wander the steep cobblestone streets, watch artists at work, and find a quiet side street off the tourist drag.", "Montmartre", 0, "Place du Tertre, 75018 Paris", 48.8866, 2.3408),
          templateActivity("Sacré-Cœur at sunset", "Viewpoint", "Climb to the terrace steps for the best panoramic view of Paris as the city lights up at dusk.", "Sacré-Cœur", 0, "35 Rue du Chevalier de la Barre, 75018 Paris", 48.8867, 2.3431),
          templateActivity("Coquelicot bakery breakfast or Le Relais de la Butte dinner", "Restaurant", "Coquelicot for morning pastries or the Relais de la Butte for classic French bistro dinner after the sunset.", "Coquelicot", 22, "24 Rue des Abbesses, 75018 Paris", 48.8843, 2.3382),
        ],
      },
      {
        title: "Canal Saint-Martin, République, and a Seine evening",
        summary: "A calmer, local day along the canal, indie coffee shops, and a bridge stroll at night.",
        theme: "Neighborhoods, cafes, evening",
        activities: [
          templateActivity("Canal Saint-Martin morning walk", "Walk", "Iron footbridges, tree-lined quais, and concept stores; peak atmosphere on weekday mornings.", "Canal Saint-Martin", 0, "Canal Saint-Martin, 75010 Paris", 48.8687, 2.3628),
          templateActivity("Ten Belles coffee", "Cafe", "Specialty coffee roaster on the canal — one of the best flat whites in Paris.", "Ten Belles", 8, "10 Rue de la Grange aux Belles, 75010 Paris", 48.8717, 2.3634),
          templateActivity("Shakespeare and Company bookshop", "Walk", "Iconic English-language bookshop on the Left Bank with views of Notre-Dame. Free to browse.", "Shakespeare and Company", 0, "37 Rue de la Bûcherie, 75005 Paris", 48.8527, 2.3474),
          templateActivity("Septime or Clown Bar dinner", "Restaurant", "Reserve weeks ahead for Septime's market-driven tasting menu, or walk into Clown Bar for natural wine and small plates.", "Septime", 85, "80 Rue de Charonne, 75011 Paris", 48.853, 2.3769),
        ],
      },
    ];
  }
  if (isNewYork(destination)) {
    return [
      {
        title: "West Village, icons, and downtown food",
        summary: "A walkable Manhattan day with a neighborhood meal, an elevated park, and classic downtown energy.",
        theme: "Food, icons, neighborhoods",
        activities: [
          templateActivity("Buvette West Village breakfast", "Cafe", "Start with a specific West Village favorite before wandering nearby side streets.", "Buvette", 32, "42 Grove St, New York, NY 10014", 40.7327, -74.0042),
          templateActivity("The High Line and Chelsea Market", "Walk", "Walk the elevated park, then use Chelsea Market for snacks or a casual lunch.", "The High Line", 25, "New York, NY 10011", 40.7479, -74.0048),
          templateActivity("Tenement Museum", "Museum", "Book a timed tour for a grounded Lower East Side history stop.", "Tenement Museum", 30, "103 Orchard St, New York, NY 10002", 40.7188, -73.9901),
          templateActivity("Katz's Delicatessen dinner", "Restaurant", "Share pastrami and keep the evening flexible around the Lower East Side.", "Katz's Delicatessen", 35, "205 E Houston St, New York, NY 10002", 40.7223, -73.9874),
        ],
      },
      {
        title: "Brooklyn views and downtown classics",
        summary: "Pair Brooklyn waterfront views with a classic bridge walk and dinner back in Nolita.",
        theme: "Views, walking, dinner",
        activities: [
          templateActivity("Dumbo and Brooklyn Bridge Park", "Viewpoint", "Start by the waterfront for skyline photos and an easy coffee stop.", "Brooklyn Bridge Park", 0, "Brooklyn Bridge Park, Brooklyn, NY", 40.7003, -73.9967),
          templateActivity("Brooklyn Bridge walk", "Walk", "Walk toward Manhattan for the best skyline reveal; go early or late to avoid crowds.", "Brooklyn Bridge", 0, "Brooklyn Bridge, New York, NY", 40.7061, -73.9969),
          templateActivity("9/11 Memorial pools", "Landmark", "A reflective downtown stop before heading north for dinner.", "9/11 Memorial", 0, "180 Greenwich St, New York, NY 10007", 40.7115, -74.0134),
          templateActivity("Rubirosa dinner", "Restaurant", "Reserve ahead for thin-crust pizza and Italian-American classics in Nolita.", "Rubirosa", 55, "235 Mulberry St, New York, NY 10012", 40.7227, -73.9961),
        ],
      },
      {
        title: "Museum Mile and Central Park",
        summary: "A geographically tight Upper East Side day anchored by The Met and Central Park.",
        theme: "Museums, park, classic NYC",
        activities: [
          templateActivity("The Metropolitan Museum of Art", "Museum", "Pick two wings instead of trying to see everything; verify ticket policies before visiting.", "The Metropolitan Museum of Art", 30, "1000 5th Ave, New York, NY 10028", 40.7794, -73.9632),
          templateActivity("Central Park Bethesda Terrace", "Landmark", "Walk through the park to the arcade, fountain, and lake viewpoints.", "Bethesda Terrace", 0, "Bethesda Terrace, New York, NY 10024", 40.7741, -73.9708),
          templateActivity("Levain Bakery Upper West Side", "Cafe", "Add a cookie-and-coffee pause after the park walk.", "Levain Bakery", 12, "167 W 74th St, New York, NY 10023", 40.7799, -73.9803),
          templateActivity("Comedy Cellar evening show", "Nightlife", "Book a show in advance and check the minimum spend policy.", "Comedy Cellar", 35, "117 MacDougal St, New York, NY 10012", 40.7301, -74.0006),
        ],
      },
      {
        title: "Midtown landmarks and final favorites",
        summary: "Keep the last day focused around Midtown so transit stays simple before departure.",
        theme: "Architecture, shopping, final meal",
        activities: [
          templateActivity("Bryant Park and New York Public Library", "Landmark", "See the Rose Main Reading Room if access is available, then pause in Bryant Park.", "New York Public Library", 0, "476 5th Ave, New York, NY 10018", 40.7532, -73.9822),
          templateActivity("Grand Central Terminal", "Landmark", "Use the main concourse and market as a compact architecture and snack stop.", "Grand Central Terminal", 0, "89 E 42nd St, New York, NY 10017", 40.7527, -73.9772),
          templateActivity("MoMA", "Museum", "Choose a focused modern-art visit close to Fifth Avenue and Rockefeller Center.", "The Museum of Modern Art", 25, "11 W 53rd St, New York, NY 10019", 40.7614, -73.9776),
          templateActivity("Xi'an Famous Foods Midtown", "Restaurant", "Finish with a fast, specific, budget-friendly meal near Midtown.", "Xi'an Famous Foods", 18, "24 W 45th St, New York, NY 10036", 40.7564, -73.9807),
        ],
      },
    ];
  }

  if (destination.toLowerCase().includes("toronto")) {
    return [
      {
        title: "Downtown icons and Queen West coffee",
        summary: "Start central, then connect Toronto's food market, art, and west-end neighborhoods.",
        theme: "Downtown, art, coffee",
        activities: [
          templateActivity("Fahrenheit Coffee Richmond", "Cafe", "Begin with a specific independent coffee stop near the financial district before sightseeing.", "Fahrenheit Coffee", 7, "120 Lombard St, Toronto, ON M5C 3H5", 43.6519, -79.3728),
          templateActivity("St. Lawrence Market lunch", "Food", "Browse Toronto's classic food market and try a peameal bacon sandwich or seasonal vendor lunch.", "St. Lawrence Market", 18, "93 Front St E, Toronto, ON M5E 1C3", 43.6487, -79.3715),
          templateActivity("Art Gallery of Ontario", "Museum", "A strong culture anchor with Canadian, Indigenous, and contemporary collections.", "Art Gallery of Ontario", 30, "317 Dundas St W, Toronto, ON M5T 1G4", 43.6536, -79.3925),
          templateActivity("Queen Street West and Trinity Bellwoods", "Walk", "Walk boutiques, galleries, and the park edge for a local-feeling late afternoon.", "Queen Street West", 0, "Queen St W & Trinity Bellwoods Park, Toronto, ON", 43.6471, -79.4138),
        ],
      },
      {
        title: "Kensington, campus, and Ossington",
        summary: "A neighborhood-heavy day built around markets, cafes, and a relaxed dinner strip.",
        theme: "Neighborhoods, food, cafes",
        activities: [
          templateActivity("FIKA Cafe Kensington", "Cafe", "Add a Swedish-style independent coffee stop in Kensington Market before browsing.", "FIKA Cafe", 8, "28 Kensington Ave, Toronto, ON M5T 2J9", 43.6548, -79.4005),
          templateActivity("Kensington Market food crawl", "Food", "Snack through bakeries, tacos, spices, and vintage shops in one of Toronto's best walking areas.", "Kensington Market", 22, "Kensington Market, Toronto, ON", 43.6545, -79.4007),
          templateActivity("Royal Ontario Museum", "Museum", "Use the ROM as a major culture stop; verify temporary exhibits and ticket policies.", "Royal Ontario Museum", 28, "100 Queens Park, Toronto, ON M5S 2C6", 43.6677, -79.3948),
          templateActivity("Ossington dinner at Union or Mamakas", "Restaurant", "Finish on Ossington with a reservation-friendly dinner corridor and bars nearby.", "Ossington Avenue", 45, "Ossington Ave, Toronto, ON", 43.6468, -79.4197),
        ],
      },
      {
        title: "Waterfront, Distillery, and east-end food",
        summary: "Pair waterfront views with brick-lane architecture and a focused dinner plan.",
        theme: "Waterfront, architecture, dinner",
        activities: [
          templateActivity("Boxcar Social Harbourfront", "Cafe", "Coffee near the lake before a waterfront walk; verify current hours before heading over.", "Boxcar Social Harbourfront", 8, "235 Queens Quay W, Toronto, ON M5J 2G8", 43.6391, -79.3836),
          templateActivity("Harbourfront and Toronto Music Garden", "Walk", "Use the lakefront path for views, public art, and an easy low-cost morning.", "Toronto Music Garden", 0, "479 Queens Quay W, Toronto, ON M5V 2Y3", 43.6369, -79.3947),
          templateActivity("Distillery District", "Shopping", "Brick lanes, galleries, and design shops in a compact pedestrian district.", "Distillery District", 10, "55 Mill St, Toronto, ON M5A 3C4", 43.6503, -79.3596),
          templateActivity("Pai Northern Thai Kitchen dinner", "Restaurant", "A specific downtown dinner pick with strong vegetarian and group options; expect a wait.", "Pai Northern Thai Kitchen", 35, "18 Duncan St, Toronto, ON M5H 3G8", 43.6479, -79.3887),
        ],
      },
    ];
  }

  if (destination.toLowerCase().includes("madrid")) {
    return [
      {
        title: "Sol, Austrias, and tapas classics",
        summary: "Start with Madrid's historic core, a market lunch, and a classic tapas evening.",
        theme: "Historic center, food, plazas",
        activities: [
          templateActivity("Puerta del Sol and Plaza Mayor walk", "Walk", "Use Madrid's two central plazas as your orientation point, then wander the Austrias lanes before lunch.", "Puerta del Sol", 0, "Puerta del Sol, Madrid, Spain", 40.4169, -3.7035),
          templateActivity("Mercado de San Miguel lunch", "Food", "Try a grazing lunch of tortilla, croquetas, olives, and vermouth in Madrid's best-known market hall.", "Mercado de San Miguel", 22, "Pl. de San Miguel, s/n, Centro, 28005 Madrid, Spain", 40.4154, -3.7089),
          templateActivity("Royal Palace of Madrid", "Landmark", "Book palace tickets ahead if you want the state rooms; the Sabatini Gardens are a good low-cost alternative.", "Royal Palace of Madrid", 16, "C. de Bailen, s/n, 28071 Madrid, Spain", 40.4179, -3.7143),
          templateActivity("Sobrino de Botin dinner", "Restaurant", "Reserve for Madrid's old-school roast house experience, or use nearby Cava Baja for a more casual tapas crawl.", "Sobrino de Botin", 45, "C. de Cuchilleros, 17, 28005 Madrid, Spain", 40.414, -3.708),
        ],
      },
      {
        title: "Prado, Retiro, and literary Madrid",
        summary: "Anchor the day with art, park time, and Barrio de las Letras.",
        theme: "Museums, park, cafes",
        activities: [
          templateActivity("Museo del Prado", "Museum", "Focus on Velazquez, Goya, and Bosch rather than trying to see every room; timed tickets help.", "Museo Nacional del Prado", 15, "C. de Ruiz de Alarcon, 23, 28014 Madrid, Spain", 40.4138, -3.6921),
          templateActivity("El Retiro Park and Crystal Palace", "Nature", "Walk to the Palacio de Cristal and lake for a calm reset between museum stops.", "El Retiro Park", 0, "Plaza de la Independencia, 7, 28001 Madrid, Spain", 40.4153, -3.6844),
          templateActivity("Barrio de las Letras cafe stop", "Cafe", "Pause in the literary quarter and keep the afternoon walkable around Huertas and Santa Ana.", "Barrio de las Letras", 10, "Barrio de las Letras, Madrid, Spain", 40.4144, -3.6993),
          templateActivity("Casa Alberto dinner", "Restaurant", "Classic tavern cooking in the literary quarter; reserve or arrive early for a table.", "Casa Alberto", 38, "C. de las Huertas, 18, 28012 Madrid, Spain", 40.4132, -3.7007),
        ],
      },
      {
        title: "Malasana, Chueca, and live music",
        summary: "Independent shops, coffee, nightlife, and modern Madrid.",
        theme: "Neighborhoods, nightlife, shopping",
        activities: [
          templateActivity("Toma Cafe Malasana", "Cafe", "Start with a specialty coffee stop before wandering Madrid's independent-shop streets.", "Toma Cafe", 8, "C. de la Palma, 49, 28004 Madrid, Spain", 40.4265, -3.7042),
          templateActivity("Malasana and Conde Duque walk", "Walk", "Browse boutiques, record shops, and quiet plazas around Conde Duque without needing much transit.", "Malasana", 0, "Malasana, Madrid, Spain", 40.426, -3.7044),
          templateActivity("Museo del Romanticismo", "Museum", "A compact museum that fits the neighborhood day and gives a different angle on Madrid history.", "Museo del Romanticismo", 5, "C. de San Mateo, 13, 28004 Madrid, Spain", 40.4258, -3.6987),
          templateActivity("Cafe Central jazz evening", "Nightlife", "Check the set calendar and book ahead for a polished live-music night near Plaza de Santa Ana.", "Cafe Central", 25, "Pl. del Angel, 10, 28012 Madrid, Spain", 40.4144, -3.7018),
        ],
      },
      {
        title: "La Latina, Rastro, and sunset views",
        summary: "Markets, tapas lanes, and sunset from the west side.",
        theme: "Markets, tapas, viewpoints",
        activities: [
          templateActivity("El Rastro market", "Shopping", "Go Sunday morning if possible for Madrid's famous flea market; keep valuables secure in the crowds.", "El Rastro", 0, "Pl. de Cascorro, 28005 Madrid, Spain", 40.4079, -3.7073),
          templateActivity("La Latina tapas crawl", "Food", "Use Cava Baja for a flexible tapas route with vermouth, pintxos, and small plates.", "Cava Baja", 28, "C. de la Cava Baja, 28005 Madrid, Spain", 40.4123, -3.7083),
          templateActivity("Basilica de San Francisco el Grande", "Landmark", "A quieter landmark with a huge dome and strong interiors, close to La Latina.", "San Francisco el Grande", 5, "C. San Buenaventura, 1, 28005 Madrid, Spain", 40.4108, -3.7148),
          templateActivity("Temple of Debod sunset", "Viewpoint", "Arrive before sunset for one of Madrid's best skyline viewpoints and a relaxed final evening.", "Temple of Debod", 0, "C. de Ferraz, 1, 28008 Madrid, Spain", 40.424, -3.7178),
        ],
      },
    ];
  }

  if (isLisbon(destination)) {
    return [
      {
        title: "Alfama, Miradouros, and a Fado evening",
        summary: "Historic hilltop streets, azulejo-tiled viewpoints, and live Fado music.",
        theme: "History, views, music",
        activities: [
          templateActivity("Pastéis de Belém breakfast", "Cafe", "The original pastel de nata bakery; arrive early and eat them warm with cinnamon and sugar at the marble counter.", "Pastéis de Belém", 5, "Rua de Belém 84-92, 1300-085 Lisboa", 38.6975, -9.2033),
          templateActivity("São Jorge Castle and Alfama walk", "Landmark", "Moorish hilltop fortress with sweeping Tagus views, then wind down through Alfama's steep lanes.", "São Jorge Castle", 10, "Rua de Santa Cruz do Castelo, 1100-129 Lisboa", 38.7139, -9.1337),
          templateActivity("Miradouro das Portas do Sol", "Viewpoint", "One of Lisbon's best lookout points — perfect at golden hour with a Sagres beer.", "Miradouro das Portas do Sol", 0, "Largo das Portas do Sol, 1100-411 Lisboa", 38.7113, -9.1307),
          templateActivity("Tasca do Chico Fado dinner", "Nightlife", "Intimate Fado venue in Bairro Alto; book well ahead for dinner and a live show.", "Tasca do Chico", 45, "Rua do Diário de Notícias 39, 1200-143 Lisboa", 38.7108, -9.1441),
        ],
      },
      {
        title: "LX Factory, Belém, and the Tejo waterfront",
        summary: "A creative market complex, Portugal's most famous monument, and an evening on the river.",
        theme: "Culture, food, river",
        activities: [
          templateActivity("LX Factory Sunday market", "Shopping", "Converted industrial complex with design shops, vintage stalls, and great brunch spots. Sunday market is the highlight.", "LX Factory", 0, "Rua Rodrigues de Faria 103, 1300-501 Lisboa", 38.7031, -9.1773),
          templateActivity("Torre de Belém", "Landmark", "Iconic 16th-century tower on the Tagus — buy tickets online to skip the queue.", "Torre de Belém", 8, "Avenida Brasília, 1400-038 Lisboa", 38.6916, -9.2159),
          templateActivity("Jerónimos Monastery", "Landmark", "Manueline Gothic masterpiece and the resting place of Vasco da Gama; the cloisters are unmissable.", "Mosteiro dos Jerónimos", 10, "Praça do Império 1400-206 Lisboa", 38.6978, -9.2065),
          templateActivity("Time Out Market Lisboa dinner", "Food", "Best-in-class food hall under one roof: Henrique Sá Pessoa's stall, A Cevicheria, and a dozen great options.", "Time Out Market", 30, "Avenida 24 de Julho 49, 1200-479 Lisboa", 38.707, -9.1476),
        ],
      },
      {
        title: "Bairro Alto, Chiado, and the Tram 28",
        summary: "A day for aperitivos, bookshops, boutiques, and Lisbon's most scenic tram route.",
        theme: "Shopping, cafes, evening",
        activities: [
          templateActivity("Tram 28 scenic ride", "Walk", "Lisbon's most famous tram route through Graça, Alfama, and the historic center — go early to get a seat.", "Eléctrico 28", 0, "Campo de Ourique, Lisboa", 38.7148, -9.1578),
          templateActivity("Livraria Bertrand Chiado", "Walk", "World's oldest operating bookshop — browse in peace and pick up a Portuguese novel.", "Livraria Bertrand", 0, "Rua Garrett 73, 1200-203 Lisboa", 38.71, -9.1413),
          templateActivity("A Cevicheria lunch", "Restaurant", "Best ceviche in Lisbon; compact and always busy — arrive at noon when it opens.", "A Cevicheria", 35, "Rua Dom Pedro V 129, 1250-094 Lisboa", 38.7145, -9.1485),
          templateActivity("Pavilhão Chinês bar", "Nightlife", "Eccentric bar packed floor-to-ceiling with antiques and curiosities; arrive before midnight for a quieter drink.", "Pavilhão Chinês", 15, "Rua Dom Pedro V 89, 1250-093 Lisboa", 38.7141, -9.148),
        ],
      },
    ];
  }

  if (isBarcelona(destination)) {
    return [
      {
        title: "Gothic Quarter, Born, and La Barceloneta",
        summary: "Medieval lanes, the best pintxos bar in Born, and a beach sunset.",
        theme: "History, food, beach",
        activities: [
          templateActivity("La Boqueria market breakfast", "Food", "Barcelona's famous covered market on La Rambla — arrive by 9 AM before the crowds and buy fruit, jamón, and coffee.", "Mercat de la Boqueria", 15, "La Rambla, 91, 08001 Barcelona", 41.3817, 2.1715),
          templateActivity("Barri Gòtic and Plaça Reial", "Walk", "Wander Roman ruins, Gothic cathedrals, and the columned square at the heart of the old city.", "Barri Gòtic", 0, "Plaça Reial, 08002 Barcelona", 41.3793, 2.1751),
          templateActivity("El Xampanyet cava bar", "Nightlife", "Classic cava bar in El Born open since 1929; arrive at 7 PM for house cava and anchovies.", "El Xampanyet", 20, "Carrer de Montcada 22, 08003 Barcelona", 41.3841, 2.181),
          templateActivity("La Barceloneta beach sunset", "Viewpoint", "Walk the seafront promenade and watch the sun drop into the Mediterranean. Best from the W Hotel jetty.", "La Barceloneta", 0, "La Barceloneta, 08003 Barcelona", 41.3765, 2.1894),
        ],
      },
      {
        title: "Gaudí, Gràcia, and rooftop cocktails",
        summary: "The Sagrada Família, a neighborhood park, and the most beautiful rooftop in the city.",
        theme: "Architecture, neighborhoods, views",
        activities: [
          templateActivity("Sagrada Família", "Landmark", "Gaudí's unfinished basilica — book the tower entry online weeks ahead for the full experience.", "Sagrada Família", 26, "Carrer de Mallorca 401, 08013 Barcelona", 41.4036, 2.1744),
          templateActivity("Park Güell", "Landmark", "Gaudí's colorful hilltop park; timed entry for the Monumental Zone is required — book early.", "Park Güell", 10, "08024 Barcelona", 41.4145, 2.1527),
          templateActivity("Gràcia neighborhood walk", "Walk", "A village within the city: independent boutiques, lived-in plazas, and weekend market stalls.", "Gràcia", 0, "Gràcia, 08012 Barcelona", 41.4024, 2.1574),
          templateActivity("Bar Calders or Bodega Sepúlveda vermouth", "Food", "Catalan vermouth tradition: olives, chips, and a glass of vermut on a sun-drenched terrace.", "Bar Calders", 12, "Carrer del Parlament 25, 08015 Barcelona", 41.3767, 2.1619),
        ],
      },
      {
        title: "Eixample, Palau de la Música, and a final dinner",
        summary: "Modernista architecture, a concert hall UNESCO site, and Barcelona's best paella.",
        theme: "Music, architecture, food",
        activities: [
          templateActivity("Palau de la Música Catalana tour or concert", "Museum", "Lluís Domènech i Montaner's stained-glass masterpiece; guided tours or evening concerts — book ahead.", "Palau de la Música Catalana", 20, "Carrer Palau de la Música 4-6, 08003 Barcelona", 41.3876, 2.175),
          templateActivity("Casa Batlló or Casa Milà (La Pedrera)", "Landmark", "Choose one Gaudí apartment building — Casa Batlló for drama, La Pedrera for the rooftop.", "Casa Batlló", 35, "Passeig de Gràcia 43, 08007 Barcelona", 41.3916, 2.165),
          templateActivity("Cervecería Catalana brunch", "Cafe", "Busy but excellent brunch spot on Carrer Mallorca with fresh-made pintxos and eggs every style.", "Cervecería Catalana", 22, "Carrer de Mallorca 236, 08008 Barcelona", 41.3914, 2.1601),
          templateActivity("Kaiku or La Mar Salada paella dinner", "Restaurant", "Seafood paella with a view of the port; reserve La Mar Salada well ahead for the traditional version.", "La Mar Salada", 55, "Passeig de Joan de Borbó 58, 08003 Barcelona", 41.378, 2.1876),
        ],
      },
    ];
  }

  if (isRome(destination)) {
    return [
      {
        title: "Vatican, Trastevere, and a Roman sunset",
        summary: "The world's most important museum complex, then a neighborhood dinner in Rome's most atmospheric quarter.",
        theme: "History, art, neighborhood",
        activities: [
          templateActivity("Vatican Museums and Sistine Chapel", "Museum", "Book skip-the-line timed entry online — go first thing. The Gallery of Maps and Raphael Rooms are the hidden highlights.", "Vatican Museums", 22, "Viale Vaticano, 00165 Roma", 41.9065, 12.4534),
          templateActivity("St. Peter's Basilica and dome", "Landmark", "Free entry to the basilica; pay to climb the dome for the best rooftop view in Rome.", "St. Peter's Basilica", 8, "Piazza San Pietro, 00120 Città del Vaticano", 41.9022, 12.4539),
          templateActivity("Campo de' Fiori aperitivo", "Food", "Lively square for Aperol spritz and cicchetti before crossing the river for dinner.", "Campo de' Fiori", 15, "Campo de' Fiori, 00186 Roma", 41.8955, 12.4722),
          templateActivity("Da Enzo al 29 dinner in Trastevere", "Restaurant", "Classic Roman trattoria — cacio e pepe, coda alla vaccinara, and house wine. Book ahead or queue.", "Da Enzo al 29", 40, "Via dei Vascellari 29, 00153 Roma", 41.8876, 12.4684),
        ],
      },
      {
        title: "Ancient Rome, Piazza Navona, and the Pantheon",
        summary: "Colosseum and Forum in the morning, then baroque fountains and an afternoon espresso ritual.",
        theme: "Ancient history, baroque Rome",
        activities: [
          templateActivity("Colosseum and Roman Forum", "Landmark", "Buy timed-entry tickets weeks ahead and include the Forum and Palatine Hill — budget half a day.", "Colosseum", 16, "Piazza del Colosseo 1, 00184 Roma", 41.8902, 12.4922),
          templateActivity("Capitoline Museums", "Museum", "The world's oldest public museum, with Marcus Aurelius's original bronze statue and views over the Forum from the terrace.", "Musei Capitolini", 15, "Piazza del Campidoglio 1, 00186 Roma", 41.8932, 12.4828),
          templateActivity("Pantheon and Sant'Eustachio il Caffè", "Landmark", "Free entry to the ancient temple; then walk 200 metres for what many call Rome's finest espresso.", "Pantheon", 5, "Piazza della Rotonda, 00186 Roma", 41.8986, 12.4769),
          templateActivity("Piazza Navona and Supplì Roma", "Walk", "Bernini's fountains at the baroque showpiece square, then a crispy supplì rice croquette around the corner.", "Piazza Navona", 0, "Piazza Navona, 00186 Roma", 41.899, 12.4731),
        ],
      },
      {
        title: "Borghese, Trevi Fountain, and a final aperitivo",
        summary: "A gallery surrounded by a park, the most famous fountain in the world, and a rooftop Negroni.",
        theme: "Art, icons, evening",
        activities: [
          templateActivity("Galleria Borghese", "Museum", "Bernini sculptures and Caravaggio paintings in a Baroque villa — reservations required, max 2 hours per slot.", "Galleria Borghese", 15, "Piazzale Scipione Borghese 5, 00197 Roma", 41.9142, 12.4922),
          templateActivity("Trevi Fountain early morning", "Landmark", "Go before 8 AM to see it without the crowds — the fountain is lit at night but sunrise is the quietest time.", "Fontana di Trevi", 0, "Piazza di Trevi, 00187 Roma", 41.9009, 12.4833),
          templateActivity("Spanish Steps and Via Condotti", "Walk", "Climb the 135 steps, browse luxury shops on Via Condotti, and pick up a gelato at Della Palma or Giolitti.", "Scalinata di Trinità dei Monti", 0, "Piazza di Spagna, 00187 Roma", 41.9058, 12.4823),
          templateActivity("Pigneto neighborhood aperitivo", "Nightlife", "Rome's coolest up-and-coming neighborhood for natural wine bars and a local crowd at aperitivo hour.", "Pigneto", 18, "Via del Pigneto, 00176 Roma", 41.8857, 12.5289),
        ],
      },
    ];
  }

  if (isBali(destination)) {
    return [
      {
        title: "Ubud: rice terraces, temples, and a cooking class",
        summary: "Ubud's spiritual heart, Tegallalang's staircase paddies, and a hands-on Balinese cooking lesson.",
        theme: "Culture, nature, food",
        activities: [
          templateActivity("Tirta Empul Temple", "Landmark", "Sacred Hindu water temple with purification springs — arrive by 8 AM before tour groups. Bring a sarong.", "Tirta Empul", 3, "Jl. Tirta, Tampaksiring, Gianyar, Bali 80552", -8.4148, 115.3154),
          templateActivity("Tegallalang Rice Terraces", "Viewpoint", "Iconic stepped terraces northwest of Ubud — walk the paths through the paddies and pay the small maintenance fee.", "Tegallalang", 0, "Tegallalang, Gianyar, Bali", -8.4316, 115.2789),
          templateActivity("Locavore or Nusantara lunch", "Restaurant", "Award-winning Indonesian fine dining in Ubud's center; Nusantara (their casual sibling) is easier to book.", "Locavore", 45, "Jl. Dewi Sita No.21, Ubud, Gianyar, Bali", -8.5077, 115.2624),
          templateActivity("Casa Luna Cooking School", "Museum", "Half-day market-to-table Balinese cooking class — join a group class or book private. Start with a market tour.", "Casa Luna Cooking School", 30, "Jl. Bisma, Ubud, Bali 80571", -8.5054, 115.2607),
        ],
      },
      {
        title: "Sacred Monkey Forest, Campuhan Ridge, and Seminyak",
        summary: "A wildlife sanctuary, a misty jungle ridge walk, and Bali's best sunset beach club.",
        theme: "Nature, wellness, beach",
        activities: [
          templateActivity("Sacred Monkey Forest Sanctuary", "Nature", "Ancient temple complex inhabited by 700+ macaques — hold your bags tight and avoid direct eye contact.", "Sacred Monkey Forest", 8, "Jl. Monkey Forest, Ubud, Bali 80571", -8.5187, 115.2621),
          templateActivity("Campuhan Ridge Walk", "Walk", "2 km jungle ridge trail through rice paddies and jungle canopy — coolest and quietest before 8 AM.", "Campuhan Ridge Walk", 0, "Campuhan, Ubud, Bali", -8.4991, 115.2567),
          templateActivity("Tanah Lot Temple at sunset", "Landmark", "Sea temple on a dramatic offshore rock — arrive 90 minutes before sunset to secure a good viewpoint.", "Tanah Lot", 5, "Beraban, Kediri, Tabanan Regency, Bali", -8.6215, 115.0866),
          templateActivity("Ku De Ta or Potato Head beach club", "Nightlife", "Seminyak's landmark sunset beach clubs — Potato Head has the pool and DJ, Ku De Ta for the view. Arrive at 5 PM.", "Potato Head Beach Club", 25, "Jl. Petitenget No.51B, Seminyak, Badung, Bali", -8.6841, 115.1603),
        ],
      },
      {
        title: "Uluwatu, Nusa Dua, and a Kecak fire dance",
        summary: "A clifftop temple, snorkeling at a hidden beach, and Bali's most spectacular sunset performance.",
        theme: "Temples, ocean, culture",
        activities: [
          templateActivity("Uluwatu Temple and cliffs", "Landmark", "Clifftop temple 70 meters above the Indian Ocean — bring a sarong and go late afternoon for the Kecak show.", "Pura Luhur Uluwatu", 3, "Jl. Raya Uluwatu, Pecatu, Kuta Sel., Badung, Bali", -8.8293, 115.0849),
          templateActivity("Kecak fire dance at Uluwatu", "Nightlife", "Spectacular Balinese fire dance performed on an ocean-view stage at sunset. Tickets from the temple entrance.", "Kecak Dance Uluwatu", 10, "Pura Luhur Uluwatu, Bali", -8.8293, 115.0849),
          templateActivity("Warung Ibu Oka or Bebek Tepi Sawah lunch", "Restaurant", "Ibu Oka for legendary Balinese suckling pig (babi guling) — arrive before noon when it sells out.", "Warung Ibu Oka", 8, "Jl. Suweta No.2, Ubud, Gianyar, Bali", -8.5059, 115.2623),
          templateActivity("Blue Point or Single Fin for a final drink", "Nightlife", "Clifftop bars at Uluwatu with Indian Ocean views — Single Fin for Sunday Sessions or Blue Point for the quieter deck.", "Single Fin Bali", 15, "Jl. Mamo, Uluwatu, Pecatu, Kuta Sel., Badung, Bali", -8.8318, 115.0881),
        ],
      },
    ];
  }

  // Generic fallback for all other destinations — still uses real activity patterns, not placeholders
  const dest = destination;
  return [
    {
      title: `Arrival and first impressions`,
      summary: `Orient yourself in ${dest} with the city's iconic landmark, a neighborhood walk, and a local dinner.`,
      theme: "Arrival, sightseeing, food",
      activities: [
        templateActivity(`Main historic district walking tour`, "Walk", `Start with a self-guided walk through ${dest}'s historic center — check if a free walking tour departs from the main square.`, `${dest} historic center`, 0),
        templateActivity(`National or city museum`, "Museum", `Visit ${dest}'s most important cultural museum to build context for the rest of the trip. Book tickets online.`, `${dest} national museum`, 18),
        templateActivity(`Local market or food hall lunch`, "Food", `Eat where locals eat — find the nearest covered market or food hall for lunch with a seasonal, regional menu.`, `${dest} central market`, 20),
        templateActivity(`Neighborhood dinner`, "Restaurant", `Choose a restaurant in the neighborhood where you're staying for an easy first evening. Ask your accommodation for a recommendation.`, `${dest} restaurant`, 40),
      ],
    },
    {
      title: `Culture, architecture, and a scenic viewpoint`,
      summary: `A focused culture day: one major site, one viewpoint, and a memorable meal.`,
      theme: "Culture, views, food",
      activities: [
        templateActivity(`Key historical landmark`, "Landmark", `${dest}'s most iconic landmark — book timed entry online if possible and go early to beat the crowds.`, `${dest} landmark`, 15),
        templateActivity(`Panoramic viewpoint`, "Viewpoint", `Find the city's best viewpoint for skyline or landscape photos — usually best at golden hour.`, `${dest} viewpoint`, 0),
        templateActivity(`Traditional lunch`, "Restaurant", `Try the regional specialty at a local restaurant well-reviewed by residents, not tourists.`, `${dest} traditional restaurant`, 30),
        templateActivity(`Evening cultural activity`, "Nightlife", `Theatre, live music, a food tour, or an evening boat cruise — check local listings and book ahead.`, `${dest} evening`, 35),
      ],
    },
    {
      title: `Local neighborhoods and a relaxed farewell`,
      summary: `A slower, exploratory day through the city's most characterful neighborhoods.`,
      theme: "Neighborhoods, shopping, food",
      activities: [
        templateActivity(`Residential neighborhood walk`, "Walk", `Explore the neighborhood locals actually live in — look for street art, independent cafés, and a weekend market.`, `${dest} residential area`, 0),
        templateActivity(`Specialty coffee or tea stop`, "Cafe", `Find the best independent café in the area — ask your accommodation or search locally reviewed spots.`, `${dest} café`, 8),
        templateActivity(`Local craft or design shopping`, "Shopping", `Browse independent boutiques for locally made food, ceramics, textiles, or design objects to bring home.`, `${dest} shopping`, 20),
        templateActivity(`Farewell dinner`, "Restaurant", `Reserve the meal you've been looking forward to all trip — the restaurant you researched before leaving.`, `${dest} dinner`, 60),
      ],
    },
  ];
}

function templateActivity(
  title: string,
  category: string,
  description: string,
  locationName: string,
  estimatedCost: number,
  address?: string,
  lat?: number,
  lng?: number,
) {
  return { title, category, description, locationName, estimatedCost, address, lat, lng };
}

function applyPromptConstraints(trip: Trip, prompt: string): Trip {
  const lower = prompt.toLowerCase();
  let next = trip;
  if (/jazz|hidden bar|speakeasy|nightlife/.test(lower)) {
    next = addNightlifeConstraint(next);
  }
  if (/coffee|cafe|café/.test(lower) && /\b(each|every|per)\s+day\b|coffee shops each day/.test(lower)) {
    next = ensureCoffeeEachDay(next);
  }
  if (/family|kid|children/.test(lower)) {
    next = markFamilyFriendly(next);
  }
  return next;
}

function addNightlifeConstraint(trip: Trip): Trip {
  const jazzStops = nightlifeSeeds(trip.destination);
  if (!jazzStops.length) return trip;
  return {
    ...trip,
    summary: `${trip.summary} Includes nightlife-focused evening options from the search prompt.`,
    days: trip.days.map((day, dayIndex) => {
      const seed = jazzStops[dayIndex % jazzStops.length];
      const activity = withActivityPhoto(createActivityFromSeed(seed, day.id, dayIndex, day.activities.length, trip), trip.destination);
      const replaceIndex = findEveningReplaceIndex(day.activities);
      const activities =
        replaceIndex >= 0
          ? day.activities.map((item, index) => (index === replaceIndex ? activity : item))
          : [...day.activities, activity];
      return {
        ...day,
        summary: `${day.summary ?? ""} Evening includes a jazz/nightlife stop requested in the prompt.`.trim(),
        activities,
      };
    }),
  };
}

function ensureCoffeeEachDay(trip: Trip): Trip {
  const coffeeStops = coffeeSeeds(trip.destination);
  if (!coffeeStops.length) return trip;
  const used = new Set<string>();
  return {
    ...trip,
    days: trip.days.map((day, dayIndex) => {
      if (day.activities.some((activity) => /coffee|cafe|café/i.test(`${activity.name} ${activity.category}`))) {
        return day;
      }
      const seed = coffeeStops.find((item) => !used.has(item.title)) ?? coffeeStops[dayIndex % coffeeStops.length];
      used.add(seed.title);
      const activity = withActivityPhoto(createActivityFromSeed(seed, day.id, dayIndex, 1, trip), trip.destination);
      const activities = [...day.activities];
      activities.splice(Math.min(1, activities.length), 0, activity);
      return {
        ...day,
        activities,
      };
    }),
  };
}

function markFamilyFriendly(trip: Trip): Trip {
  return {
    ...trip,
    days: trip.days.map((day) => ({
      ...day,
      summary: `${day.summary ?? ""} Pacing adjusted for family-friendly breaks and flexible timing.`.trim(),
      activities: day.activities.map((activity) => ({
        ...activity,
        notes: `${activity.notes ?? "AI suggestion."} Family-friendly pacing: verify stroller access, restrooms, and ticket rules.`,
      })),
    })),
  };
}

function createActivityFromSeed(
  seed: ReturnType<typeof nightlifeSeeds>[number],
  dayId: string,
  dayIndex: number,
  activityIndex: number,
  trip: Trip,
): Activity {
  return {
    id: `act-${dayId}-${slug(seed.locationName)}-${activityIndex}`,
    placeId: slug(seed.locationName),
    title: seed.title,
    name: seed.title,
    category: seed.category,
    description: seed.description,
    locationName: seed.locationName,
    address: seed.address,
    lat: seed.lat,
    lng: seed.lng,
    estimatedCost: seed.estimatedCost,
    currency: trip.budgetCurrency ?? "USD",
    confidence: 0.72,
    verificationStatus: "needs_verification",
    notes: "Added because of your prompt. Verify hours, cover charges, and booking rules before travel.",
    locked: false,
  };
}

function findEveningReplaceIndex(activities: Activity[]) {
  const index = activities.findIndex((activity) => /nightlife|dinner|evening|bar|show|fado/i.test(`${activity.name} ${activity.category}`));
  return index >= 0 ? index : activities.length - 1;
}

function nightlifeSeeds(destination: string) {
  if (isParis(destination)) {
    return [
      templateActivity("Le Caveau de la Huchette jazz night", "Nightlife", "A historic Latin Quarter jazz cellar; check the set calendar and cover before going.", "Le Caveau de la Huchette", 22, "5 Rue de la Huchette, 75005 Paris, France", 48.8528, 2.3453),
      templateActivity("Duc des Lombards late set", "Nightlife", "Polished jazz club near Châtelet with ticketed evening sets and strong sightlines.", "Duc des Lombards", 35, "42 Rue des Lombards, 75001 Paris, France", 48.8597, 2.3483),
      templateActivity("38Riv Jazz Club", "Nightlife", "Small vaulted jazz room in the Marais; reserve ahead for intimate evening shows.", "38Riv Jazz Club", 25, "38 Rue de Rivoli, 75004 Paris, France", 48.8558, 2.3568),
    ];
  }
  if (isNewYork(destination)) {
    return [
      templateActivity("Smalls Jazz Club late set", "Nightlife", "Classic Greenwich Village basement jazz club; reserve or arrive early for popular sets.", "Smalls Jazz Club", 30, "183 W 10th St, New York, NY 10014", 40.7344, -74.0028),
      templateActivity("Dizzy's Club at Jazz at Lincoln Center", "Nightlife", "Room with skyline views and ticketed jazz sets; verify showtimes before booking.", "Dizzy's Club", 45, "10 Columbus Cir, New York, NY 10019", 40.7681, -73.983),
    ];
  }
  if (destination.toLowerCase().includes("madrid")) {
    return [
      templateActivity("Cafe Central jazz evening", "Nightlife", "Madrid jazz room near Plaza de Santa Ana; check the calendar and reserve seats before going.", "Cafe Central", 25, "Pl. del Angel, 10, 28012 Madrid, Spain", 40.4144, -3.7018),
      templateActivity("Sala Clamores late show", "Nightlife", "Long-running live music venue north of Malasana; verify the night's genre and door time.", "Sala Clamores", 22, "C. de Alburquerque, 14, 28010 Madrid, Spain", 40.4301, -3.6997),
      templateActivity("Cafe Berlin concert night", "Nightlife", "Central concert venue with jazz, flamenco, and Latin nights; ticketed shows vary by date.", "Cafe Berlin", 28, "Costanilla de los Angeles, 20, 28013 Madrid, Spain", 40.4192, -3.7078),
    ];
  }
  return [];
}

function coffeeSeeds(destination: string) {
  if (isParis(destination)) {
    return [
      templateActivity("Ten Belles coffee", "Cafe", "Specialty coffee stop near Canal Saint-Martin.", "Ten Belles", 8, "10 Rue de la Grange aux Belles, 75010 Paris, France", 48.8717, 2.3634),
      templateActivity("Coutume Cafe", "Cafe", "Left Bank specialty coffee stop that pairs well with museum days.", "Coutume Cafe", 8, "47 Rue de Babylone, 75007 Paris, France", 48.8509, 2.319),
      templateActivity("KB CafeShop", "Cafe", "Independent coffee near Pigalle and Montmartre.", "KB CafeShop", 8, "53 Av. Trudaine, 75009 Paris, France", 48.8822, 2.3436),
    ];
  }
  if (isNewYork(destination)) {
    return [
      templateActivity("Everyman Espresso", "Cafe", "Downtown espresso bar near SoHo routes.", "Everyman Espresso", 8, "301 W Broadway, New York, NY 10013", 40.7217, -74.0047),
      templateActivity("Devoción Williamsburg", "Cafe", "Independent Colombian coffee stop near Brooklyn routes.", "Devoción Williamsburg", 8, "69 Grand St, Brooklyn, NY 11249", 40.7168, -73.9655),
    ];
  }
  if (destination.toLowerCase().includes("toronto")) {
    return [
      templateActivity("Fahrenheit Coffee Richmond", "Cafe", "Independent espresso bar near the downtown route.", "Fahrenheit Coffee", 7, "120 Lombard St, Toronto, ON M5C 3H5", 43.6519, -79.3728),
      templateActivity("FIKA Cafe Kensington", "Cafe", "Local cafe that fits naturally into a Kensington day.", "FIKA Cafe", 8, "28 Kensington Ave, Toronto, ON M5T 2J9", 43.6548, -79.4005),
    ];
  }
  if (destination.toLowerCase().includes("madrid")) {
    return [
      templateActivity("Toma Cafe Malasana", "Cafe", "Specialty coffee stop that fits naturally into a Malasana day.", "Toma Cafe", 8, "C. de la Palma, 49, 28004 Madrid, Spain", 40.4265, -3.7042),
      templateActivity("Hola Coffee Lavapies", "Cafe", "Independent coffee near Lavapies and the museum triangle.", "Hola Coffee", 8, "C. del Dr. Fourquet, 33, 28012 Madrid, Spain", 40.4095, -3.6972),
    ];
  }
  return [];
}

export function normalizeTrip(input: unknown, fallbackPrompt = "Trip plan", fallbackId?: string): Trip {
  const raw = input as {
    id?: unknown;
    title?: unknown;
    name?: unknown;
    destination?: unknown;
    summary?: unknown;
    numDays?: unknown;
    tripLengthDays?: unknown;
    numPeople?: unknown;
    travelers?: unknown;
    budgetLevel?: unknown;
    budgetCurrency?: unknown;
    days?: unknown;
  };
  const fallback = buildMockTrip(fallbackPrompt, fallbackId);
  const rawDays = Array.isArray(raw?.days) ? raw.days : [];
  const requestedDays = parseTripLengthDays(fallbackPrompt);
  const numDays = Math.max(1, Number(requestedDays ?? raw?.tripLengthDays ?? raw?.numDays ?? rawDays.length ?? fallback.days.length));

  const days = Array.from({ length: numDays }, (_, idx) => {
    const rawDay = (rawDays[idx] ?? {}) as { [key: string]: unknown };
    const rawActivities = Array.isArray(rawDay.activities) ? rawDay.activities : [];
    const fallbackDay = fallback.days[idx] ?? fallback.days[fallback.days.length - 1];
    const useFallbackActivities = !rawActivities.length || activitiesLookGeneric(rawActivities) || rawActivities.some(activityLooksGeneric);
    return {
      id: stringOr(rawDay.id, `day${idx + 1}`),
      dayNumber: Number(rawDay.dayNumber ?? idx + 1),
      date: stringOr(rawDay.date, `Day ${idx + 1}`),
      theme: optionalString(rawDay.theme),
      activities: useFallbackActivities
        ? fallbackDay.activities
        : rawActivities.map((activity, actIdx) =>
            withActivityPhoto(normalizeActivity(activity, idx, actIdx), fallback.destination),
          ),
    };
  });

  const parsed = tripSchema.safeParse({
    id: stringOr(raw?.id, fallbackId ?? `trip-${Date.now()}`),
    title: stringOr(raw?.title ?? raw?.name, fallback.title ?? fallback.name),
    name: stringOr(raw?.name, fallback.name),
    destination: stringOr(raw?.destination, fallback.destination),
    summary: optionalString(raw?.summary) ?? fallback.summary,
    tripLengthDays: numberOr(raw?.tripLengthDays ?? raw?.numDays, days.length),
    numPeople: numberOr(raw?.numPeople, fallback.numPeople),
    travelers: numberOr(raw?.travelers ?? raw?.numPeople, fallback.travelers),
    budgetLevel: optionalString(raw?.budgetLevel) ?? fallback.budgetLevel,
    budgetCurrency: optionalString(raw?.budgetCurrency) ?? fallback.budgetCurrency,
    days,
    budgetItems: Array.isArray((raw as { budgetItems?: unknown }).budgetItems)
      ? (raw as { budgetItems: unknown[] }).budgetItems
      : fallback.budgetItems,
    travelLegs: Array.isArray((raw as { travelLegs?: unknown }).travelLegs)
      ? (raw as { travelLegs: unknown[] }).travelLegs
      : [],
    notes: optionalString((raw as { notes?: unknown }).notes) ?? fallback.notes,
    createdAt: optionalString((raw as { createdAt?: unknown }).createdAt) ?? fallback.createdAt,
    updatedAt: new Date().toISOString(),
    sourcePrompt: optionalString((raw as { sourcePrompt?: unknown }).sourcePrompt) ?? fallbackPrompt,
    isPublic: Boolean((raw as { isPublic?: unknown }).isPublic),
    shareId: optionalString((raw as { shareId?: unknown }).shareId),
  });

  return parsed.success ? parsed.data : fallback;
}

function activitiesLookGeneric(activities: unknown[]) {
  const genericTerms = [
    "base hotel",
    "neighborhood walk",
    "local dinner reservation",
    "morning market or cafe stop",
    "signature museum or historic site",
    "sunset viewpoint",
    "central market or cafe",
    "restaurant near hotel",
  ];
  const titles = activities.map((activity) => {
    const raw = (activity ?? {}) as { title?: unknown; name?: unknown; locationName?: unknown };
    return `${raw.title ?? ""} ${raw.name ?? ""} ${raw.locationName ?? ""}`.toLowerCase();
  });
  return titles.length > 0 && titles.filter((title) => isGenericPlaceTitle(title) || genericTerms.some((term) => title.includes(term))).length >= Math.ceil(titles.length / 2);
}

export function isGenericPlaceTitle(title: string) {
  return GENERIC_PLACE_PATTERNS.some((pattern) => pattern.test(title.trim()));
}

function activityLooksGeneric(activity: unknown) {
  const raw = (activity ?? {}) as { title?: unknown; name?: unknown; locationName?: unknown };
  return [raw.title, raw.name, raw.locationName].some((value) => typeof value === "string" && isGenericPlaceTitle(value));
}

function normalizeActivity(input: unknown, dayIdx: number, actIdx: number): Activity {
  const raw = (input ?? {}) as { [key: string]: unknown };
  return activitySchema.parse({
    id: stringOr(raw.id, `act-${dayIdx + 1}-${actIdx + 1}`),
    placeId: optionalString(raw.placeId),
    title: stringOr(raw.title ?? raw.name, `Activity ${actIdx + 1}`),
    name: stringOr(raw.name ?? raw.title, `Activity ${actIdx + 1}`),
    category: stringOr(raw.category, "Activity"),
    description: stringOr(raw.description, "Details are being refined."),
    startTime: optionalString(raw.startTime ?? raw.startsAt),
    endTime: optionalString(raw.endTime),
    locationName: optionalString(raw.locationName ?? raw.name),
    address: optionalString(raw.address),
    rating: numberOr(raw.rating),
    photoUrl: optionalString(raw.photoUrl),
    imageUrl: optionalString(raw.imageUrl),
    lat: numberOr(raw.lat),
    lng: numberOr(raw.lng),
    startsAt: optionalString(raw.startsAt),
    durationMinutes: numberOr(raw.durationMinutes),
    estimatedCost: numberOr(raw.estimatedCost),
    currency: optionalString(raw.currency),
    sourceName: optionalString(raw.sourceName),
    sourceUrl: optionalString(raw.sourceUrl),
    confidence: numberOr(raw.confidence),
    lastCheckedAt: optionalString(raw.lastCheckedAt),
    verificationStatus: optionalString(raw.verificationStatus) ?? "ai_suggestion",
    notes: optionalString(raw.notes),
    locked: Boolean(raw.locked ?? raw.isLocked),
    isLocked: Boolean(raw.locked ?? raw.isLocked),
  });
}

function stringOr(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function optionalString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function numberOr(value: unknown, fallback?: number) {
  const next = typeof value === "string" ? Number(value) : value;
  return typeof next === "number" && Number.isFinite(next) ? next : fallback;
}

function clampDays(value: number) {
  if (!Number.isFinite(value)) return undefined;
  return Math.min(21, Math.max(1, Math.round(value)));
}

function titleCase(value: string) {
  return value.replace(/\b\w/g, (c) => c.toUpperCase());
}

function isNewYork(destination: string) {
  return /new york|nyc|manhattan/i.test(destination);
}

function isParis(destination: string) {
  return /paris/i.test(destination);
}

function isLisbon(destination: string) {
  return /lisbon|lisboa/i.test(destination);
}

function isBarcelona(destination: string) {
  return /barcelona/i.test(destination);
}

function isRome(destination: string) {
  return /rome|roma/i.test(destination);
}

function isBali(destination: string) {
  return /bali|ubud|seminyak|uluwatu/i.test(destination);
}

function slug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "place";
}
