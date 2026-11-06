export class LandscapeSuggestion {
  constructor() {
    this.dismissed = false;
    this.mobilePortrait = false;
  }

  shouldOpen({ width, height, coarsePointer = false }) {
    const valid = Number.isFinite(width) && Number.isFinite(height) && width > 0 && height > 0;
    // Le pointeur compte, pas la largeur seule : une fenêtre de PC en demi-écran n'a pas à être tournée.
    const mobile = coarsePointer && Math.min(width, height) <= 1024;
    this.mobilePortrait = valid && mobile && height > width;
    if (!this.mobilePortrait) this.dismissed = false;
    return this.mobilePortrait && !this.dismissed;
  }

  dismiss() {
    this.dismissed = true;
  }
}
