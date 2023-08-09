export function randNumber(max: number, min?: number) {
  return Math.floor(Math.random() * max) + (min || 0);
}
