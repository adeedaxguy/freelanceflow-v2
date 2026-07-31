# iCloseLeads Dashboard Design

## Intent

The dashboard is an operational workspace, not a marketing surface. It should help a freelancer understand current activity, choose the next lead workflow, and act without visual noise.

## Visual System

- **Canvas:** quiet neutral gray in light mode; near-black in dark mode.
- **Surfaces:** flat white or charcoal panels with one-pixel borders and minimal shadow.
- **Typography:** system sans, medium-weight display headings, strong tabular numbers, compact supporting text.
- **Primary:** purple for selected controls and important commands.
- **Signal:** lime for positive chart data and high-confidence success cues.
- **Accent:** accessible green for success text and statuses.
- **Shape:** 14px primary panels, round action pills, restrained 8px controls.

## Layout

- Sidebar remains compact and route-focused.
- Active navigation uses maximum contrast: dark ink on light canvas, light ink on dark canvas.
- Overview pairs a 2x2 metric grid with one large analytical panel.
- Quick routes are a compact action row, not a separate nested card.
- Activity lists and onboarding remain below the summary layer.

## Theme Behavior

Light and dark are distinct scenes. Light uses white work surfaces on a warm neutral canvas. Dark uses charcoal work surfaces on a near-black canvas. Purple, green, and lime keep the same semantic jobs in both modes; contrast values change where necessary.

## Interaction Rules

- Inputs must be more prominent than surrounding panels.
- Hover states change border or fill without moving layout.
- Navigation and commands remain reachable on desktop, tablet, and mobile.
- Motion is functional and respects reduced-motion preferences.
- Existing product behavior, permissions, usage limits, and route structure are preserved during visual updates.

