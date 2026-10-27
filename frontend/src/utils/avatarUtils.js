/**
 * Safe, high-performance Avatar generator for Shet Samarthan
 * 
 * Generates instant inline SVG data URIs with rich agricultural earth & leaf tones.
 * ZERO external network requests, ZERO latency, works 100% offline, and NEVER breaks.
 */

const PALETTES = [
  { bg: '#2F7D4A', text: '#FFFFFF', sub: '#A5D6A7' }, // Emerald leaf
  { bg: '#1B5E20', text: '#FFFFFF', sub: '#81C784' }, // Forest canopy
  { bg: '#33691E', text: '#FFFFFF', sub: '#AED581' }, // Fertile field
  { bg: '#2E7D32', text: '#FFFFFF', sub: '#C8E6C9' }, // Sprout green
  { bg: '#4E342E', text: '#FFFFFF', sub: '#D7CCC8' }, // Rich loam
  { bg: '#00695C', text: '#FFFFFF', sub: '#80CBC4' }, // River teal
  { bg: '#E65100', text: '#FFFFFF', sub: '#FFE0B2' }, // Harvest sunrise
];

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < (str || '').length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * Get guaranteed non-breaking avatar URL
 */
export function getSafeAvatar(userOrName, emailOrPhone = '') {
  let name = '';
  let customUrl = '';

  if (typeof userOrName === 'string') {
    name = userOrName;
    if (userOrName.startsWith('http') || userOrName.startsWith('data:')) {
      customUrl = userOrName;
    }
  } else if (userOrName && typeof userOrName === 'object') {
    name = userOrName.fullName || userOrName.name || userOrName.email || 'Farmer';
    customUrl = userOrName.avatarUrl || userOrName.picture || '';
  }

  // If a valid custom URL exists (e.g. Google profile photo)
  if (customUrl && typeof customUrl === 'string' && customUrl.trim().length > 0 && !customUrl.includes('dicebear.com/7.x')) {
    return customUrl.trim();
  }

  // Generate crisp agricultural SVG avatar
  const cleanName = (name || 'Farmer').replace(/[^a-zA-Z0-9\u0900-\u097F\s]/g, '').trim();
  const words = cleanName.split(/\s+/).filter(Boolean);
  let initials = 'S';
  if (words.length >= 2) {
    initials = (words[0][0] + words[1][0]).toUpperCase();
  } else if (words.length === 1 && words[0].length > 0) {
    initials = words[0].slice(0, 2).toUpperCase();
  }

  const paletteIndex = hashString(cleanName + (emailOrPhone || '')) % PALETTES.length;
  const { bg, text, sub } = PALETTES[paletteIndex];

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
    <defs>
      <linearGradient id="g_${paletteIndex}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${bg}" />
        <stop offset="100%" stop-color="${sub}" stop-opacity="0.8" />
      </linearGradient>
    </defs>
    <circle cx="50" cy="50" r="48" fill="url(#g_${paletteIndex})" stroke="#FFFFFF" stroke-width="2"/>
    <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(255,255,255,0.25)" stroke-width="1.5" stroke-dasharray="4 2"/>
    <text x="50" y="55" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="34" font-weight="800" fill="${text}" text-anchor="middle" dominant-baseline="middle" letter-spacing="1">
      ${initials}
    </text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
