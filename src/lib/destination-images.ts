export type DestinationImage = {
  url: string;
  alt: string;
  attribution?: string;
};

export type DestinationRegistry = Record<string, DestinationImage>;

export const PLACEHOLDER_IMAGE: DestinationImage = {
  url: "/images/travel-placeholder.png",
  alt: "Abstract travel landscape with a sun, mountains, and route line",
};

const image = (url: string, alt: string, attribution = "Wikimedia Commons"): DestinationImage => ({
  url: url.startsWith("/") ? url : PLACEHOLDER_IMAGE.url,
  alt,
  attribution: url.startsWith("/") ? attribution : "Local Wayfarer fallback",
});

export const DESTINATION_IMAGES: DestinationRegistry = {
  barcelona: image(
    "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/Aerial_view_of_Barcelona%2C_Spain_%2851227309370%29_edited.jpg/640px-Aerial_view_of_Barcelona%2C_Spain_%2851227309370%29_edited.jpg",
    "Aerial view of Barcelona, Spain",
  ),
  santorini: image(
    PLACEHOLDER_IMAGE.url,
    "Whitewashed buildings in Oia, Santorini at sunset",
  ),
  patagonia: image(
    PLACEHOLDER_IMAGE.url,
    "Cerro Fitz Roy mountains in Patagonia, Argentina",
  ),
  "new-york-city": image(
    PLACEHOLDER_IMAGE.url,
    "View of the Empire State Building and New York City skyline",
  ),
  bali: image(
    "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Pura_Bratan_Bali.jpg/640px-Pura_Bratan_Bali.jpg",
    "Pura Ulun Danu Bratan temple in Bali",
  ),
  iceland: image(
    "https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/%D0%90%D0%BA%D1%83%D1%80%D0%B5%D0%B9%D1%80%D1%96_%D0%B2%D0%BB%D1%96%D1%82%D0%BA%D1%83%2C_%D0%86%D1%81%D0%BB%D0%B0%D0%BD%D0%B4%D1%96%D1%8F.jpg/640px-%D0%90%D0%BA%D1%83%D1%80%D0%B5%D0%B9%D1%80%D1%96_%D0%B2%D0%BB%D1%96%D1%82%D0%BA%D1%83%2C_%D0%86%D1%81%D0%BB%D0%B0%D0%BD%D0%B4%D1%96%D1%8F.jpg",
    "Summer landscape in Akureyri, Iceland",
  ),
  lisbon: image(
    "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/Lisboa_-_Portugal_%2852597836992%29.jpg/640px-Lisboa_-_Portugal_%2852597836992%29.jpg",
    "Lisbon city view in Portugal",
  ),
  rome: image(
    "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Trevi_Fountain%2C_Rome%2C_Italy_2_-_May_2007.jpg/640px-Trevi_Fountain%2C_Rome%2C_Italy_2_-_May_2007.jpg",
    "Trevi Fountain in Rome, Italy",
  ),
  copenhagen: image(
    "https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/2018_-_Christiansborg_from_the_Marble_Bridge.jpg/640px-2018_-_Christiansborg_from_the_Marble_Bridge.jpg",
    "Christiansborg Palace from the Marble Bridge in Copenhagen",
  ),
  paris: image(
    "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/La_Tour_Eiffel_vue_de_la_Tour_Saint-Jacques%2C_Paris_ao%C3%BBt_2014_%282%29.jpg/640px-La_Tour_Eiffel_vue_de_la_Tour_Saint-Jacques%2C_Paris_ao%C3%BBt_2014_%282%29.jpg",
    "Eiffel Tower and Paris skyline",
  ),
  tokyo: image(
    PLACEHOLDER_IMAGE.url,
    "Tokyo Tower and surrounding skyscrapers",
  ),
  london: image(
    "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Palace_of_Westminster_from_the_dome_on_Methodist_Central_Hall.jpg/640px-Palace_of_Westminster_from_the_dome_on_Methodist_Central_Hall.jpg",
    "Palace of Westminster and London cityscape",
  ),
  dubai: image(
    "https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/Dubai_Skyline_on_10_January_2015.jpg/640px-Dubai_Skyline_on_10_January_2015.jpg",
    "Dubai skyline with modern skyscrapers",
  ),
  sydney: image(
    "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/Sydney_Opera_House_and_Harbour_Bridge_Dusk_%282%29_2019-06-21.jpg/640px-Sydney_Opera_House_and_Harbour_Bridge_Dusk_%282%29_2019-06-21.jpg",
    "Sydney Opera House and Harbour Bridge at dusk",
  ),
  "machu-picchu": image(
    "https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/Machu_Picchu%2C_Peru.jpg/640px-Machu_Picchu%2C_Peru.jpg",
    "Machu Picchu ruins in Peru",
  ),
  marrakech: image(
    PLACEHOLDER_IMAGE.url,
    "Jemaa el-Fnaa square in Marrakech, Morocco",
  ),
  kyoto: image(
    "https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Kiyomizu-dera_in_Kyoto-r.jpg/640px-Kiyomizu-dera_in_Kyoto-r.jpg",
    "Kiyomizu-dera temple in Kyoto, Japan",
  ),
  "cape-town": image(
    "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Camps_bay_%2853460319478%29_%28cropped%29.jpg/640px-Camps_bay_%2853460319478%29_%28cropped%29.jpg",
    "Camps Bay and mountains in Cape Town",
  ),
  "mexico-city": image(
    "https://upload.wikimedia.org/wikipedia/commons/thumb/5/57/Mexico_City_Reforma_Skyline.jpg/640px-Mexico_City_Reforma_Skyline.jpg",
    "Paseo de la Reforma skyline in Mexico City",
  ),
  seoul: image(
    "https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Seoul_montage.png/640px-Seoul_montage.png",
    "City landmarks and skyline in Seoul",
  ),
  vancouver: image(
    "https://upload.wikimedia.org/wikipedia/commons/thumb/5/57/Concord_Pacific_Master_Plan_Area.jpg/640px-Concord_Pacific_Master_Plan_Area.jpg",
    "Vancouver waterfront skyline",
  ),
  "buenos-aires": image(
    "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Avenida_9_de_Julio%2C_Buenos_Aires_%2840089810910%29.jpg/640px-Avenida_9_de_Julio%2C_Buenos_Aires_%2840089810910%29.jpg",
    "Avenida 9 de Julio in Buenos Aires",
  ),
};

const ALIASES: Record<string, string> = {
  nyc: "new-york-city",
  "new-york": "new-york-city",
  "new york": "new-york-city",
  "new york city": "new-york-city",
  "machu picchu": "machu-picchu",
  capetown: "cape-town",
  "cape town": "cape-town",
  "mexico city": "mexico-city",
  "buenos aires": "buenos-aires",
};

function normalizeDestination(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function getDestinationImage(destination: string): DestinationImage | null {
  const normalized = normalizeDestination(destination);
  const alias = ALIASES[normalized] ?? ALIASES[destination.toLowerCase().trim()];
  if (alias && DESTINATION_IMAGES[alias]) return DESTINATION_IMAGES[alias];
  if (DESTINATION_IMAGES[normalized]) return DESTINATION_IMAGES[normalized];

  const match = Object.entries(DESTINATION_IMAGES).find(([slug]) => {
    return normalized.includes(slug) || slug.includes(normalized);
  });
  return match?.[1] ?? null;
}
