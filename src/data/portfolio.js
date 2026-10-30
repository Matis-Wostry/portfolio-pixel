// Sources: https://matis-wostry.com/ and its published CV, consulted 2026-10-11.
// These are editable local snapshots, not a live synchronization.
export const PORTFOLIO = {
  // Ouvert dans le terminal de l'ordinateur : un dossier par contexte (`categories`), un projet par carte.
  projets: {
    title: 'Projets',
    paragraphs: ['Des projets en ligne, du site vitrine à l’API, pensés, codés et déployés de bout en bout.'],
    links: [],
    categories: [
      { id: 'pro', title: 'Projets pro', description: 'En entreprise et en freelance.' },
      { id: 'ecole', title: 'Projets école', description: 'Réalisés pendant mes études.' },
      { id: 'perso', title: 'Projets perso', description: 'Pour apprendre et expérimenter.' },
    ],
    cards: [
      {
        id: 'mieuxdisant', category: 'pro', title: 'Le MieuxDisant',
        description: 'Site WordPress conçu sur Figma puis développé pendant mon alternance.', tags: ['WordPress', 'Figma'],
        links: [{ label: 'Site', href: 'https://lemieuxdisant.fr/' }],
      },
      {
        id: 'mb-ventilation', category: 'pro', title: 'MB Ventilation',
        description: 'Site WordPress dédié aux systèmes de ventilation.', tags: ['WordPress'],
        links: [{ label: 'Site', href: 'https://mb-ventilation.fr/' }],
      },
      {
        id: 'mb-home', category: 'pro', title: 'MB Home',
        description: 'Site WordPress dédié au carrelage, au placo et à la démolition.', tags: ['WordPress'],
        links: [{ label: 'Site', href: 'https://mb-home.fr/' }],
      },
      {
        id: 'pokedex', category: 'ecole', title: 'Pokédex',
        description: 'Une API REST documentée avec Swagger et une interface React pour chercher et filtrer les Pokémon.',
        tags: ['React', 'Express', 'MongoDB', 'Swagger'],
        links: [
          { label: 'Code', href: 'https://github.com/Matis-Wostry/Pokedex' },
          { label: 'Démo', href: 'https://pokedex.matis-wostry.com/' },
        ],
      },
      {
        id: 'meteo', category: 'ecole', title: 'Application météo',
        description: 'Prévisions par ville et alertes par email planifiées, en Laravel.', tags: ['Laravel', 'PHP'],
        links: [
          { label: 'Code', href: 'https://github.com/Matis-Wostry/iut-weather' },
          { label: 'Démo', href: 'https://iut-weather.matis-wostry.com/' },
        ],
      },
      {
        id: 'gestion-ecole', category: 'ecole', title: 'Gestion d’école',
        description: 'Application Java pour gérer élèves, livres, UV et inscriptions, avec une base MySQL en JDBC et une interface Swing testée.',
        tags: ['Java', 'MySQL', 'JDBC', 'Swing', 'JUnit'],
        links: [{ label: 'Code', href: 'https://github.com/Matis-Wostry/gestionEcole' }],
      },
      {
        id: 'azteka', category: 'ecole', title: 'Azteka',
        description: 'Intégration responsive de la maquette Figma d’une équipe e-sport.', tags: ['HTML', 'CSS', 'Figma'],
        links: [
          { label: 'Code', href: 'https://github.com/Matis-Wostry/integration-maquette' },
          { label: 'Démo', href: 'https://azteka.matis-wostry.com/' },
          { label: 'Maquette', href: 'https://www.figma.com/design/fiBO5bsAcP9Ks7A0yzx2kl/Azteka-Esports-Team-%7C-Info-%7C-Ecommerce--Community---copie-?node-id=1-6' },
        ],
      },
      {
        id: 'chambre-du-dev', category: 'perso', title: 'La Chambre du Dev',
        description: 'Ce portfolio : une chambre en pixel art à explorer, avec un moteur d’échecs, des sons synthétisés et ce terminal.',
        tags: ['Phaser', 'JavaScript', 'Vite', 'PixelArt', 'WebAudio'],
        links: [{ label: 'Code', href: 'https://github.com/Matis-Wostry/portfolio-pixel' }],
      },
      {
        id: 'articles-ia', category: 'perso', title: 'Articles WordPress',
        description: 'Script Python qui réécrit automatiquement des articles WordPress avec l’API d’OpenAI.', tags: ['Python', 'OpenAI', 'API'],
        links: [{ label: 'Code', href: 'https://github.com/Matis-Wostry/SEO-article' }],
      },
      {
        id: 'usage-limits', category: 'perso', title: 'Usage Limits',
        description: 'Mod pour Claude Code qui affiche ta consommation des limites (session de 5 h et semaine) avec un verdict de rythme.',
        tags: ['TypeScript', 'Claude Code'],
        links: [{ label: 'Code', href: 'https://github.com/Matis-Wostry/usage-limits' }],
      },
    ],
  },
  skills: {
    title: 'Compétences',
    paragraphs: [],
    links: [],
    // Tableau blanc affiché par SkillsBoard : une catégorie par face ; `color` est celle de son aimant.
    board: [
      { title: 'Langages', color: '#97345f', tags: ['HTML', 'CSS', 'SCSS', 'JavaScript', 'TypeScript', 'PHP', 'Python', 'C', 'Java'] },
      { title: 'Frameworks & CMS', color: '#3f4f9e', tags: ['React', 'Vue.js', 'Tailwind CSS', 'DaisyUI', 'Node.js', 'Express', 'Laravel', 'WordPress', 'Phaser'] },
      { title: 'Données & API', color: '#3d8fa3', tags: ['SQL', 'MySQL', 'PostgreSQL', 'SQLite', 'MongoDB', 'Supabase', 'JDBC', 'Drizzle', 'API REST', 'Swagger', 'Postman', 'JWT'] },
      { title: 'DevOps & outils', color: '#63937e', tags: ['Docker', 'Docker Compose', 'Linux', 'WSL', 'Git', 'GitHub', 'GitHub Actions', 'Vite', 'Vitest', 'npm', 'VS Code', 'Nginx', 'SSH / VPS'] },
      { title: 'Design', color: '#d98a3d', tags: ['Figma', 'Photoshop', 'Illustrator', 'Canva', 'Claude Design'] },
      { title: 'SEO & analyse', color: '#8a5fb0', tags: ['Google Analytics', 'Google Tag Manager', 'Search Console', 'SEMrush', 'SE Ranking', 'PageSpeed Insights', 'Lighthouse', 'Yoast SEO', 'Hotjar'] },
      { title: 'IA', color: '#c4562f', tags: ['Claude', 'Claude Code', 'OpenAI'] },
    ],
  },
  // Fiche persona : affichée par renderPersona (portrait, objectifs, curseurs, parcours).
  about: {
    title: 'Présentation',
    paragraphs: [
      'Je suis Matis Wostry, développeur full-stack junior et étudiant à CREA Genève.',
      'Je recherche une alternance d’un an à Genève, à partir de septembre 2027.',
    ],
    persona: {
      name: 'Matis Wostry',
      role: 'Développeur full-stack junior',
      facts: [
        { label: 'Base', value: 'Genève' },
        { label: 'Études', value: 'Bachelor Développement web & IA · CREA' },
        { label: 'Statut', value: 'Cherche une alternance d’un an dès sept. 2027' },
      ],
      goals: [
        'Décrocher une alternance d’un an à partir de septembre 2027 à Genève',
        'Monter en compétence sur le web et l’IA',
        'Créer des projets qui aident le plus possible au quotidien',
      ],
      motivations: [
        'Automatiser ce qui se répète',
        'Apprendre en construisant',
        'Faire beaucoup de projets',
      ],
      frustrations: [
        'Les tâches répétitives faites à la main',
        'Un projet qui reste sur mon ordinateur',
      ],
      // Qualités appuyées chacune par une preuve tirée des projets.
      workStyle: [
        { quality: 'Autonome', proof: 'En freelance, et en apprenant seul certaines compétences.' },
        { quality: 'Curieux', proof: 'Toujours un œil sur les tendances de l’univers du développement.' },
        { quality: 'Concret', proof: 'Mon but : créer des outils utiles à mon quotidien, qui me facilitent certaines tâches.' },
        { quality: 'Polyvalent', proof: 'Mes différentes formations me donnent plusieurs casquettes.' },
      ],
      // Du plus ancien au plus récent ; `kind` distingue les études ('etudes') de l'expérience ('pro').
      timeline: [
        { period: '2022–2025', kind: 'etudes', title: 'BUT MMI', place: 'IUT Dijon-Auxerre' },
        { period: '2024–2025', kind: 'pro', title: 'Alternance · Le MieuxDisant', place: 'Intégrateur web' },
        { period: '2025–2027', kind: 'pro', title: 'Freelance', place: 'Développeur et SEO' },
        { period: '2025–2028', kind: 'etudes', title: 'Bachelor Développement web & IA', place: 'CREA Genève' },
        { period: '2026–2027', kind: 'pro', title: 'Alternance · Octoplus Solutions', place: 'Développeur full-stack junior' },
      ],
      // `icon` : image dans public/assets/interface/.
      hobbies: [
        { label: 'Basket', icon: 'hobbies/basket.png' },
        { label: 'Échecs', icon: 'icones/echecs.png' },
        { label: 'Jeux vidéo', icon: 'hobbies/jeux-video.png' },
        { label: 'Mangas', icon: 'hobbies/mangas.png' },
      ],
    },
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
