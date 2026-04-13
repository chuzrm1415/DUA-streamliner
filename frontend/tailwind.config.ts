import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // Extend with custom design tokens that complement MUI theme
      colors: {
        confidence: {
          high: "#22c55e",    // green-500
          medium: "#eab308",  // yellow-500
          low: "#ef4444",     // red-500
        },
      },
    },
  },
  // Disable preflight to avoid conflicts with MUI baseline
  corePlugins: {
    preflight: false,
  },
  plugins: [],
};

export default config;
