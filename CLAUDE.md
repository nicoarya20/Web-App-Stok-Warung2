# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Install dependencies (bun recommended — lockfile is present)
bun install

# Start dev server at http://localhost:5173
bun run dev

# Production build
bun run build
```

npm and pnpm work as drop-in alternatives (`npm i && npm run dev`).

There is no test suite and no linter configured.

## Architecture

This is a single-file React SPA. All application logic lives in **`src/app/App.tsx`** — state, business logic, and every UI tab are in that one file. There is no router; navigation is a `useState<Tab>` toggle between `"dashboard"`, `"stok"`, and `"jual"`.

**Data model** (`Barang` interface in `App.tsx`):
- Stored only in React state — resets on page reload.
- `sisaStok` (`stokAwal - terjual`) and `keuntungan` (`(hargaJual - hargaBeli) * terjual`) are always derived via `useMemo`, never stored.

**Styling:**
- Tailwind CSS **v4** — configured via `@tailwindcss/vite` plugin, no `tailwind.config.js`.
- All theme tokens (colors, fonts, radius) are CSS custom properties defined in `src/styles/theme.css` and mapped to Tailwind with `@theme inline`.
- Custom theme: warm cream background (`#FFF8F0`), terracotta primary (`#D63B1A`), orange accent (`#F5A623`). Body font: `Plus Jakarta Sans`; display/heading font: `Nunito`.
- To extend the theme, edit `src/styles/theme.css` or `src/styles/tailwind.css` — never create a `tailwind.config.js`.

**Vite config (`vite.config.ts`):**
- `@` alias resolves to `./src`.
- Custom `figma-asset-resolver` plugin maps `figma:asset/<filename>` imports to `src/assets/`.
- Raw imports are supported for `.svg` and `.csv` only — do not add `.css`, `.tsx`, or `.ts`.

**UI components** live in `src/app/components/ui/` (Shadcn/Radix-based) and `src/app/components/figma/` (image fallback helper). Icons come from `lucide-react`.

## Key conventions

- If `App.tsx` grows beyond ~800 lines, split tab components (`DashboardTab`, `StockTableTab`, `SalesLoggerTab`) into separate files under `src/app/components/` and keep imports tidy.
- Do not use Tailwind v3 syntax (e.g., `tailwind.config.js` `theme.extend`). All customization goes in `src/styles/theme.css`.
- Add new icons from `lucide-react` only.
- To add persistent storage, wrap the `useState<Barang[]>` in `App.tsx` with `localStorage` — no backend exists.
