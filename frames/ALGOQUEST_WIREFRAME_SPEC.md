# AlgoQuest — Mobile App Wireframe Specification

> **For Stitch** — All 23 screens, mobile only (390×844px).
> Desktop web will be derived from these frames separately.

---

## Design Language

### Aesthetic Direction

> **IMPORTANT:** Do NOT produce generic AI app aesthetics. No neon glows, no dark backgrounds, no purple gradients, no rainbow accents, no glassmorphism, no glowing borders. The feel should be **warm, cream, light** — exactly like Claude.ai's light mode. Something you can stare at for 4 hours while coding and feel comfortable. Think "warm paper", not "cold tech product".

**Reference:** Claude.ai light UI — warm cream/parchment page background, clean white cards, dark charcoal text, moss green buttons, gentle warmth throughout. Feels like a premium notebook, not a startup SaaS app.

---

### Color Palette

| Token | Hex | Usage |
|---|---|---|
| `background` | `#f5f4ef` | App background — warm cream, slight parchment tone |
| `surface` | `#ffffff` | Cards, sheets, bottom bars — clean white |
| `surface-raised` | `#f0ede6` | Inner cards, secondary surfaces, code block bg |
| `surface-sunken` | `#ebe8e0` | Input fields, inactive tabs, tag pills |
| `border` | `#ddd9cf` | All borders — warm light grey, never harsh |
| `border-strong` | `#c8c3b8` | Dividers, focused input outlines |
| `text-primary` | `#1c1917` | Main text — near-black with warm undertone, NOT pure black |
| `text-secondary` | `#57534a` | Body text, descriptions — warm dark grey |
| `text-muted` | `#9c9284` | Labels, placeholders, timestamps |
| `primary` | `#5a7a3a` | **Moss green** — buttons, active states, progress fills |
| `primary-hover` | `#4a6830` | Pressed/hover state of primary |
| `primary-dim` | `#eaf2e3` | Light green wash bg (behind active items, tag pills) |
| `primary-text` | `#3d5c28` | Moss green text on light bg (tags, active labels) |
| `accent-gold` | `#b8860b` | Streaks, medals, rank badges, XP ONLY — warm dark amber |
| `accent-gold-bg` | `#fef3c7` | Light amber wash (behind streak cards, XP pills) |
| `success` | `#3d7a42` | Accepted, solved indicators — forest green |
| `success-bg` | `#e8f5e9` | Light green wash behind success states |
| `error` | `#9b3c3c` | Failed, wrong answer — muted dark red |
| `error-bg` | `#fdecea` | Light red wash behind error states |
| `code-bg` | `#f0ede6` | Code blocks — slightly warm off-white |

#### Color Rules
- **Background is cream `#f5f4ef`** — NOT white, NOT grey, NOT dark. This warm parchment tone is the defining characteristic of the entire app.
- **Cards are white `#ffffff`** — they sit cleanly on top of the cream background, creating gentle depth without shadows.
- **Moss green** (`primary`) is used sparingly — only CTAs, active tab indicators, filled progress bars, toggle-on states.
- **Gold/amber** only for gamification: streak fire icon, rank medals, XP values, leaderboard rank #1.
- **This is a 100% light theme.** No dark surfaces anywhere except the code editor pane (which uses `#f0ede6` — a warm light editor theme, like Solarized Light or Parchment).
- Backgrounds are **flat** — no gradients, no textures except the barely-visible dot-grid.
- Shadows are extremely soft: `0 1px 3px rgba(0,0,0,0.06)` — cards should feel paper-like, not floating.
- **Borders never use color** — always `#ddd9cf`, never a green or gold border.

---

### Typography

| Role | Font | Size | Weight | Style |
|---|---|---|---|---|
| Display / H1 | Inter or DM Sans | 28px | 700 | tracking -0.02em |
| H2 | Inter or DM Sans | 22px | 600 | — |
| H3 | Inter or DM Sans | 18px | 600 | — |
| Body | Inter or DM Sans | 15px | 400 | line-height 1.6 |
| Label / Caps | JetBrains Mono | 11px | 500 | ALL CAPS, letter-spacing 0.08em |
| Code | JetBrains Mono | 13px | 400 | — |
| Stats / XP / Numbers | JetBrains Mono | varies | 700 | monospace bold |

**Typography rules:**
- Main body text is `#1c1917` — warm near-black, NOT pure `#000000`. Never harsh.
- Secondary text `#57534a` — readable warm grey, comfortable for long reading.
- Monospace used **only** for: section labels, code, stats, XP values, timers, rank numbers.
- Max 3 font weights per screen.

---

