// app/hero.ts
import { heroui } from "@heroui/react";

export default heroui({
  defaultTheme: "dark",
  themes: {
    "theme-public": {
      extend: "dark",
      colors: {
        background: "#0b1015",
        foreground: "#f8fafc",
        content1: "#121a23",
        content2: "#1a2430",
        primary: "#2dd4bf",
        secondary: "#7dd3fc",
        success: "#4ade80",
        warning: "#fbbf24",
        danger: "#fb7185",
      },
    },
    "theme-patient": {
      extend: "dark",
      colors: {
        background: "#0b1220",
        foreground: "#f8fafc",
        content1: "#121b2c",
        content2: "#1a273b",
        primary: "#38bdf8",
        secondary: "#22c55e",
        success: "#4ade80",
        warning: "#facc15",
        danger: "#f97316",
      },
    },
    "theme-doctor": {
      extend: "dark",
      colors: {
        background: "#0f1117",
        foreground: "#f8fafc",
        content1: "#171a22",
        content2: "#202533",
        primary: "#f59e0b",
        secondary: "#fb7185",
        success: "#22c55e",
        warning: "#fbbf24",
        danger: "#ef4444",
      },
    },
  },
});
