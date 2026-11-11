# Zruky — from hand to hand

A full-featured classifieds marketplace built with **React 19, Vite, React Router and Lucide icons** (plain JavaScript, no TypeScript).
Buy and sell electronics, cars, flats, fashion, furniture, jobs, services and pets — with search, filters, favorites, chat and a seller dashboard.

There is no backend yet: everything (accounts, listings, favorites, messages) is persisted in `localStorage` behind an async service layer that can be swapped for real API calls.

## Getting started

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # production build in dist/
npm run preview   # serve the production build
npm run lint
```

**Demo account:** `demo@zruky.app` / `demo1234` — or press **Use demo** on the login page.
It comes with its own listings (active and sold), favorites and ongoing conversations.

## Deploying to Render (Docker)

The repo includes a `Dockerfile` (builds with Node, serves with nginx on Render's `$PORT`) and a `render.yaml` Blueprint.

1. Render dashboard → **New → Blueprint** → pick this repository → **Apply**.
2. Render builds the image and starts it; no build or start command is needed.
3. Health check: `/health`. Every push to the branch redeploys automatically.

Run the same image locally: `docker build -t zruky . && docker run -p 8080:8080 zruky` → http://localhost:8080

## Features

| Area | What works |
| --- | --- |
| Home | Hero, category tiles, featured rail, "near you" rail (when a city is chosen), promo banners, recently added, popular categories, personalised recommendations |
| Categories | 10 categories, each with its own page, breadcrumbs, quick sub-type chips and **category-specific filters** (e.g. make/year/mileage for vehicles, deal/rooms/area for real estate) |
| Search | Keyword search across titles, descriptions and attributes, live suggestions with keyboard navigation, recent searches, location picker |
| Filters & sort | Category, price range, city, condition and category attributes; sort by newest / lowest price / highest price / most viewed; removable filter chips + "Clear all"; all state lives in the URL |
| Listing page | Swipeable gallery with thumbnails and fullscreen lightbox, details table, seller card with rating, show phone, message seller, favorite, share, similar listings, owner controls |
| Post an ad | Title, category picker, multi-image upload (drag & drop, compression, reorder, cover), condition, category fields, price type (fixed / negotiable / free / exchange), city, live preview, quality checklist, full preview modal, validation, text autosave |
| Dashboard | My listings (all / active / sold, search), edit, mark sold / relist, delete with confirmation, views and saves stats, favorites, profile settings, password change, logout |
| Favorites | Works for guests too; merged into the account on login/registration |
| Messages | Conversation list (all / buying / selling, search), chat with day separators, read receipts, typing indicator, quick replies, delete chat. Demo sellers auto-reply; real accounts sync across browser tabs |
| Auth | Register, login, logout, protected routes with `?next=` redirect, hashed passwords |
| Responsive | Dedicated mobile layout: bottom tab bar, filter bottom sheet, sticky listing action bar, single-pane chat |

## Project structure

```
src/
  config/site.js        brand, currency, cities, limits — one place to customise
  data/                 categories (with filter definitions), seed users/listings/chats, static pages
  services/             storage + async "API" (auth, listings, favorites, messages, seed)
  context/              React state per domain (Auth, Listings, Favorites, Messages, Preferences, Toast)
  hooks/                useFilterParams, useDocumentTitle, useClickOutside, useMediaQuery
  utils/                filtering/sorting, validation, formatting, images, recommendations
  components/
    ui/                 Button, Field/Input/Select/Segmented, Modal/ConfirmDialog, Badge, Avatar…
    layout/             Header, SearchBar, LocationPicker, MobileTabBar, Footer, RootLayout
    listings/           ListingCard, ListingGrid/Rail, Gallery, FiltersPanel, ListingsBrowser…
    listing-form/       ListingForm, ImageUploader, ListingPreview
    messages/           ConversationList, ChatWindow
    home/, account/, brand/
  pages/                route components (lazy-loaded except the homepage)
  styles/               design tokens + component/page stylesheets
```

### Connecting a real backend

UI code only talks to `src/services/*`. Each service method is already `async` and throws typed `ApiError`s, so replacing the `localStorage` bodies with `fetch` calls (and the messages service with a WebSocket client) does not require changes to pages or components.

## Notes

- Demo photos are loaded from Unsplash; uploaded photos are compressed in the browser and stored as data URLs. Browser storage is limited (~5 MB), and the app shows a clear error if it fills up.
- Bump `SEED_VERSION` in `config/site.js` to refresh demo data on existing browsers (user-created data is kept).
