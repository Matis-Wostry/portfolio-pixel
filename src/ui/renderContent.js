import { safeLink } from './content.mjs';

export function renderContent(body, content) {
  body.replaceChildren();
  content.paragraphs.forEach((text) => {
    const paragraph = document.createElement('p');
    paragraph.textContent = text;
    body.append(paragraph);
  });
  appendLinks(body, content.links ?? []);
}

export function appendLinks(parent, links) {
  const group = document.createElement('div');
  group.className = 'portfolio-links';
  links.forEach(({ label, href }) => {
    const destination = safeLink(href);
    if (!destination) return;
    const link = document.createElement('a');
    link.textContent = label;
    link.href = destination;
    if (/^https?:/i.test(destination)) {
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
    }
    group.append(link);
  });
  if (group.childElementCount) parent.append(group);
}
