export function createToast({
  message,
  type = "info",
  duration = 3000,
}) {
  const toast = document.createElement("div");

  toast.className = `toast toast--${type}`;

  toast.innerHTML = `
    <span class="toast__message">
      ${message}
    </span>
  `;

  requestAnimationFrame(() => {
    toast.classList.add("is-visible");
  });

  setTimeout(() => {
    toast.classList.remove("is-visible");

    setTimeout(() => {
      toast.remove();
    }, 300);
  }, duration);

  return toast;
}