### Surface & Card Style

- **White cards on cream background** — this is the core visual structure.
- Cards: `#ffffff` bg, `1px solid #ddd9cf` border, `0 1px 3px rgba(0,0,0,0.06)` shadow.
- Border-radius: `12px` on cards, `8px` on inputs/buttons, `6px` on pills/badges.
- Input fields: `#ebe8e0` bg (slightly sunken feel), `#c8c3b8` border on focus.
- No glassmorphism anywhere on this theme.

---

### Background & Texture

- Flat `#f5f4ef` everywhere — warm cream parchment.
- Dot-grid texture at `4% opacity`, dots `#c8c3b8` — barely visible, adds subtle depth.
- The dot grid should feel like faint graph paper on a warm cream notebook.

---

### Iconography

- **Google Material Symbols, outlined style**
- Most icons: `text-secondary` color (`#57534a`) — warm dark grey
- Active/selected icons: `primary` moss green
- Decorative (fire, medal, bolt): `accent-gold`

---

### Spacing System

- Card internal padding: `20px`
- Section gaps: `16px`
- Screen horizontal padding: `20px`
- List item height: `56–64px`
- Minimum tap target: `44×44px`

---

### Overall Feel — Reference Apps

- **Claude.ai light mode** — warm cream, calm, extremely readable, human
- **Notion light mode** — white cards on warm bg, generous whitespace
- **Linear light mode** — every element has purpose, no visual noise
- **Bear app (iOS)** — warm parchment, paper-like comfort

---

## Frame Specifications

| Property | Value |
|---|---|
| Frame size | 390 × 844px |
| Status bar | 44px top safe area |
| Home indicator | 34px bottom safe area |
| Effective content | 390 × 766px |
| OS | iOS 17 / Android 14 |

---

## Navigation

**Bottom Tab Bar** (fixed, 56px tall, `surface` background, `border` top):

| Tab | Icon | Label |
|---|---|---|
| 1 | `home` | Home |
| 2 | `account_tree` | Skills |
| 3 | `bolt` | Challenge |
| 4 | `emoji_events` | Ranks |
| 5 | `person` | Profile |

- Active: icon + label in `primary` moss green
- Inactive: icon + label in `text-muted`
- Safe area padding at bottom

---

## Screen Index

| # | Screen Name |
|---|---|
| 01 | Onboarding Splash |
| 02 | Onboarding Carousel — Slide 1 |
| 03 | Onboarding Carousel — Slide 2 |
| 04 | Onboarding Carousel — Slide 3 + CTA |
| 05 | Push Notification Permission |
| 06 | Login |
| 07 | Register |
| 08 | Dashboard (Home Tab) |
| 09 | Skill Tree |
| 10 | Problem List Bottom Sheet |
| 11 | Code Editor — Problem Tab |
| 12 | Code Editor — Code Tab |
| 13 | Submission Result — Accepted |
| 14 | Submission Result — Failed |
| 15 | AI Code Review Sheet |
| 16 | Daily Challenge |
| 17 | Leaderboard |
| 18 | Profile |
| 19 | Rank Up Celebration |
| 20 | Streak Broken Alert |
| 21 | XP Gain Animation Overlay |
| 22 | Search Screen |
| 23 | Settings Screen |

---

## Screen 01 — Onboarding Splash

**Trigger:** First app launch only. Full-screen, no tab bar, no nav.

**Background:** `#1a1915`, faint dot-grid at 3% opacity.

**Center (vertically + horizontally):**
- App icon: SVG tree-graph (circles connected by lines), ~120×120px, `primary` moss green
- Below: `ALGOQUEST` wordmark — bold, JetBrains Mono caps, 28px, `text-primary`
- Below: thin separator line — `primary`, 40px wide, 1px tall
- Below: `v2.0` — JetBrains Mono, 11px, `text-muted`

**Bottom 20%:**
- 3 animated dots pulsing in sequence — `primary` moss green
- `INITIALIZING...` — JetBrains Mono caps, 10px, `text-muted`, centered below dots

**Animation note:** Logo fades in + scales 0.8→1.0 over 800ms, then auto-transitions to Carousel.

---

## Screen 02 — Onboarding Carousel — Slide 1 of 3

**Trigger:** After splash. Full-screen, no tab bar.

**Top 10%:**
- `SKIP` text link — top right, 13px, `text-muted`, JetBrains Mono caps

**Center 60%:**
- Large icon: `map` (Material Symbol), 80px, `primary` moss green
- H2: `Structured Roadmap` — 22px bold, `text-primary`, centered
- Body (centered, `text-secondary`, 15px, max 280px wide):
  > Navigate a curated curriculum of data structures and algorithms. Master the basics before unlocking advanced arenas.

