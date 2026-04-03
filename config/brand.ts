export type BrandTokens = {
  name: string;
  tagline: string;
  logoText: string;
  colors: {
    bg: string;
    panel: string;
    border: string;
    text: string;
    muted: string;
    cyan: string;
    violet: string;
    amber: string;
    pink: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
};

export const brand: BrandTokens = {
  name: "Wayfarer",
  tagline: "Your travel operating system.",
  logoText: "WAYFARER",
  colors: {
    bg: "#040710",
    panel: "rgba(13,21,56,0.8)",
    border: "rgba(0,229,255,0.15)",
    text: "#EAF2FF",
    muted: "rgba(234,242,255,0.72)",
    cyan: "#00E5FF",
    violet: "#7C3AED",
    amber: "#F59E0B",
    pink: "#FF4D6D",
  },
  fonts: {
    heading: "Syne",
    body: "Outfit",
  },
};

