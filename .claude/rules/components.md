# Component Conventions

- All components are .astro files (no React/Preact/Svelte)
- Props defined via TypeScript interface in frontmatter
- Use `class:list` for conditional classes
- Tailwind classes ordered: layout > spacing > sizing > colour > typography
- No inline styles — use Tailwind utilities or CSS custom properties
- Icons are individual .astro components in src/icons/
- Use path aliases (@components/, @layouts/, @icons/, @data/, @utils/)
