# ♿ Accessibility — Cocktail Lab

## Overview

Cocktail Lab is built with accessibility as a first-class concern, targeting **WCAG 2.1 Level AA** compliance. This document describes the accessibility standards applied, the implementation decisions made, and the automated + manual testing approach used to validate them.

---

## 1. Standards & Target

| Standard | Target Level |
|----------|-------------|
| WCAG 2.1 | AA |
| ARIA Authoring Practices | WAI-ARIA 1.2 |
| Axe-core ruleset | axe-core 4.x |

The project uses `jest-axe` for automated accessibility audits integrated directly into component and integration tests, and Playwright for E2E accessibility flows in a real browser environment.

---

## 2. Key Principles Applied

### 2.1 Semantic HTML

All page structure uses semantic HTML5 elements rather than relying on generic `<div>` containers:

- `<header>` and `<nav>` define the navigation region
- `<main>` wraps the primary page content
- `<ul>` / `<li>` for lists of cocktails and ingredients
- `<button>` for all interactive actions (never `<div onClick>`)
- `<h1>` → `<h6>` hierarchy is maintained per page to produce a logical heading outline

### 2.2 Keyboard Navigation

- All interactive elements (buttons, links, inputs) are fully keyboard accessible
- Focus order follows the logical visual order of the page
- No keyboard traps (users can always navigate away from any element)
- Custom interactive components (e.g., category selector, favorites button) are implemented as native `<button>` elements to inherit default keyboard behavior

### 2.3 Focus Management

- Visible focus indicators are preserved (not removed via `outline: none` without replacement)
- The `<Modal>` implements a focus trap: when opened, focus moves into the dialog; Escape closes it and returns focus to the triggering element
- `ErrorBoundary` programmatically focuses the error heading after catching a render error, ensuring screen reader users are immediately informed
- Navigation links use React Router `<NavLink>` which applies `aria-current="page"` to the active route automatically

### 2.4 Color & Contrast

- Text contrast ratio meets WCAG AA minimums:
  - Normal text: ≥ 4.5:1
  - Large text (≥ 18pt or ≥ 14pt bold): ≥ 3:1
- Color is never the sole means of conveying information (e.g., the favorites icon also uses an accessible label, not just a color change)
- The UI has been tested against simulated color blindness profiles

### 2.5 ARIA Usage

ARIA attributes are used only when native HTML semantics are insufficient:

- `aria-label` on icon-only buttons (e.g., the favorites toggle button)
- `aria-live="polite"` on the notification/toast system so screen readers announce updates
- `aria-busy="true"` on loading containers during API fetches
- `role="status"` for loading state announcements
- `aria-current="page"` on the active navigation link

> **Principle:** No ARIA is better than bad ARIA. Native HTML elements are always preferred.

### 2.6 Images & Media

- All cocktail thumbnail images include meaningful `alt` text (drink name)
- Decorative images use `alt=""`
- Skeleton loading states use `aria-hidden="true"` to prevent screen reader noise during loading

### 2.7 Forms & Inputs

- The search input has an associated `<label>` element (even if visually hidden with `sr-only` class)
- The search field announces its purpose with a clear placeholder and label
- The search input is the only form control in the application — it does not perform client-side validation and therefore does not use `aria-describedby` error messaging

### 2.8 Responsive & Mobile Accessibility

- The application is fully responsive and passes touch accessibility checks
- Touch targets are at least 44×44px (WCAG 2.5.5)
- The viewport meta tag does not disable user zoom: `<meta name="viewport" content="width=device-width, initial-scale=1">` (no `user-scalable=no`)

---

## 3. Testing Approach

Accessibility is validated at multiple layers:

### 3.1 Automated — Unit/Component Level (jest-axe + Vitest)

Every component and page-level test includes an axe accessibility audit:

```tsx
import { axe, toHaveNoViolations } from 'jest-axe';
expect.extend(toHaveNoViolations);

it('should have no accessibility violations', async () => {
  const { container } = render(<CocktailCard cocktail={mockCocktail} />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

This catches:
- Missing labels on interactive elements
- Missing `alt` text on images
- Incorrect heading hierarchy
- Poor color contrast (where axe can detect it)
- Invalid ARIA usage

### 3.2 Automated — Integration Level (Vitest + jest-axe on full pages)

Full page components (`IndexPage`, `FavoritesPage`) are rendered against the real Zustand store with MSW intercepting API calls, then audited with axe-core. This catches violations that only appear in the context of fully composed page state — heading hierarchy, landmark regions, ARIA on dynamically loaded content.

```ts
it("IndexPage has no axe violations in loaded state", async () => {
  server.use(/* MSW handler returning drinks */);
  const { container } = render(<IndexPage />);
  await waitFor(() => screen.getByRole("list"));
  expect(await axe(container)).toHaveNoViolations();
});
```

### 3.3 Automated — E2E Level (Playwright — real Chromium browser)

End-to-end tests run in Chromium with API calls intercepted via `page.route()`. Accessibility checks at this layer focus on behavioral flows that axe-core cannot detect:

- **Keyboard navigation** — Tab order, Enter/Space activation, Escape to close Modal
- **Focus management** — Modal focus trap, focus on error heading after ErrorBoundary catches, skip link activation in Layout
- **Mobile touch targets** — Viewport-aware assertions for touch target sizes ≥ 44×44px
- **Backdrop interactions** — `touchscreen.tap()` for modal dismiss on narrow viewports

Pages with E2E accessibility coverage:
- Home / browse and search page (`/`)
- Favorites page (`/favorites`)
- Modal overlay (recipe detail, opened from both pages)

### 3.4 Manual Testing

Automated tools catch ~30–40% of accessibility issues. Manual checks are also performed:

| Method | Tool |
|--------|------|
| Screen reader navigation | NVDA (Windows) / VoiceOver (macOS) |
| Keyboard-only navigation | Chrome DevTools + manual tab traversal |
| Color contrast audit | axe DevTools browser extension |
| Zoom test | Browser zoom 200% + 400% |
| Mobile accessibility | Chrome DevTools device emulation |

---

## 4. Known Limitations & Trade-offs

| Issue | Status | Notes |
|-------|--------|-------|
| TheCocktailDB API returns inconsistent ingredient data | Mitigated | Null checks and fallback text applied |
| Skeleton loaders announce nothing to screen readers | Acceptable | `aria-busy` set on parent; content announced when loaded |
| Tailwind's default focus ring may be overridden | Monitored | Custom focus styles defined in global CSS |

---

## 5. Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/TR/WCAG21/)
- [WAI-ARIA Authoring Practices 1.2](https://www.w3.org/WAI/ARIA/apg/)
- [jest-axe documentation](https://github.com/nickcolley/jest-axe)
- [Playwright accessibility testing](https://playwright.dev/docs/accessibility-testing)
- [Tailwind CSS accessibility considerations](https://tailwindcss.com/docs/screen-readers)