**Bottom 30%:**
- Page dots: 3 dots — dot 1 = `primary` filled circle, dots 2–3 = `border` outlined
- `NEXT →` button — full-width, 52px, `primary` background, `#ffffff` label, JetBrains Mono caps

---

## Screen 03 — Onboarding Carousel — Slide 2 of 3

Same layout as Slide 1. Different content:

- Icon: `terminal`, 80px, `primary`
- H2: `Real-time Execution`
- Body: Write and run code in your language of choice. Instant feedback, live test results, and performance metrics as you solve.
- Dot 2 = `primary` filled, dots 1 and 3 = outlined

---

## Screen 04 — Onboarding Carousel — Slide 3 of 3 + CTA

Same layout. Different content, two buttons:

- Icon: `workspace_premium`, 80px, `accent-gold`
- H2: `Climb the Ranks`
- Body: Earn XP, build streaks, and compete on the global leaderboard. Prove your logic. Achieve Grandmaster.
- Dot 3 = `primary`, dots 1–2 = outlined

**Two stacked buttons:**
1. `GET STARTED →` — full-width, 52px, `primary` bg, white label
2. `I ALREADY HAVE AN ACCOUNT` — full-width, 44px, outlined `primary` border, `primary` text, smaller caps

---

## Screen 05 — Push Notification Permission

**Trigger:** After first login. Full-screen, no tab bar.

**Background:** `#1a1915` flat.

**Center card** (`surface` bg, `border`, 340px wide, 24px radius):
- Bell icon with ripple rings, 64px, `primary` moss green
- H2: `STAY IN THE FIGHT` — JetBrains Mono caps, 22px, `text-primary`, centered
- Body (`text-secondary`, centered, 15px):
  > Get daily challenge alerts, streak reminders, and rank notifications so you never miss a day.
- Thin divider — `border`, full card width
- 3 benefit rows (icon + text each, `text-secondary`, 14px):
  - `notifications` icon — "Daily challenge reminder at 8am"
  - `local_fire_department` icon (`accent-gold`) — "Streak alert before midnight"
  - `emoji_events` icon — "Rank change notifications"
- `ALLOW NOTIFICATIONS` — full-width, 52px, `primary` bg, white label
- `Maybe Later` — text link, `text-muted`, 13px, centered below button

---

## Screen 06 — Login

**Full-screen, no tab bar. `#1a1915` background with dot-grid.**

**Top:**
- Back arrow (top left, if from onboarding)
- `ALGOQUEST` wordmark — JetBrains Mono, 24px bold, `text-primary`, centered

**Pill tab toggle** (full-width, 48px, `surface` bg, `border`):
- `LOG IN` | `SIGN UP`
- Active segment: `primary` bg, white text
- Inactive: transparent, `text-muted`

**Form** (20px horizontal padding):
- `EMAIL` label — JetBrains Mono caps, 10px, `text-muted`
- Input field — `surface-raised` bg, `border`, 48px, radius 8px, `text-primary`
- `PASSWORD` label + input (eye-toggle icon right inside field)
- `Forgot password?` — 12px, `primary`, right-aligned, below password field

**Primary button:** `LOG IN` — full-width, 52px, `primary` bg, white, JetBrains Mono caps

**Divider:** thin line with `OR` centered, `text-muted`

**Google button:** full-width, 44px, outlined `border`, Google icon left, `text-secondary`

---

## Screen 07 — Register

Same layout as Login. `SIGN UP` tab active. Additional fields:

- `USERNAME` — label + input
- `EMAIL` — label + input
- `PASSWORD` — label + input (eye toggle)
- `DISPLAY NAME` — label + input (placeholder: "Optional")

**Button:** `CREATE ACCOUNT` — full-width, 52px, `primary`

**Footer note** (`text-muted`, 11px, centered): By signing up you agree to our Terms & Privacy Policy

---

## Screen 08 — Dashboard (Home Tab)

**Tab bar visible. Scrollable content. 20px horizontal padding.**

### Greeting Row (no card, inline)
- Left: `Hey, [username]` — H2, 22px bold, `text-primary`; below: `System optimal.` — JetBrains Mono, 11px, `text-muted`
- Right: Two stacked stat chips (`surface` bg, `border`, 6px radius):
  - `local_fire_department` icon (`accent-gold`) + streak number — JetBrains Mono bold
  - `workspace_premium` icon (`accent-gold`) + XP number — JetBrains Mono bold

### Card: Daily Progress
`surface` bg, `border`, 12px radius, 20px padding

