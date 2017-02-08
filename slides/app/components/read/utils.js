
export function findId (prefix, dom) {
  const all = dom.ownerDocument.querySelectorAll(dom.tagName);
  const num = [].slice.call(all).indexOf(dom);
  return `${prefix}_${num}`;
}
