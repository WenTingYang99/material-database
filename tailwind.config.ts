import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "var(--primary-color)",
          dark: "var(--primary-dark)",
        },
        ink: "var(--text-color)",
        muted: "var(--muted-color)",
        panel: "var(--panel-color)",
      },
      borderRadius: {
        ui: "var(--radius)",
      },
    },
  },
};

export default config;
