# TradeGuard UI implementation notes

These notes preserve the agreed design direction for the separate TradeGuard application.

## Shared header

- Keep the TradeGuard logo intact at the left and link it to the TradeGuard home.
- Use one compact sticky header across User Guide, Document Assessment, Methodology, Privacy, and About and Security.
- Keep `Request Pilot` as the right-side primary action.
- On mobile, collapse the links into a menu while keeping the logo and the primary action visible.
- Mark the active page clearly and keep the header spacing consistent across all TradeGuard pages.

## Background treatment

- Keep the Deloitte / EY / KPMG-inspired institutional base: warm white or very light grey with navy, royal blue and teal accents.
- Add only restrained multicolour ambient light: soft blue, teal and muted-gold glows at roughly 4–8% opacity with broad blur.
- Place glows in large white-space areas, corners and section transitions—not behind important text or controls.
- Avoid rainbow gradients, strong animation, excessive glassmorphism or visual noise.
- Preserve generous white space, high contrast and mobile readability.

The current package includes the main RegTech Nexus AI website update. Apply these notes to the current TradeGuard source bundle when it is available; do not merge the two deployments blindly.
