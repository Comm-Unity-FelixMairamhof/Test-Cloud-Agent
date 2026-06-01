---
name: frontend-design
description: Create distinctive, production-grade frontend interfaces with high design quality. Use this skill when building web components, pages, or applications. Generates creative, polished code that avoids generic AI aesthetics.
license: MIT
---

This skill guides creation of distinctive, production-grade frontend interfaces that avoid generic "AI slop" aesthetics. Implement real working code with exceptional attention to aesthetic details and creative choices.

## Design Thinking

Before coding, understand the context and commit to a BOLD aesthetic direction:

- **Purpose**: What problem does this interface solve? Who uses it?
- **Tone**: Pick an extreme (brutally minimal, maximalist chaos, retro-futuristic, organic/natural, luxury/refined, playful, editorial, brutalist, art deco, soft/pastel, industrial, etc.)
- **Constraints**: Technical requirements (framework, performance, accessibility).
- **Differentiation**: What makes this UNFORGETTABLE?

**CRITICAL**: Choose a clear conceptual direction and execute it with precision.

## Frontend Aesthetics Guidelines

- **Typography**: Distinctive display + refined body fonts. Avoid Inter, Roboto, Arial, system defaults.
- **Color & Theme**: Cohesive palette via CSS variables. Dominant colors with sharp accents.
- **Motion**: Purposeful animations; respect `prefers-reduced-motion`. Prefer GPU-friendly `transform` and `opacity`.
- **Spatial Composition**: Asymmetry, overlap, grid-breaking elements, intentional density.
- **Backgrounds**: Atmosphere via gradients, noise, patterns, layered transparency — not flat defaults.

NEVER use generic AI aesthetics: purple gradients on white, Inter/Roboto, cookie-cutter layouts.

## Design Validation Checklist

- WCAG AA contrast (4.5:1 text)
- Responsive: 320px, 768px, 1024px, 1440px
- Keyboard accessible, visible focus, semantic HTML
- `prefers-reduced-motion` honored
- CSS variables for theming

## Project usage (IoT-Wizard)

Login and app surfaces use the **Thermal Sanctuary** direction: deep moss tones, warm amber accents, Fraunces + DM Sans, organic mesh backgrounds, and restrained motion. See `src/app/globals.css` and `src/app/login/`.
