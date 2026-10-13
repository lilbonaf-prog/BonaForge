import {
  defineConfig,
} from "vite";

import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],

  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              name: "react-vendor",

              test:
                /node_modules[\\/](react|react-dom|react-router|react-router-dom)[\\/]/,

              priority: 30,
            },

            {
              name: "query-vendor",

              test:
                /node_modules[\\/]@tanstack[\\/]react-query[\\/]/,

              priority: 25,
            },

            {
              name: "motion-vendor",

              test:
                /node_modules[\\/](framer-motion|motion-dom|motion-utils)[\\/]/,

              priority: 20,
            },

            {
              name: "forms-vendor",

              test:
                /node_modules[\\/](react-hook-form|zod|@hookform)[\\/]/,

              priority: 20,
            },

            {
              name: "icons-vendor",

              test:
                /node_modules[\\/]lucide-react[\\/]/,

              priority: 15,
            },

            {
              name: "http-vendor",

              test:
                /node_modules[\\/](axios)[\\/]/,

              priority: 15,
            },
          ],
        },
      },
    },
  },
});