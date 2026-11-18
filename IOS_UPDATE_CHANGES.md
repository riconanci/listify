# Listify — iOS UI Update (Waves 1 + 2 + 3 Complete)

This zip is your `listify-main` project with the full iOS UI conversion applied.

## Files modified (22 total)

### Wave 1 — Foundation (4)
| File | Change |
|------|--------|
| `app/globals.css` | iOS design tokens, system font (SF Pro on iOS), typography scale, utilities |
| `components/Header.tsx` | iOS nav bar with stronger blur, tighter mobile height |
| `components/BottomNav.tsx` | iOS tab bar with filled-icon active state |
| `components/StatusBadge.tsx` | Sentence case, softer colors, smaller dot |

### Wave 2 — Main pages (8)
| File | Change |
|------|--------|
| `app/page.tsx` | Cropped to single-screen hero, signed-in users redirected to /jobs |
| `app/jobs/page.tsx` | LargeTitle, iOS search bar, pill filter/map buttons, full-bleed cards |
| `app/jobs/[id]/page.tsx` | Chevron-back nav, grouped iOS cards for each section |
| `app/signin/page.tsx` | Grouped form rows, pill CTA, refined error styling |
| `app/signup/page.tsx` | 3-step flow with iOS card selection, pill progress bar |
| `app/profile/page.tsx` | Grouped settings cards, real iOS toggle switch |
| `components/JobCard.tsx` | Mobile redesigned as full iOS card, desktop unchanged |
| `components/FilterModal.tsx` | Refactored to use Sheet — slide-up bottom sheet |

### Wave 3 — Remaining pages (11)
| File | Change |
|------|--------|
| `app/post/page.tsx` | Grouped iOS form sections, iOS list rows, iOS toggle, pill submit |
| `app/inbox/page.tsx` | LargeTitle with sort action, refined inquiry cards |
| `app/notifications/page.tsx` | LargeTitle with action, iOS-grouped notification list |
| `app/saved/page.tsx` | LargeTitle with Clear All action, refined empty state |
| `app/onboarding/page.tsx` | Pill progress, iOS card row selection, refined CTAs |
| `app/jobs/manage/page.tsx` | LargeTitle, pill CTA, iOS-styled first-time experience |
| `components/EmptyState.tsx` | Pill CTAs, iOS typography |
| `components/NotificationItem.tsx` | iOS list-row treatment, refined typography |
| `components/InquiryCard.tsx` | Rounded card, action pills, refined avatar |
| `components/TalentInquiryCard.tsx` | Rounded card, iOS pill action buttons |
| `components/ManageListingCard.tsx` | Refined menu (iOS context menu style), pill renew button |

## Files added (3)

| File | Purpose |
|------|---------|
| `components/Button.tsx` | iOS button system (filled / tinted / plain / gray / destructive) |
| `components/Sheet.tsx` | Reusable bottom sheet with grabber pill |
| `components/LargeTitle.tsx` | iOS large-title page header used on Browse, Inbox, Saved, Profile, Notifications, Manage, Post |

## Files NOT modified

Everything else — API routes, lib/, prisma/, middleware, Toast, MapPicker, BrowseMap, LocationMap, ListHeader, FilterBar, NotFound, error boundaries, talent/shop public profiles, layouts, configs — all byte-identical to your original.

The whole iOS UI conversion is now complete. From here, any further changes are iterative refinements based on your testing.

## Test

```bash
unzip listify-ios.zip
cd listify-ios
npm install
npx prisma generate
# copy your .env from previous folder
npm run dev
```

Scan on iPhone. Walk through every screen:

1. **Landing** — single screen, signed in users go to /jobs
2. **Browse** — LargeTitle, iOS search, full-bleed cards
3. **Filter modal** — slides up from bottom with grabber
4. **Listing detail** — chevron back, grouped cards
5. **Profile** — grouped settings, iOS toggle
6. **Post a Listing** — grouped iOS form sections
7. **Inbox** — refined inquiry cards, sort action
8. **Notifications** — iOS section grouping, unread dots
9. **Saved** — LargeTitle with Clear All
10. **Sign in / Sign up** — grouped iOS form rows
11. **Onboarding** — pill progress, iOS card selection
12. **Manage Listings** — LargeTitle, pill CTA

## Known things to address later (not blockers)

- **Map button when empty** — still toggles state with no visible change when there are 0 jobs (proposed fix: show map centered on user location with no markers — let me know when you want this done)
- **Image storage** — still base64 (in your roadmap)
- **One-listing-per-account enforcement** — handled in this UI as a soft notice, server-side enforcement still pending (in your roadmap)
