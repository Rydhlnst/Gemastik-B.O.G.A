import sharedConfig from "@repo/shared/tailwind.config";

/** @type {import('tailwindcss').Config} */
export default {
  ...sharedConfig,
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "../../packages/shared/src/components/**/*.{js,jsx,ts,tsx}",
  ],
};