- Top row: `DAILY PROGRESS` caps label + `trending_up` icon (left) | `Lvl 14` dark pill (right, `surface-raised`, JetBrains Mono)
- `Next Rank:` — 12px, `text-muted`
- Rank name (e.g. `Problem Solver`) — H3, 18px bold, `primary` moss green
- XP amount — JetBrains Mono bold, `text-primary`, right-aligned
- **Segmented progress bar:** 10 equal blocks, full-width
  - Filled: `primary` | Empty: `surface-raised`

### 2-Column Row (50/50, gap 12px)

**Mini Card A — Skill Proficiency:**
- `SKILL PROFICIENCY` caps label + `radar` icon
- Pentagon radar chart (5 axes: Arrays, DP, Graphs, Trees, Math)
  - Background grid: 3 faint concentric pentagons, `border` color
  - Filled polygon: `primary` stroke + `primary-dim` fill
  - Vertex dots: `primary` filled circles
  - Axis labels: JetBrains Mono, 9px, `text-muted`, outside pentagon

**Mini Card B — Weekly Division:**
- `WEEKLY DIVISION` caps label + `military_tech` icon (`accent-gold`)
- Circular ring (centered, large within card):
  - Grey track (`surface-raised`) + `primary` arc fill
  - Center: `TOP` (`accent-gold`, bold) + `15%` (`text-primary`, small)
- Below: `[Rank] League` — `text-secondary`, 13px; `Ends in 2d 14h` — JetBrains Mono, 11px, `text-muted`

### Card: Recommended Quest
`surface` bg, `border`, 12px radius

- Header: `RECOMMENDED QUEST` caps label + `explore` icon (`accent-gold`) | `MEDIUM` pill (outlined `accent-gold`, `accent-gold` text)
- Problem title — H3, `text-primary`, bold
- Description — 2 lines, `text-secondary`, 14px
- Tag pills row: `Array` | `DP` | `⚡ +50 XP` (`primary-dim` bg, `primary` text)
- `INITIATE →` — full-width, 44px, outlined `primary`, `primary` text, JetBrains Mono caps

### Card: Global Top
`surface` bg, `border`, 12px radius

- Header: `GLOBAL TOP` caps label | `View All` small link (`primary`, right)
- 3 user rows: rank | square avatar | username + title | XP (JetBrains Mono, `primary`)
  - Rank 1 number: `accent-gold`; others: `text-muted`
- Dashed divider — `border`
- `YOU` row: `primary-dim` bg, `primary` left border 3px; username bold `primary` + `(You)` suffix

---

## Screen 09 — Skill Tree

**Tab bar visible (Skills tab). Scrollable vertical canvas. Dot-grid `#1a1915` background.**

### Page Header (centered)
- H1: `Core Algorithms` — 28px bold, `text-primary`
- Subtitle — `text-secondary`, 13px, centered, max 280px

### Skill Tree Canvas (scrollable)
SVG overlay for connection bezier curves.

**Node tiers (top to bottom):**
1. Center: **Arrays**
2. Left + Right: **Strings** | **Recursion**
3. Spread 3: **Linked Lists** | **Stack** | **Queue**
4. Spread 3: **Trees** | **Graphs** | **Heap**
5. Center: **Dynamic Programming**

**Connection lines (SVG bezier):**
- Completed: `primary` solid
- Active: `primary` 50% opacity
- Locked: `border` dashed

**Each Topic Node (60×60px circle):**
- Outer SVG ring = progress % (`primary` stroke)
- Inner circle — 3 states:
  - **Locked:** `surface` fill, `lock` icon center, 60% opacity
  - **In Progress:** `surface` fill, topic icon in `primary`, subtle float animation
  - **Completed:** `surface-raised` fill, filled `check` icon, `text-primary`
- Label below: topic name — JetBrains Mono caps, 11px, `text-secondary`
- Sub-label: `Level X/5` — 10px, `text-muted`
- Active only: `3/10 done` — 10px, `text-muted`

---

## Screen 10 — Problem List Bottom Sheet

**Trigger:** Tap unlocked Skill Tree node. Slides up (~80% height). Skill Tree dimmed behind `rgba(0,0,0,0.5)` scrim.

**Bottom sheet:** `surface` bg, 20px top radius, `border` top edge

- **Drag handle:** 32×4px, `border` color, centered top
- **Header:** topic icon (`primary`) + topic name (H2) | `Level X/5` pill (right)
- Below header: `X problems remaining` — JetBrains Mono, 11px, `text-muted`

**Filter pills** (horizontal scroll): `ALL` | `EASY` | `MEDIUM` | `HARD`
- Active: `primary` bg, white label | Inactive: `border` outlined, `text-muted`

