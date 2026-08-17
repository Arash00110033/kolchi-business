export function $(selector) {
  return document.querySelector(selector);
}

export function $all(selector) {
  return [...document.querySelectorAll(selector)];
}

export function setHTML(selector, html) {
  const element = $(selector);

  if (!element) return;

  element.innerHTML = html;
}

export function create(html) {
  const template = document.createElement("template");

  template.innerHTML = html.trim();

  return template.content.firstElementChild;
}