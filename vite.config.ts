import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Compile-time dev flag
  define: {
    __DEV__: false,
  },
  // Explicitly align build target with TypeScript
  esbuild: {
    target: "es2020",
  },
  build: {
    sourcemap: false, // Disabled for production security/size
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return;

          // All React + React-dependent ecosystem stays together
          if (
            id.includes("/react/") ||
            id.includes("/react-dom/") ||
            id.includes("react-router") ||
            id.includes("@radix-ui") ||
            id.includes("lucide-react") ||
            id.includes("sonner")
          ) {
            return "vendor";
          }

          // React Query (heavy, but still depends on React)
          if (id.includes("@tanstack/react-query")) {
            return "query";
          }

          // Supabase is React-agnostic → safe to split
          if (id.includes("@supabase")) {
            return "supabase";
          }

          // Utility-only libraries (no React dependency)
          if (
            id.includes("class-variance-authority") ||
            id.includes("clsx") ||
            id.includes("tailwind-merge")
          ) {
            return "utils";
          }
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
});
