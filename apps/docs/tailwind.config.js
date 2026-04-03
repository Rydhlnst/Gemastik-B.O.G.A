import sharedConfig from "@repo/shared/tailwind.config";

/** @type {import('tailwindcss').Config} */
export default {
  ...sharedConfig,
  content: [
    "./app/**/*.{js,jsx}",
    "../../packages/shared/src/components/**/*.{js,jsx}",
  ],
};
