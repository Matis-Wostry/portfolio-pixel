export class LandscapeSuggestion {
  constructor() {
    this.dismissed = false;
    this.mobilePortrait = false;
  }

  shouldOpen({ width, height, coarsePointer = false }) {
    const valid = Number.isFinite(width) && Number.isFinite(height) && width > 0 && height > 0;
    const mobile = width <= 760 || (coarsePointer && Math.min(width, height) <= 1024);
    this.mobilePortrait = valid && mobile && height > width;
    if (!this.mobilePortrait) this.dismissed = false;
    return this.mobilePortrait && !this.dismissed;
  }

  dismiss() {
    this.dismissed = true;
  }
}
