# Wayfarer Manual QA Checklist

Use this checklist when automated smoke coverage is limited.

## Core Planning Flow

1. Open the homepage at `/`.
2. Submit the empty planning form and confirm validation/disabled state prevents a silent failure.
3. Submit a valid trip prompt, such as `4 days in Kyoto for 2 people, love temples and food`.
4. Confirm the trip workspace opens at `/trip/[id]/chat/main`.
5. Confirm itinerary cards render immediately, even while AI generation is loading.
6. Edit an activity name or note and select `Save locally`.
7. Lock an activity, then confirm the card shows `Locked`.
8. Open the map tab/panel and confirm pins render when Mapbox is configured, or that the no-token state gives next actions.
9. Open the budget page/tab for a trip and confirm the empty/API-key state is clear.
10. Save an activity locally and confirm it appears in saved activities.
11. Visit `/trips` and confirm recent trips render, or the empty state links back home.
12. Share/export a trip from the workspace where available.
13. Visit `/trip/share/demo-share` and confirm the public shared trip route renders read-only content.
14. Test a mobile viewport and confirm the workspace tabs are reachable by tap and keyboard focus remains visible.

## Accessibility Checks

- Tab through homepage navigation, planning form, CTA buttons, and auth controls.
- Confirm icon-only buttons have accessible names.
- Confirm form fields have labels or screen-reader labels.
- Confirm loading states are visible and announced where practical.
- Confirm each error state offers a next action: retry, edit prompt, back home, save locally, or contact support.

## Homepage/Auth Smoke Checks

1. Confirm homepage destination imagery renders without broken image icons.
2. Confirm rendered homepage HTML does not include the previously failing Wikimedia thumbnail URLs.
3. Scroll the homepage and confirm content cards do not slide, jump, or reflow after hydration.
4. Open `/login`, click `Continue with Google`, and confirm the button shows a stable redirect/loading state.
5. Visit `/auth/callback?error=access_denied&error_description=Provider%20cancelled` and confirm a friendly retry/support state renders.
6. Confirm `/about` no longer contains "Coming Soon."
7. Confirm header and mobile nav only show links to real routes or real homepage sections.

## Required Commands

```bash
npx tsc --noEmit
npm run lint
npm run build
```
