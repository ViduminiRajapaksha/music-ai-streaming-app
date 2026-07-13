# MelodyMind AI — Frontend

A production-quality React frontend for an AI-powered music streaming platform. Built with React 19, Vite, Tailwind CSS, and integrated with a Node.js/Express backend using Spotify and Google Gemini APIs.

## Features

- **Authentication** — Register, login, JWT storage, protected routes, profile management
- **Music Discovery** — Search tracks, artists, albums; browse new releases and recommendations
- **Audio Player** — Sticky bottom player with play/pause, seek, volume, shuffle, repeat, and queue
- **Favorites** — Save and manage favorite songs with heart animations
- **Playlists** — Create, rename, delete playlists; add/remove songs
- **AI Features** — ChatGPT-style music chat, mood-based recommendations, AI playlist generation
- **Profile & Analytics** — Edit profile, favorite genres, listening history with Chart.js analytics
- **Responsive UI** — Spotify-inspired dark theme with Framer Motion animations

## Tech Stack

- React 19 + Vite
- React Router DOM
- Tailwind CSS
- Axios
- Context API
- Framer Motion
- Chart.js + react-chartjs-2
- React Hot Toast
- React Icons
- React Markdown

## Getting Started

### Prerequisites

- Node.js 18+
- Backend API running at `http://localhost:5000`

### Installation

```bash
cd frontend
npm install
npm run dev
```

The app runs at **http://localhost:5173**

### Build for Production

```bash
npm run build
npm run preview
```

## Project Structure

```
src/
├── components/     # Reusable UI components
├── pages/          # Route pages
├── context/        # Auth, Music, Player, Theme contexts
├── services/       # API service layer
├── hooks/          # Custom React hooks
├── utils/          # Helpers and constants
└── App.jsx         # Root router and providers
```

## API Configuration

The API base URL is set in `src/utils/constants.js`:

```js
export const API_BASE_URL = "http://localhost:5000/api";
```

Vite proxy is also configured in `vite.config.js` for development.

## Pages

| Route | Description |
|-------|-------------|
| `/` | Home — recommendations, new releases, recently played |
| `/search` | Search songs, artists, albums |
| `/favorites` | Saved favorite songs |
| `/playlists` | User playlists |
| `/ai-chat` | AI music assistant chat |
| `/mood` | Mood-based music recommendations |
| `/generate-playlist` | Natural language playlist generation |
| `/profile` | User profile and listening analytics |
| `/settings` | Change password, delete account |
