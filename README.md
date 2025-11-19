## Smart Nav Web

Voice-driven navigation UI inspired by the Android Smart Nav app, rebuilt with **Next.js 14**, **React**, **Tailwind CSS**, and **Leaflet**. Speak commands like “Navigate to London” and the page:

- Listens via the browser’s Web Speech API
- Parses destinations with the same Kotlin logic (saved shortcuts + “navigate to …” phrases)
- Geocodes through OpenStreetMap’s Nominatim endpoint
- Shows the destination on an interactive Leaflet map with animated fly-to and popups

### Preview

![Smart Nav preview](public/window.svg)

## Getting Started

```bash
# install dependencies
npm install

# run locally
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in a Chromium-based browser (Chrome recommended). Click the glowing microphone button, say “Navigate to Market”, and watch the map jump to that location.

## Project Structure

```
src/
  app/
    page.js      # React component containing UI, speech logic, Leaflet hooks
    globals.css  # Tailwind imports + glassmorphism theme + Leaflet CSS import
public/          # Icons/SVG preview assets
```

Key root files:

- `package.json` – scripts/dependencies (Next.js 16, React 19, Tailwind v4)
- `postcss.config.mjs` – Tailwind/PostCSS pipeline
- `next.config.mjs` – standard Next.js config

## Notes

- Works best in Chrome/Edge; Firefox lacks full Web Speech support.
- Geocoding relies on the public Nominatim API—respect rate limits or self-host for production.
- No secrets live in the repo; keep future API keys in environment variables.

## License

MIT. Feel free to fork, extend, and open PRs!***