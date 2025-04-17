export function createStyledElement(tag, classes, content) {
  const el = document.createElement(tag);
  el.className = classes;
  el.textContent = content;
  return el.outerHTML;
}
