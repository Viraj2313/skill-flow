---
name: AlgoQuest Design System
colors:
  surface: '#fafaf1'
  surface-dim: '#dadbd2'
  surface-bright: '#fafaf1'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f4f4eb'
  surface-container: '#eeeee6'
  surface-container-high: '#e8e9e0'
  surface-container-highest: '#e3e3da'
  on-surface: '#1a1c17'
  on-surface-variant: '#44483d'
  inverse-surface: '#2f312b'
  inverse-on-surface: '#f1f1e8'
  outline: '#74796b'
  outline-variant: '#c4c8b9'
  surface-tint: '#486729'
  primary: '#426124'
  on-primary: '#ffffff'
  primary-container: '#5a7a3a'
  on-primary-container: '#e5ffc6'
  inverse-primary: '#aed288'
  secondary: '#7b5800'
  on-secondary: '#ffffff'
  secondary-container: '#fdc34d'
  on-secondary-container: '#715000'
  tertiary: '#7e446f'
  on-tertiary: '#ffffff'
  tertiary-container: '#9a5c89'
  on-tertiary-container: '#fff3f7'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#c9eea1'
  primary-fixed-dim: '#aed288'
  on-primary-fixed: '#0e2000'
  on-primary-fixed-variant: '#314f13'
  secondary-fixed: '#ffdea6'
  secondary-fixed-dim: '#f7bd48'
  on-secondary-fixed: '#271900'
  on-secondary-fixed-variant: '#5d4200'
  tertiary-fixed: '#ffd7ef'
  tertiary-fixed-dim: '#f9b0e2'
  on-tertiary-fixed: '#37052f'
  on-tertiary-fixed-variant: '#6a335d'
  background: '#fafaf1'
  on-background: '#1a1c17'
  surface-variant: '#e3e3da'
typography:
  h1:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 34px
    letterSpacing: -0.02em
  h2:
    fontFamily: Inter
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  h3:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  body:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 20px
  code:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
  label-caps:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  stat-lg:
    fontFamily: JetBrains Mono
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 24px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 8px
  sm: 12px
  md: 16px
  lg: 24px
  xl: 32px
  gutter: 16px
  margin: 20px
  tap_target: 44px
---

## Brand & Style
The design system is built to transform the often intimidating world of computer science into a tactile, approachable, and human-centric learning experience. It moves away from the "neon-on-black" hacker aesthetic in favor of a **Warm Minimalist** style inspired by physical parchment and academic notebooks.

The personality is academic yet accessible—think of a well-organized personal study journal rather than a corporate manual. The interface uses a "paper-on-paper" layering strategy to establish hierarchy, utilizing subtle tonal shifts and delicate borders instead of heavy shadows. The emotional goal is to lower the cognitive load and heart rate of the learner, providing a calm, stable environment for deep focus.

## Colors
The palette is rooted in organic, earthy tones. The **Warm Cream** background reduces eye strain during long coding sessions. **Moss Green** serves as the primary action color, providing a natural, "correct" feeling without being overly clinical. **Dark Amber** is reserved for high-value gamification elements like streaks and experience points, suggesting the prestige of a wax seal or gold leaf.

Functional colors (Success/Error) are intentionally desaturated to remain harmonious with the warm parchment base, ensuring they don't break the calming aesthetic while still providing clear feedback.

## Typography
This design system employs a functional pairing: **Inter** handles all narrative and structural content for maximum legibility, while **JetBrains Mono** is used for technical data, code snippets, and progress statistics.

The generous 1.6 line-height for body text mimics the spacing of a lined notebook, facilitating easier reading of complex algorithmic explanations. All "meta" information (tags, timestamps, difficulty levels) should use the monospaced font to distinguish them from the instructional narrative.

## Layout & Spacing
The layout follows a fluid-to-fixed model designed primarily for mobile-first interaction. 

- **Grid:** A standard 4-column layout for mobile with a 16px gutter and 20px side margins.
- **Rhythm:** An 8px linear scale (with a 4px half-step for tight components) maintains vertical rhythm.
- **Background Detail:** Apply a subtle dot-grid pattern to the #f5f4ef background. Use dots of #1c1917 at 4% opacity, spaced at 24px intervals to reinforce the "engineering notebook" feel.
- **Safe Zones:** Ensure all interactive elements maintain a minimum 44px hit area, even if the visual representation is smaller (like a ghost icon).

## Elevation & Depth
Depth is expressed through **Layered Tones** and **Physicality** rather than dramatic light sources.

1.  **Level 0 (Base):** The #f5f4ef parchment with dot-grid.
2.  **Level 1 (Surface):** Pure white (#ffffff) cards. These represent the primary content containers. Use a 1px border of #ddd9cf and a very soft, diffused shadow: `0 1px 3px rgba(0,0,0,0.06)`.
3.  **Level 2 (Raised):** Used for code blocks and secondary UI elements (e.g., drawer handles). These use #f0ede6 with no shadow.
4.  **Level 3 (Sunken):** Inactive states, search bars, and input fields use #ebe8e0 with a 1px inset border to simulate a debossed effect.

## Shapes
Shapes are soft and approachable. The system uses a multi-tier corner radius strategy to create a visual container hierarchy:
- **Large containers (Cards, Modals):** 12px radius.
- **Primary interactions (Buttons, Inputs):** 8px radius.
- **Small metadata (Pills, Tags, Badges):** 6px radius.

All icons must use the **Material Symbols Outlined** set with a consistent stroke weight of 200 or 300 to match the refinement of the typography.

## Components

### Buttons
- **Primary:** Background #5a7a3a, Text #ffffff, 8px radius. High emphasis.
- **Secondary:** Background #ffffff, Border 1px #ddd9cf, Text #57534a.
- **Ghost:** No background, Text #5a7a3a, JetBrains Mono font for "technical" actions.

### Cards
- White (#ffffff) background, 1px #ddd9cf border, 12px radius. Internal padding should be at least 16px (md) or 24px (lg).

### Code Blocks
- Background #f0ede6, 8px radius. Text in JetBrains Mono #1c1917. Use a 1px #ddd9cf border. Syntax highlighting should use the Primary (green), Accent (gold), and Error (red) colors for consistency.

### Progress & Stats
- **Progress Bars:** Track #ebe8e0, Fill #5a7a3a (or #b8860b for XP). 4px height, rounded ends.
- **Stat Badges:** Use #f0ede6 background with JetBrains Mono text.

### Inputs
- Background #ebe8e0 (Sunken), 1px border #ddd9cf, 8px radius. Focused state: 1px solid #5a7a3a.

### Navigation
- Bottom navigation tabs use #f5f4ef background. Active state is indicated by a Moss Green icon and a 2px top-indicator bar or a subtle shift to a white surface area.