**Problem list** (scrollable, fills sheet):
Each row (64px, `border-bottom`):
- Left: difficulty dot (green/amber/red 8px) + problem title (15px bold `text-primary`) + tag pills below (tiny, `surface-raised`)
- Right: `⚡ +50 XP` pill + status icon (checkmark=solved, circle=unsolved, lock=locked)

**Pinned bottom:** `START TOPIC` — full-width, 52px, `primary` bg, white, above safe area

---

## Screen 11 — Code Editor — Problem Tab

**Full-screen. Bottom tab bar HIDDEN (full focus mode).**

### Header Bar (48px, `surface` bg, `border` bottom)
- Left: `arrow_back` icon
- Center: Problem title — 15px bold, `text-primary` (truncated)
- Right: Difficulty badge pill (Easy=`success`, Medium=`accent-gold`, Hard=`error` tint)

### Tab Switcher (full-width, 44px, `surface-raised` bg)
- `PROBLEM` (active — `primary` underline, `primary` text) | `CODE` (`text-muted`)

### Scrollable Content

**Description:** `text-secondary`, 15px, 1.6 line-height

**Examples** (each in `surface-raised` block, `border`, 8px radius, 16px padding, JetBrains Mono 13px):
```
Input:       [1, 2, 3]
Output:      6
Explanation: sum of array
```

**Constraints:** JetBrains Mono, 12px, `text-muted`, bordered block

**Footer row:** `timer` icon + `500ms` | `memory` icon + `256MB` — 12px, `text-muted`

### Hint Bar (pinned above bottom, 48px, `surface` bg, `border` top)
3 equal buttons: `💡 Hint 1` | `💡 Hint 2` | `💡 Hint 3`
- Style: outlined `border`, `text-secondary`, 8px radius
- Used: 40% opacity, disabled

Revealed hint expands below bar (`surface-raised` card, `accent-gold` left border 3px):
- `HINT 1  (-10% XP)` — JetBrains Mono caps, 10px, `accent-gold`
- Hint text — 13px, `text-secondary`

---

## Screen 12 — Code Editor — Code Tab

Same header. `CODE` tab now active.

### Language Row (44px, `surface-raised` bg, `border` bottom)
- Left: `Python ▾` dropdown — JetBrains Mono, `text-secondary`
- Right: `solution.py` — JetBrains Mono, `text-muted`

### Code Editor (fills remaining height)
- Background: `code-bg` (`#1e1d14`) — warm dark
- Font: JetBrains Mono, 13px, `text-primary`
- Syntax highlighted (warm color scheme — amber for keywords, moss for strings)
- Line numbers: `text-muted`, left gutter
- Current line: faint `primary-dim` tint
- No minimap

### Keyboard Toolbar (above virtual keyboard, `surface` bg, `border` top)
Horizontal scroll row of character shortcut buttons (36×36px, `surface-raised`, `border`, 6px radius):
`Tab` | `{` | `}` | `(` | `)` | `[` | `]` | `;` | `//` | `=` | `+` | `-` | `*` | `/`

### Bottom Action Bar (52px, `surface` bg, `border` top)
- Left: `3/5 passed` — JetBrains Mono, 12px, `text-muted`
- Right: `RUN` (outlined `border`, `text-secondary`, 80px, 40px) + `SUBMIT` (`primary` bg, white, JetBrains Mono caps, 100px, 40px)

**AI FAB** (bottom-right, 48×48px circle, `surface` bg, `border`): `smart_toy` icon, `text-secondary`

---

## Screen 13 — Submission Result — Accepted

**Full-screen. Animates up from bottom. No tab bar.**

**Background:** `#1a1915` with very subtle `success` radial glow (5% opacity) from center.

**Center:**
- Animated checkmark `check_circle` — 80px, `success` color, draws itself on entry
- `ACCEPTED` — H1 28px bold, JetBrains Mono caps, `success`
- Thin separator — `success`, 60px wide

**Stats grid** (2×2, `surface` cards, `border`):
| Runtime | Memory |
|---|---|
| `124 ms` | `18.4 MB` |
| `text-primary` JetBrains Mono bold | `text-primary` JetBrains Mono bold |

| Tests Passed | XP Earned |
|---|---|
| `12 / 12` | `⚡ +75 XP` |
| `success` bold | `accent-gold` bold |

**Buttons (stacked, full-width):**
1. `VIEW AI REVIEW` — outlined `primary`, 52px, `primary` text
2. `BACK TO PROBLEMS` — text link, `text-muted`, centered

---

