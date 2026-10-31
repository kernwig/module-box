/**
 * The Module Box icon: a card pulled up from an open card file box, with the
 * eight dancers of a squared set on the card. Drawn on Obsidian's 100x100
 * custom-icon grid in currentColor so it follows the theme like Lucide icons.
 */
export const ICON_ID = "module-box";

export const ICON_SVG = `
<g fill="none" stroke="currentColor" stroke-width="6" stroke-linecap="round" stroke-linejoin="round">
  <path d="M18 50 V28 Q18 24 22 24 H34"/>
  <path d="M40 50 V12 Q40 8 44 8 H76 Q80 8 80 12 V50"/>
  <path d="M8 50 H92 V84 Q92 90 86 90 H14 Q8 90 8 84 Z"/>
</g>
<g fill="currentColor" stroke="none">
  <circle cx="55.5" cy="42" r="2.6"/><circle cx="64.5" cy="42" r="2.6"/>
  <circle cx="73" cy="33.5" r="2.6"/><circle cx="73" cy="24.5" r="2.6"/>
  <circle cx="64.5" cy="16" r="2.6"/><circle cx="55.5" cy="16" r="2.6"/>
  <circle cx="47" cy="24.5" r="2.6"/><circle cx="47" cy="33.5" r="2.6"/>
</g>`;
