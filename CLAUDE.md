# Pixel_Vision — Project Instructions

## Role & Workflow

- **Role**: Professional frontend designer + developer
- **Stack**: Vue 3 + Composition API (script setup) + Vue Router + GSAP + Fetch API
- **Workflow**: Understand requirements → Check existing code/conventions → Plan → Implement → Self-review → Summarize
- If requirements are ambiguous, **ask before assuming**.

## Visual Design Standards

### Color System
- Always use existing brand colors from `src/assets/CSS/*.css` first.
- If new colors are needed, derive from existing via **OKLCH**:
  ```css
  --primary-light: oklch(from var(--primary) l+0.2 c h);
  --primary-dark:  oklch(from var(--primary) l-0.2 c h);
  ```
- Never add arbitrary hex values (e.g. `#ff5733`).

### Visual Taboos (NEVER use)
1. **Large-area gradient backgrounds** — use solid or subtle gradients
2. **Emoji as functional icons** — use SVG/iconfont
3. **Left-side colored-stripe cards** — use clean cards or shadow separation
4. **Lorem Ipsum fake data** — use real or reasonable placeholder data
5. **Decorative icons with no function** — every icon must have a purpose

### Design Principles
- Every element must have a clear reason to exist. Remove purely decorative, non-interactive, non-semantic nodes.
- Prefer adding whitespace over filling space with useless content.
- Follow 8px grid spacing: small 8/16px, card gaps 24/32px, section gaps 48/64px.

## GSAP Animation Rules

- **Use GSAP as the primary animation library.**
- Only animate `transform` (x, y, scale, rotation) and `opacity`. Never animate `width`, `height`, `top`, `left`, `margin`, `padding`.
- Durations: 0.3–0.6s normal, 0.6–1s emphasis.
- Default eases: `power2.out`, `expo.out`, `back.out(1.7)`.
- Max 3 simultaneous animations on a page.
- Always use `gsap.context()` scoped to the component container ref. Call `ctx.revert()` in `onUnmounted`.
- Respect `prefers-reduced-motion`.

For detailed GSAP reference, see `.claude/skills/gsap-*.md`.

## Frontend-Backend Integration

### API Layer
- All API URLs in `src/config/api.js` — **never hardcode URLs in components**.
- Use **fetch** (not axios). Content-Type: `application/x-www-form-urlencoded` for forms, `application/json` for JSON.
- Return standardized format: `{ success: bool, data?, message? }`.
- Compatible handling: check both `result.code` and `result.recode`.

### Code Architecture (3 layers)
```
src/config/api.js     → API URLs
src/api/*.js          → HTTP calls (pure, no Vue deps)
src/composables/*.js  → Business logic, validation, state
src/views/*.vue       → UI rendering only
```

### Key Rules
- Token: `localStorage.setItem('token', ...)`, not sessionStorage.
- User info: `localStorage.setItem('userInfo', JSON.stringify(...))`.
- Button states: use `reactive()`, never direct DOM manipulation.
- Countdowns: clear intervals on unmount.
- Validation regex must match backend.
- No alert() for verification code success — use countdown directly.

For full integration reference, see `.claude/skills/frontend-backend-integration.md`.
