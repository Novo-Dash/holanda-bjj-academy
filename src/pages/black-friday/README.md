# Black Friday 2026 — Design System

Campaign landing page at `/black-friday`: a short page where a cold visitor answers
two questions, opens a gift box, claims a gift tied to enrollment, and books a free
trial class. Built for Gracie Barra Charleston and themed per academy.

Reference build: `Novo-Dash/gracie-barra-charleston-sc` → `src/pages/black-friday/`
(live at graciebarracharleston.com/black-friday).

## The idea

Black Friday is a day for products, not services. So the offer becomes a product:
a gift attached to enrollment (a free gi, a membership discount). The visitor does
not buy a class; they unlock a present.

- **Short page.** Hero, game, FAQ, map. No institutional sections.
- **A game, not a casino.** Two questions, the gift is matched to the answers.
  Never roulette, coins, confetti, neon or "jackpot".
- **Real urgency.** The gift stays reserved 48 h from the moment the box opens; the
  clock never restarts on a return visit.
- **One action.** Every block points to the gift; the last step books a class.

## Page anatomy

| Block | File | What it does |
|---|---|---|
| Hero | `components/Hero.tsx`, `hero.css` | Real photo full-bleed behind a dark overlay. Logo + phone pill. "BLACK / FRIDAY" with a black belt between the words. Lead, terms line ("Valid when you enroll. Starts with a free trial class."), pulsing CTA, Google rating. Vertical 9:16 VSL on the right (placeholder until the video exists). |
| Game arena | `components/game/GiftGame.tsx`, `game.css` | Full-bleed `--arena` ground that opens from a rounded card to full width on scroll. Glass progress pill (Who → Experience → Gift). Q1: photo cards (Me / My kid / Both of us). Q2: belt cards for adults (experience), age cards for kids (filters the booking). Every option shows a "Choose" button. |
| Gift box | `components/game/GiftBox.tsx`, `giftbox.css` | 3D box in `--accent` with white satin ribbon and bow. Tap: bow loops fly off, tails drop, ribbon slides off, lid flies, warm light, the prize rises. |
| Voucher + claim | `components/game/Reveal.tsx` | `--accent` voucher (prize, 48 h countdown) joined to a white form by a perforated edge. After the claim the form becomes the booking (class → day → time) from the Novo Dash kit, contact already filled. |
| FAQ + map | `components/Faq.tsx`, `faq.css` | One-column glass accordion, contact card, full-width map tinted toward `--arena` with a "Find us" card (logo, address, directions). |

## Tokens

Everything brand-specific lives in **`theme.css`** (look) and **`data/academy.ts`**
(content). No other file changes between academies.

### `theme.css`

| Token | Charleston | Role |
|---|---|---|
| `--accent` | `#c8102e` | CTA, gift box, voucher, ticks, focus. White text must pass AA on it. |
| `--accent-ink` | `#fff` (default) | Text and icons on `--accent` (buttons, voucher, ticks). Set a dark ink when the brand accent is light (e.g. Paradigm orange `#fe8001` + `#1b1209`). |
| `--arena` | `#19286d` | Game arena; darkened, the FAQ ground and the map tint. Pick the brand's deep secondary (navy, black-green, charcoal). |
| `--display` | AdihausDIN Cn | Titles, labels, buttons. A condensed bold face reads best. |
| `--body` | AdihausDIN | Running text. |
| `--display-style` | `italic` | Headline voice. `normal` for upright brands. |
| `--map-hue` | `195deg` | Rotates the inverted map toward `--arena`. ≈ arena hue − 35°. |

Plus the `@font-face` rules for the academy's fonts (self-hosted in `public/fonts`,
or `@fontsource` imported in `BlackFridayPage.tsx`).

**Derived, never set per academy** (`styles/global.css` and the component CSS):
every other red/blue in the kit is written as `hsl(from var(--accent) h s L%)` or
`hsl(from var(--arena) h s L%)`, so shades keep the brand hue at their designed
lightness. `--accent-deep` and `--arena-deep` are named examples.

**Constant on purpose:** the white satin ribbon and bow, the cream text tones, the
warm gift light (`--warm`), black, and the belt colors (white/blue belts are rank,
not brand).

### `data/academy.ts`

- `ACADEMY` — name, short name (voucher stamp), city, address, plaza line, phone,
  phone placeholder (area code), Google rating and review count, kids ages, adults
  age, Maps embed and link.
- `IMAGES` — hero (with desktop/mobile `object-position`), logo that reads on dark
  (with width/height), and the three Q1 photos. Real academy photos only.
