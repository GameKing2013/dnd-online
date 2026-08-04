# Nat20

A self-hosted web app for playing D&D with friends: build character sheets,
run campaigns as a DM, and play live sessions together with real-time chat,
a dice roller, an initiative tracker, and a simple token map.

## Features

- **Accounts** — simple email/password login, no third-party service required.
- **Character sheets** — 5e-style sheet: ability scores with auto-calculated
  modifiers, saving throws, all 18 skills with proficiency toggles, combat
  stats (AC, HP, initiative, speed), attacks, inventory, spell slots and
  spell list, features, and notes. Autosaves as you type.
- **Campaigns** — DMs create a campaign and get a 6-character invite code;
  players join with the code and link one of their characters. DMs get a
  private notes panel.
- **Live sessions** — real-time (Socket.io) room per campaign:
  - Shared dice roller (`1d20+5` style notation) with rolls visible to everyone
  - Text chat
  - Initiative tracker (DM adds combatants, advances turn order)
  - A simple token map: DM sets a background image URL, adds colored tokens,
    everyone can drag tokens around and see updates live

## Running it locally

Requires Node.js 18+.

```bash
npm install
npm start
```

Then open **http://localhost:3000**, register an account, and go.

Data is stored in a single JSON file at `data/db.json` (no database server
required). Delete that file to reset all data.

## Playing with friends over the internet

Running it locally only works for people on your own machine/network. To let
friends join from anywhere, deploy it to a small hosting service. This app
has no native dependencies and no external database, so it deploys cleanly
almost anywhere that runs Node. A few free/cheap options:

### Render.com (easiest)
1. Push this folder to a GitHub repo.
2. On Render, create a new **Web Service** from that repo.
3. Build command: `npm install`  •  Start command: `npm start`
4. Add an environment variable `SESSION_SECRET` set to any random string.
5. Deploy. Render gives you a public URL — share that with your players.

### Railway.app / Fly.io
Same idea: point it at this repo, set the start command to `npm start`,
set `SESSION_SECRET`, deploy.

### Important for real deployments
- Set the `SESSION_SECRET` environment variable to a long random string
  (don't use the default dev secret in `server/index.js`).
- The JSON file database (`data/db.json`) lives on disk. Most free hosting
  tiers use **ephemeral disks** — data can be wiped on redeploy/restart.
  For a one-shot game night this is fine. For a long-running campaign,
  either pick a host with a persistent volume (Render/Railway both offer
  this) and point `data/` at it, or ask me to swap in a proper database
  (e.g. Postgres) later if you outgrow this.
- This is a single-process app with an in-memory session store — fine for a
  home group (a handful of concurrent players). It is not built for
  large-scale public traffic.

## Project structure

```
server/
  index.js        Express app, session setup, socket.io wiring
  db.js            Tiny JSON-file database (users, characters, campaigns, chat, live state)
  auth.js          Auth middleware helpers
  dice.js          Dice notation parser (NdM+K)
  socket.js        Real-time session event handlers (chat, rolls, initiative, tokens)
  routes/
    auth.js         Register / login / logout / me
    characters.js    Character sheet CRUD
    campaigns.js     Campaign CRUD, invite/join, character linking
public/
  index.html        Login / register
  dashboard.html     Your characters & campaigns
  character.html      Character sheet editor
  campaign.html        Campaign management (DM notes, party, invite code)
  session.html          Live play room
  css/style.css
  js/                    Client-side logic per page
```

## Notes / possible next steps

- Passwords are hashed with bcrypt; sessions use signed cookies.
- The token map is deliberately simple (drag-and-drop circles on a
  background image, no grid/fog-of-war). Good enough to track rough
  positioning during a fight — not a full VTT like Roll20/Foundry.
- Everything is vanilla JS/CSS/HTML on the frontend — no build step needed.
