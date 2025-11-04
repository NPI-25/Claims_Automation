export function generateClaimNumber(): string {
  const year = new Date().getFullYear();
  const randomNum = Math.floor(Math.random() * 9000) + 1000;
  return `CLM-${year}-${randomNum}`;
}