## Screen 14 — Submission Result — Failed

Same layout. Failure state:

- Background: subtle `error` glow (5% opacity)
- Icon: `cancel` — 80px, `error`
- `WRONG ANSWER` or `TIME LIMIT EXCEEDED` — H1, `error`, JetBrains Mono caps

**Failed test case** (`surface-raised` block, `error` left border 3px):
```
Input:    [1, 2, 3]
Expected: 6
Got:      5
```

**Buttons:**
1. `TRY AGAIN` — full-width, 52px, `primary`
2. `GET HINT` — full-width, 44px, outlined `primary`

---

## Screen 15 — AI Code Review Sheet

**Trigger:** Tap AI FAB. Bottom sheet (~85% height). `surface` bg, 20px top radius.**

- Drag handle top
- Header: `smart_toy` icon (`primary`) + `AI CODE REVIEW` caps label (JetBrains Mono)
- Brief loading state: spinner + `Analyzing your solution...` (`text-muted`)

**Once loaded (scrollable content):**

**Review summary:** body text, `text-secondary`, 15px (2–4 sentences)

**Complexity row** (2 equal cards side by side, `surface-raised`, `border`):
- Left: `TIME COMPLEXITY` caps label + `O(n log n)` — JetBrains Mono, bold, `primary`
- Right: `SPACE COMPLEXITY` caps label + `O(n)` — JetBrains Mono, bold, `primary`

**Suggestions** (`SUGGESTIONS` caps label + `lightbulb` icon):
Numbered list, 3–4 items. Each: number badge (`primary-dim` circle, `primary` text) + suggestion text (`text-secondary`)

**Code snippet** (optional, `code-bg` block, JetBrains Mono, scrollable horizontally)

**Bottom:** `CLOSE` — full-width, 44px, outlined `border`, `text-secondary`

---

## Screen 16 — Daily Challenge

**Tab bar visible (Challenge tab active). Scrollable.**

### Hero Card (full-width, `surface` bg, subtle warm gradient top→bottom, `border`)
- Pill badge: `bolt` icon + `DAILY CHALLENGE` — JetBrains Mono caps, 11px, `primary` bg, white text
- H2: Problem title — 22px bold, `text-primary`
- Row: Difficulty badge + `⚡ +200 XP BONUS` pill (`accent-gold` bg, dark text)
- Countdown (centered):
  - `RESETS IN` — JetBrains Mono caps, 10px, `text-muted`
  - `08 : 24 : 37` — JetBrains Mono, 36px bold, `primary`
  - `HRS   MIN   SEC` — 9px, `text-muted`, below each digit group

### Problem Preview Card (`surface`, `border`)
- Description — 3 lines, `text-secondary`, 14px
- Tags row (horizontal scroll): pill chips, `surface-raised`, `border`, `text-secondary`
- `START CHALLENGE →` — full-width, 52px, `primary` bg, white, JetBrains Mono caps

### Streak Card (`surface`, `border`)
- Left: `local_fire_department` icon — 32px, `accent-gold`
- Center: `You're on a 7-day streak!` — 15px bold, `text-primary`; `Keep it going.` — `text-secondary` below
- Right: `chevron_right` icon, `text-muted`
- 7-day dot row (full-width, spaced evenly):
  - Filled gold circle = completed day
  - Empty `border` circle = missed
  - Today: pulsing `primary` ring around it

---

## Screen 17 — Leaderboard

**Tab bar visible (Ranks tab active). Scrollable.**

### Non-Scrolling Header
- H1: `Global Rankings` — 28px bold, `text-primary`
- Subtitle — JetBrains Mono, 12px, `text-muted`
- Your status card (`surface`, `border`, 72px, 12px radius):
  - Left: `diamond` icon (`accent-gold`) + `[Rank] Division` — H3, `text-primary`
  - Divider: `border` 1px vertical
  - Right: `Season Ends In:` label (`text-muted`) + `03d : 14h : 22m` (JetBrains Mono, `primary`, bold)

### Filter Pills (horizontal scroll)
`GLOBAL` | `WEEKLY` | `FRIENDS`
Active: `primary` bg, white. Inactive: `border` outlined, `text-muted`

### Rankings List (scrollable)
Each row (64px, `border-bottom`):
- **Rank** (40px col): Rank 1 = `accent-gold` bold; 2–3 slightly emphasized; rest = `text-muted`
- **User** (flex col): avatar circle (36px, `surface-raised`, `border`) + username (bold, `text-primary`) + rank title (12px, `text-muted`)
- **XP** (80px col): JetBrains Mono, `text-secondary`
- **Action** (70px col): `DUEL` outlined button (`border`, `text-secondary`, 36px, 6px radius) OR `---`

