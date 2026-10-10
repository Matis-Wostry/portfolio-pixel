// Sources: https://matis-wostry.com/ and its published CV, consulted 2026-10-11.
// These are editable local snapshots, not a live synchronization.
export const PORTFOLIO = {
  projets: {
    title: 'Projets',
    paragraphs: ['Quelques réalisations web et outils d’automatisation.'],
    links: [],
    cards: [
      {
        id: 'weather', title: 'Application météo', description: 'Prévisions et notifications email.', tags: ['Laravel', 'PHP'],
        links: [
          { label: 'Code', href: 'https://github.com/Matis-Wostry/iut-weather' },
          { label: 'Démo', href: 'https://iut-weather.matis-wostry.com/' },
        ],
      },
      {
        id: 'pokedex', title: 'Pokédex', description: 'Recherche et filtres de Pokémon.', tags: ['React', 'Express', 'MongoDB', 'Swagger'],
        links: [
          { label: 'Code', href: 'https://github.com/Matis-Wostry/Pokedex' },
          { label: 'Démo', href: 'https://pokedex.matis-wostry.com/' },
        ],
      },
      {
        id: 'portfolio', title: 'Portfolio personnel', description: 'Site déployé sur mon serveur.', tags: ['HTML', 'CSS', 'JavaScript', 'CI/CD'],
        links: [
          { label: 'Code', href: 'https://github.com/Matis-Wostry/cv' },
          { label: 'Site', href: 'https://matis-wostry.com/' },
        ],
      },
      {
        id: 'wordpress-tool', title: 'Articles WordPress', description: 'Réécriture automatisée avec OpenAI.', tags: ['Python', 'API'],
        links: [{ label: 'Code', href: 'https://github.com/Matis-Wostry/SEO-article' }],
      },
      {
        id: 'azteka', title: 'Azteka', description: 'Intégration d’une maquette e-sport.', tags: ['HTML', 'CSS', 'Figma'],
        links: [
          { label: 'Code', href: 'https://github.com/Matis-Wostry/integration-maquette' },
          { label: 'Démo', href: 'https://azteka.matis-wostry.com/' },
          { label: 'Maquette', href: 'https://www.figma.com/design/fiBO5bsAcP9Ks7A0yzx2kl/Azteka-Esports-Team-%7C-Info-%7C-Ecommerce--Community---copie-?node-id=1-6' },
        ],
      },
      {
        id: 'mieuxdisant', title: 'Le MieuxDisant', description: 'Site réalisé pendant mon alternance.', tags: ['WordPress', 'Figma'],
        links: [{ label: 'Site', href: 'https://lemieuxdisant.fr/' }],
      },
    ],
  },
  skills: {
    title: 'Compétences',
    paragraphs: ['Du développement à la mise en ligne.'],
    links: [],
    cards: [
      { title: 'Langages', tags: ['HTML', 'CSS', 'JavaScript', 'PHP', 'SQL', 'Python', 'C', 'Java'] },
      { title: 'Frameworks & CMS', tags: ['React', 'Laravel', 'Node.js', 'WordPress'] },
      { title: 'Infrastructure', tags: ['API REST', 'MySQL', 'MongoDB', 'Docker', 'Linux', 'Git', 'GitHub'] },
      { title: 'Design & SEO', tags: ['Figma', 'Photoshop', 'Illustrator', 'Canva', 'Analytics', 'Search Console', 'SEMrush'] },
    ],
  },
  about: {
    title: 'Présentation',
    paragraphs: [
      'Je suis Matis Wostry, développeur full-stack junior et étudiant à CREA Genève.',
      'Je recherche une alternance de deux ans à Genève.',
    ],
    cards: [
      { title: 'Bachelor Web & IA', description: 'CREA Genève · 2025–2028' },
      { title: 'BUT MMI', description: 'IUT Dijon-Auxerre · 2022–2025' },
      { title: 'Le MieuxDisant', description: 'WordPress en alternance, puis SEO en freelance.' },
      { title: 'Hors du clavier', tags: ['Basket', 'Jeux vidéo', 'Mangas', 'Échecs'] },
    ],
    links: [{ label: 'CV (PDF)', href: 'https://matis-wostry.com/assets/cv/CV_Matis_Wostry.pdf' }],
  },
  contact: {
    title: 'Contact',
    paragraphs: ['Discutons d’un projet ou d’une alternance.', '+33 6 34 89 62 32'],
    links: [
      { label: 'Email', href: 'mailto:matis.wostry@crea-inseec.com' },
      { label: 'LinkedIn', href: 'https://www.linkedin.com/in/matis-wostry/' },
      { label: 'GitHub', href: 'https://github.com/Matis-Wostry' },
      { label: 'CV (PDF)', href: 'https://matis-wostry.com/assets/cv/CV_Matis_Wostry.pdf' },
    ],
  },
};
