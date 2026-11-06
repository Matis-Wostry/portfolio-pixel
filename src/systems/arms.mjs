// Un bras passe derrière un meuble seulement si le joueur est au-dessus de son empreinte (`top`),
// dans la même colonne et assez près pour que le bas du bras atteigne le haut de son image (`imageTop`) :
// un meuble situé bien plus bas dans la chambre ne compte pas.
export function armsBehindFurniture(rects, { from, to, feet, armsBottom }) {
  return rects.some(({ left, right, top, imageTop }) => from < right && to > left && feet <= top + 0.5 && armsBottom > imageTop);
}
