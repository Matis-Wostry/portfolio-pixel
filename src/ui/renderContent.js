import { safeLink } from './content.mjs';

export function renderContent(body, content) {
  body.replaceChildren();
  content.paragraphs.forEach((text) => {
    const paragraph = document.createElement('p');
    paragraph.textContent = text;
    body.append(paragraph);
  });
  if (content.cards?.length) {
    const cards = document.createElement('div');
    cards.className = 'portfolio-cards';
    content.cards.forEach((card) => {
      const article = document.createElement('article');
      article.className = 'portfolio-card';
      const title = document.createElement('h2');
      title.textContent = card.title;
      article.append(title);
      if (card.description) {
        const description = document.createElement('p');
        description.textContent = card.description;
        article.append(description);
      }
      if (card.tags?.length) {
        const tags = document.createElement('ul');
        tags.className = 'portfolio-tags';
        card.tags.forEach((tag) => {
          const item = document.createElement('li');
          item.textContent = tag;
          tags.append(item);
        });
        article.append(tags);
      }
      appendLinks(article, card.links ?? []);
      cards.append(article);
    });
    body.append(cards);
  }
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