**YOU row:** `primary-dim` bg, `primary` 3px left border, username `primary` bold + `(You)`, action = `---`

Top 3 rows: gold / silver / bronze 3px left accent lines.

---

## Screen 18 — Profile

**Tab bar visible (Profile tab active). Scrollable.**

### Profile Header (no card, blends with background)
- Top right: `settings` icon button (`text-muted`, 44×44px)
- Centered:
  - Avatar circle — 80px, `surface` bg, `border`, `person` icon or initials
  - Username — H2, JetBrains Mono bold, `text-primary`
  - Display name — 14px, `text-secondary`
  - Rank badge — `accent-gold` `military_tech` icon + rank name, `surface` pill, `border`

### Stats Grid (2 columns, full-width, `surface` cards, `border`, 12px radius)
| Total XP | Problems Solved |
|---|---|
| `2,450` JetBrains Mono bold `primary` | `47` JetBrains Mono bold `text-primary` |

| Current Streak 🔥 | Longest Streak |
|---|---|
| `7` days `accent-gold` | `21` days `text-primary` |

| Weekly Rank | Member Since |
|---|---|
| `#23` `primary` bold | `Jan 2025` `text-muted` |

### Skill Breakdown (`SKILL BREAKDOWN` caps label)
6 horizontal bar rows per topic:
- topic icon | topic name (`text-primary`) | filled bar (`primary`) | `Level X` (`text-muted` right)

### Recent Activity (`RECENT ACTIVITY` caps label)
Submission rows (`surface`, `border`, 12px radius, 56px):
- Problem title (bold) | status badge | runtime (JetBrains Mono) | date (`text-muted`)
- Status: `Accepted` (`success` tint pill) | `Wrong Answer` (`error` tint) | `TLE` (`accent-gold` tint)

---

## Screen 19 — Rank Up Celebration

**Full-screen overlay. No tab bar. Triggered when XP crosses a rank threshold.**

**Background:** `#1a1915` with warm `accent-gold` particle system (20 small animated dots radiating outward, fading as they travel).

**Top 40% — Celebration:**
- Animated `military_tech` icon — 100px, `accent-gold`, spins into frame
- `RANK UP!` — H1 32px, JetBrains Mono caps, `accent-gold`
- Old rank → arrow → New rank:
  - `Coder` — `text-muted`, strikethrough | `→` `primary` | `Problem Solver` `primary` bold larger

**Center 60% — New Rank Card** (`surface`, `border`, 280px wide, centered):
- Medal icon — 64px, `accent-gold`
- New rank name — H2, bold, `accent-gold`
- `Unlocked at 2,000 XP` — JetBrains Mono, 11px, `text-muted`

- `+250 XP` that pushed the level — JetBrains Mono bold, `accent-gold`, centered

**Button:** `AWESOME!` — full-width, 52px, `primary` bg, white

---

## Screen 20 — Streak Broken Alert

**Full-screen interstitial. No tab bar. Appears on app open after missing a day.**

**Background:** `#1a1915`. Subtle desaturated red tint (3% opacity) radial from center.

**Center:**
- `local_fire_department` icon — 80px, `text-muted` (desaturated, grey flame — NOT gold)
- `STREAK BROKEN` — H1 28px, JetBrains Mono caps, `text-primary` (NOT red — subdued tone)
- `Your 7-day streak has ended.` — 15px, `text-secondary`, centered
- `Don't let it happen again.` — JetBrains Mono, 11px, `text-muted`

**Stat card** (`surface`, `border`, 320px centered):
- Left: `Best Streak: 21 days` | divider | Right: `New Streak: 0`
- JetBrains Mono, `text-secondary`

**Below card:** `Rebuild your streak today.` — 14px, `text-secondary`, centered

**Buttons:**
1. `TAKE TODAY'S CHALLENGE` — full-width, 52px, `primary`
2. `Skip` — text link, `text-muted`, 13px, centered

---

## Screen 21 — XP Gain Animation Overlay

**Momentary transparent overlay. Appears over Submission Result screen. Auto-dismisses in 1.5s. No interaction.**

**Elements (centered):**
- `+75 XP` — JetBrains Mono, 40px bold, `accent-gold`
  - Animates: fade in at center → moves 80px upward → fades out. Total: 1.5s.
- Gold particle burst: 20 dots (4px each, `accent-gold`), burst outward from XP text origin, fade as they travel. Duration: 1s each.

**Haptic:** Medium impact fires simultaneously.

---

## Screen 22 — Search Screen

**Accessible from Dashboard header magnify icon. Full-screen, no tab bar.**