- `KID_AGES` — the academy's kids age groups as `"min-max"`. Each card filters the
  booking to classes whose GHL name overlaps that range (`lib/lead.ts → bookingFor`).
- `CLASS_AGES` — only when GHL class names carry no ages ("Tiny Champs", "Juniors"):
  part of the class name → `"min-max"`, so the age filter still works.
- `PRIZES`, `GIFT_MODE`, `GIFTS_SUMMARY` — gift per audience. `single` mode gives
  everyone one gift (the questions stay).
- `TRIAL`, `VSL`.
- Unknown data stays `[… — TO CONFIRM]` (English). Never invent a prize, price or date.

## Behavior and data

- **Lead.** "Claim my gift" calls the kit's `captureLead` (`lib/lead.ts`): Webhook 1
  to GHL with `source: "Landing Page - Black Friday"`, `campaign`, `tags`
  (`black-friday-2026` + prize tag), `bf_prize`, `bf_prize_tag`, `bf_who`,
  `bf_answer`, `bf_reserved_until`, `ref`, UTMs and click ids; then Lead on
  Pixel + CAPI, GA4 `generate_lead`, Ads Lead. The dev server only logs it.
- **Booking.** `BookingForm` from `@/nd` with `contact`, `leadSent`, `filter`,
  `audience`, no `payment` (Black Friday trial is free). Webhook 2 + Schedule events
  as on the main LP.
- **48 h.** `lib/reservation.ts` keeps the prize and deadline in localStorage.
  One-gift-per-phone on the server is still to build (GHL workflow).
- **Test mode.** Dev server or `?test`: every load starts at question 1 and the
  claim step shows "Começar de novo (teste)". `?test` on a deployed page sends real
  leads.
- **Reduced motion.** No scroll scenes, the box opens straight to the prize, the CTA
  does not pulse. Nothing is left blank.

## Dependencies

- React 19, Vite, `@/` alias to `src/`.
- `gsap` + `@gsap/react` (ScrollTrigger for the arena, timeline for the box).
- Novo Dash kit `src/nd` with `captureLead` (`src/nd/lead.ts`) and the
  `contact` / `leadSent` / `filter` options on `BookingForm`
  (gracie-barra-charleston-sc commit `27add24`). Older kits need that patch; it is
  opt-in and changes nothing for pages that don't pass the options.
- Every rule is scoped under `.bf26`, so the page never touches the main LP's CSS.

## Creating the page for another academy

1. **Sync the repo.** `git fetch`; work from the branch Vercel deploys (usually
   `main`), fast-forwarded. Note any uncommitted work and don't touch it.
2. **Copy the kit.** `src/pages/black-friday/` and `src/pages/BlackFridayPage.tsx`
   from the reference build.
3. **Upgrade `src/nd` if needed.** Copy `src/nd/lead.ts`; add the three options to
   `BookingForm` (see commit `27add24`) and export `captureLead` and `BookingData`
   from `src/nd/index.ts`. Check the main LP's booking still asks for contact.
4. **Register the route** the way the repo adds `/back-to-school` (react-router
   `<Route path="/black-friday">` lazy + `Suspense`, or the `App.tsx` path switch).
   Add a `vercel.json` rewrite or page-head entry if the repo uses them.
5. **Theme.** Rewrite `theme.css` from the academy's live LP: its accent, its deep
   secondary as `--arena`, its fonts and `@font-face`, `--display-style`, `--map-hue`.
6. **Content.** Rewrite `data/academy.ts`: facts from the repo's `client.ts` / data
   files / schema, the logo variant that reads on black, real photos from
   `public/images`, the kids age groups that match the academy's GHL class names.
   Prizes and terms: `[… — TO CONFIRM]` unless the client gave them.
7. **Check** at 1440 and 390: hero, Q1, Q2 (adult and kid), gift, voucher, booking
   step (don't confirm a booking), FAQ, map. White text on `--accent` passes AA;
   no horizontal scroll; `tsc -b` and `npm run build` pass; the main LP is unchanged.
8. **Commit** only the kit, the route and the nd patch. Push when asked.

## QA checklist

- [ ] A cold visitor understands in 2 seconds: Jiu-Jitsu, which academy, a gift.
- [ ] Q1 cards clearly clickable on a phone.
- [ ] Kid age groups match the academy's real classes.
- [ ] Booking shows only the right classes for the answer, and no payment step.
- [ ] Voucher stamp, phone placeholder, logo and photos are this academy's.
- [ ] `grep -rn "TO CONFIRM" src/pages/black-friday` lists only what the client owes.
- [ ] No casino look: no roulette, coins, confetti, neon.
