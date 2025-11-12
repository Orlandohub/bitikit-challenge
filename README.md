# Bitikit Challenge

A Next.js app that showcases a local-first user directory with manual offline controls and favorites persisted in IndexedDB.

## Install Dependencies

Use npm to install all project dependencies:

```bash
npm install
```

## Run the Project

Start the development server (Turbopack) on port 3000:

```bash
npm run dev
```

Then visit http://localhost:3000 in your browser.

## Simulate Offline or Failure Scenarios

- **In-app toggle:** Click the `Go offline` / `Offline mode` button in the header. When enabled, the UI switches to cached data only and surfaces the offline banner. Click again to re-enable live fetching. Typical flow:
  - **Manual offline toggle:** Click `Go offline`; the control changes to `Offline mode` and an offline status banner appears.
  - **While offline:** Favorite another user—the UI keeps both favorites and no new requests hit randomuser.me.
  - **Reload offline:** Refresh the page; the manual flag resets to online, but previously favorited users remain marked thanks to IndexedDB.
  - **Return online:** Toggle back online; the button reverts to `Go offline` and data stays cached until it expires.
- **Browser dev tools:** Open your browser’s developer tools, go to the Network tab, and enable an offline or “Slow 3G” throttling preset. This lets you observe how the app handles fetch failures and degraded connectivity.

In both cases you can trigger a retry from the notification banner once connectivity is restored.

## Known Issues & Limitations

- Cached users are stored in IndexedDB per browser profile; clearing site data removes them.
- Manual offline mode only serves pages that were previously fetched while online.
- Favorites are persisted locally only and do not sync across devices.
- No automated UI or integration tests are included yet.

## Future Improvements

- Add automated unit, integration, and snapshot tests around the offline flow and favorites.
- Replace the manual offline toggle with a service worker-driven fallback so the app works seamlessly when the network drops.
- Show more granular sync status (e.g., per-request progress, failure reasons) and offer queued updates when offline.
- Implement cloud synchronization so favorites and pagination state follow the user across devices.