### Search Bar (pinned, `surface` bg, `border` bottom)
- `arrow_back` icon | Search input — full-width, 48px, `surface-raised`, `border`, 8px radius, autofocused | `Cancel` text link (`text-muted`)

### Empty State (before typing)

**Recent Searches:**
- `RECENT` caps label | `Clear` small link (right, `text-muted`)
- Pill chips row (horizontal, `surface-raised`, `border`, 6px radius): recent search terms + `×` remove button each

**Popular Topics:**
- `POPULAR TOPICS` caps label
- 3-column pill grid: `Array` | `String` | `DP` | `Graph` | `Tree` | `Sorting` | `Binary Search` | `Sliding Window` | `Recursion`
- Pill style: `surface-raised`, `border`, `text-secondary`

### Results State (while/after typing)
- `12 problems found` — JetBrains Mono, 11px, `text-muted`, below search bar

**Problem list rows** (64px, `border-bottom`):
- Difficulty dot + title (bold, `text-primary`) + topic tag pill
- Right: XP pill + `check_circle` icon (`success`) if already solved
- Tap → navigates to Code Editor

---

## Screen 23 — Settings Screen

**Full-screen. Stack nav (back arrow top-left). Tab bar visible.**

### Header (`surface` bg, `border` bottom, 56px)
- `arrow_back` icon (left) | `Settings` — H2, `text-primary`, centered

### Settings Sections (scrollable)

**ACCOUNT** section label (JetBrains Mono caps, 10px, `text-muted`, 16px top margin):
- `Display Name` | current value (`text-muted`) + `chevron_right`
- `Username` | current value + `chevron_right`
- `Change Password` | `chevron_right`
- `Connected Accounts` | `Google` badge + `chevron_right`

Each row: `surface` bg, `border-bottom`, 56px, 20px horizontal padding, `text-primary` label

**NOTIFICATIONS** section label:
- `Daily Challenge Reminder` | toggle switch (right — on = `primary`, off = `surface-raised`)
- `Streak Alert` | toggle switch
- `Rank Changes` | toggle switch
- `Reminder Time` | `8:00 AM` (`text-muted`) + `chevron_right`

**APPEARANCE** section label:
- `Theme` | `Dark` (`text-muted`) + greyed toggle (only option)
- `Code Font Size` | `13px` + `chevron_right`

**ABOUT** section label:
- `Version` | `2.0.0` (`text-muted`) — non-tappable (no chevron)
- `Terms of Service` | `chevron_right`
- `Privacy Policy` | `chevron_right`
- `Rate AlgoQuest` | `star` icon + `chevron_right`

**Bottom (below all sections):**
`LOG OUT` — full-width, 52px, outlined, `error` text color, `error` border tint

---

## Shared Components

### Glass Card (bottom sheets & overlays only)
- `surface` bg + `backdrop-blur: 8px` (subtle, not heavy)
- `border` 1px
- 20px top radius (bottom sheets)
- Shadow: `0 -4px 24px rgba(0,0,0,0.4)`

### Standard Card
- `surface` bg, `border` 1px, 12px radius
- Shadow: `0 1px 4px rgba(0,0,0,0.4)` — grounded

### Bottom Sheet
- Drag handle: 32×4px, `border` color, centered top
- Background: `surface`, 20px top corners
- Scrim behind: `rgba(0,0,0,0.5)`
- Swipe-down to dismiss

### Difficulty Badge
| Level | Background | Text |
|---|---|---|
| Easy | `success` at 15% opacity | `success` |
| Medium | `accent-gold` at 15% opacity | `accent-gold` |
| Hard | `error` at 15% opacity | `error` |

### XP Pill
- `primary-dim` bg | `primary` border | `primary` text | `⚡` bolt icon left
- JetBrains Mono, 11px

### Rank System
| Rank | XP Range | Color |
|---|---|---|
| Beginner | 0 – 499 | `text-muted` |
| Coder | 500 – 1,999 | `text-secondary` |
| Problem Solver | 2,000 – 4,999 | `primary` |
| Algorithmist | 5,000 – 9,999 | `primary` brighter |
| Grandmaster | 10,000+ | `accent-gold` |

### Key User Flows
```
Onboarding:    01 → 02 → 03 → 04 → 05 → 06/07 → 08
Solve problem: 08 → 09 → 10 → 11/12 → 13/14 → 21 → 08
Rank up:       After screen 13 → 19 (if threshold crossed)
Daily:         16 → 11/12 → 13 → 21
Streak broken: 20 appears on next app open after missed day
```

---

*End of specification — 23 screens total*
