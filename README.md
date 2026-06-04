# SkylineDB

**Nissan Skyline VIN Decoder & Parts Finder** — a modern Next.js web app for R32, R33 and R34 owners.

## Features

- 🔍 **VIN / Chassis decoder** — supports BNR32, ECR33, BCNR33, ER34, ENR34, BNR34, HR32
- 📋 **Full vehicle data** — engine, transmission, drivetrain, colour code, interior code, equipment
- 📐 **OEM Parts diagrams** — EPC structure with part numbers (real diagrams via Nissan FAST when connected)
- 🔧 **Parts search** — German → English translation + engine-specific synonyms (RB25DET, RB26DETT, …)
- 🛒 **Shop directory** — JDM Heart, Varakai, JDM-Shop, Amayama, Nengun + extensible config
- 🌗 Dark JDM theme

## Live Demo

Deploy to Vercel with one click:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/skylinedb)

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Try chassis number **ER34-030828** for full mock data, or any valid prefix like **BNR34-100001**.

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── vin/route.ts            # VIN decode endpoint
│   │   └── parts-search/route.ts   # Parts synonym + shop links
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── Header.tsx
│   ├── VinInput.tsx
│   ├── VehicleCard.tsx
│   ├── TabBar.tsx
│   └── tabs/
│       ├── SpecsTab.tsx
│       ├── EquipmentTab.tsx
│       ├── EpcTab.tsx
│       ├── PartsTab.tsx
│       └── ShopsTab.tsx
├── data/
│   ├── mockVehicle.ts     # Full ER34-030828 mock entry
│   ├── shops.ts           # Shop config (name, URL template, logo path, …)
│   ├── partsSynonyms.ts   # German → English parts dictionary
│   └── epcData.ts         # OEM parts / EPC placeholder structure
└── types/
    └── index.ts
```

## Adding a Real VIN API

Edit `src/app/api/vin/route.ts` — there's a clear `TODO` comment where you can add a `fetch()` call to any external decoder (GTR-Registry, Nissan EPC, etc.).

## Adding Shop Logos

Drop PNG/SVG files into `public/logos/<shop-id>.png` matching the `logoPath` in `src/data/shops.ts`.

## Deploy to Vercel

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project → Import your repo
3. Framework: **Next.js** (auto-detected)
4. Click **Deploy** — no environment variables needed for the base version

## Tech Stack

- [Next.js 14](https://nextjs.org) (App Router)
- TypeScript
- Tailwind CSS
- No additional runtime dependencies
