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
  url: url.startsWith("/") || url.startsWith("https://images.unsplash.com/") ? url : PLACEHOLDER_IMAGE.url,
  alt,
  attribution:
    url.startsWith("/") || url.startsWith("https://images.unsplash.com/")
      ? attribution
      : "Local Wayfarer fallback",
});

const unsplash = (url: string, alt: string): DestinationImage => image(url, alt, "Unsplash");

export const DESTINATION_IMAGES: DestinationRegistry = {
  barcelona: unsplash(
    "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?auto=format&fit=crop&w=900&q=80",
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
  bali: unsplash(
    "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=900&q=80",
    "Pura Ulun Danu Bratan temple in Bali",
  ),
  iceland: unsplash(
    "https://images.unsplash.com/photo-1504829857797-ddff29c27927?auto=format&fit=crop&w=900&q=80",
    "Summer landscape in Akureyri, Iceland",
  ),
  lisbon: unsplash(
    "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?auto=format&fit=crop&w=900&q=80",
    "Lisbon hillside cityscape in Portugal",
  ),
  rome: unsplash(
    "https://images.unsplash.com/photo-1529260830199-42c24126f198?auto=format&fit=crop&w=900&q=80",
    "Trevi Fountain in Rome, Italy",
  ),
  copenhagen: unsplash(
    "https://images.unsplash.com/photo-1513622470522-26c3c8a854bc?auto=format&fit=crop&w=900&q=80",
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
  dubai: unsplash(
    "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=900&q=80",
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
  kyoto: unsplash(
    "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=900&q=80",
    "Kiyomizu-dera temple in Kyoto, Japan",
  ),
  "cape-town": unsplash(
    "https://images.unsplash.com/photo-1580060839134-75a5edca2e99?auto=format&fit=crop&w=900&q=80",
    "Camps Bay and mountains in Cape Town",
  ),
  "mexico-city": unsplash(
    "https://images.unsplash.com/photo-1585464231875-d9ef1f5ad396?auto=format&fit=crop&w=900&q=80",
    "Paseo de la Reforma skyline in Mexico City",
  ),
  seoul: unsplash(
    "https://images.unsplash.com/photo-1538485399081-7191377e8241?auto=format&fit=crop&w=900&q=80",
    "City landmarks and skyline in Seoul",
  ),
  vancouver: unsplash(
    "https://images.unsplash.com/photo-1559511260-66a654ae982a?auto=format&fit=crop&w=900&q=80",
    "Vancouver waterfront skyline",
  ),
  "buenos-aires": unsplash(
    "https://images.unsplash.com/photo-1589909202802-8f4aadce1849?auto=format&fit=crop&w=900&q=80",
    "Avenida 9 de Julio in Buenos Aires",
  ),
  dublin: unsplash(
    "https://images.unsplash.com/photo-1513735492246-483525079686?auto=format&fit=crop&w=900&q=80",
    "Aerial view over Dublin city and the River Liffey",
  ),
  prague: unsplash(
    "https://images.unsplash.com/photo-1519677100203-a0e668c92439?auto=format&fit=crop&w=900&q=80",
    "Prague city skyline with historic bridges and red rooftops",
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
  "praha": "prague",
  "dublin adventure": "dublin",
  "lisbon starter plan": "lisbon",
  "prague city break": "prague",
  "prague city escape": "prague",
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
