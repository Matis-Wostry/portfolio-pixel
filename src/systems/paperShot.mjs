// Trajectoire d'une boule de papier lancée au panier, découpée en étapes que la scène anime l'une après l'autre.
// Chaque étape va de `from` à `to` en cloche (`height` pixels au-dessus de la ligne droite) et donne sa couche
// d'affichage : 'air' devant tout, 'net' derrière le panier (dans le filet), 'bin' dans la poubelle, 'floor' au sol.

export function arcPoint(from, to, height, t) {
  return {
    x: from.x + (to.x - from.x) * t,
    y: from.y + (to.y - from.y) * t - 4 * height * t * (1 - t),
  };
}

export function planShot(hand, { rim, netBottom, bin, floor, success, flight, fall }, random = Math.random) {
  const made = random() < success;
  // Plus le joueur est loin du mur, plus la cloche est haute ; elle passe toujours au-dessus de l'arceau.
  const height = Math.max(24, (hand.y - rim.y) * 0.5);
  if (made) {
    const above = { x: rim.x, y: rim.y - 1 };
    const out = { x: rim.x, y: netBottom };
    return {
      made,
      steps: [
        { from: hand, to: above, height, duration: flight, layer: 'air', spin: true },
        { from: above, to: out, height: 0, duration: fall * 0.6, layer: 'net', ease: 'Quad.easeIn', sound: 'swish' },
        { from: out, to: bin, height: 0, duration: fall * 0.4, layer: 'bin', vanish: true },
      ],
    };
  }
  const side = random() < 0.5 ? -1 : 1;
  const edge = { x: rim.x + side * rim.halfWidth, y: rim.y };
  // Rebond court : à droite, la boule doit retomber avant le bureau.
  const landing = { x: edge.x + side * 16, y: floor };
  const rest = { x: landing.x + side * 4, y: floor + 10 };
  return {
    made,
    steps: [
      { from: hand, to: edge, height, duration: flight, layer: 'air', spin: true },
      { from: edge, to: landing, height: 14, duration: 520, layer: 'air', spin: true, sound: 'rim' },
      { from: landing, to: rest, height: 5, duration: 300, layer: 'floor', vanish: true },
    ],
  };
}
