export function safeLink(href) {
  if (typeof href !== 'string') return null;
  try {
    const url = new URL(href);
    return ['http:', 'https:', 'mailto:', 'tel:'].includes(url.protocol) ? href : null;
  } catch {
    return null;
  }
}

