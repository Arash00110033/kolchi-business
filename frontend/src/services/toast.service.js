import {createToast} from '../components/feedback/Toast.js'
const TOAST_CONTAINER_ID = "toast-container";

function getToastContainer() {
  let container = document.getElementById(TOAST_CONTAINER_ID);

  if (!container) {
    container = document.createElement("div");

    container.id = TOAST_CONTAINER_ID;
    container.className = "toast-container";

    document.body.appendChild(container);
  }

  return container;
}

export function showToast(message, type = "info", duration = 3000) {
  const container = getToastContainer();

  const toast = createToast({
    message,
    type,
    duration,
  });

  container.appendChild(toast);
}

export function showSuccessToast(message, duration = 3000) {
  showToast(message, "success", duration);
}

export function showErrorToast(message, duration = 4000) {
  showToast(message, "error", duration);
}

export function showWarningToast(message, duration = 3500) {
  showToast(message, "warning", duration);
}

export function showInfoToast(message, duration = 3000) {
  showToast(message, "info", duration);
}