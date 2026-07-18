/// <reference types="vitest/config" />
import { getViteConfig } from 'astro/config';

// getViteConfig wires Astro's Vite pipeline (so `.astro` components render via the
// Container API and tsconfig path aliases like @data/@utils resolve) and loads
// astro.config.mjs — which also runs the content-graph build gate before tests.
export default getViteConfig({
  test: {
    include: ['test/**/*.test.ts'],
  },
});
