
export function randomId (prefix) {
  const num = parseInt(Math.random() * 1000, 10);
  return `${prefix}_${num}`;
}
