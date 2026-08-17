export function createToast({
  message,
  type = "info",
  duration = 3000,
}) {

  const toast = document.createElement("div");


  toast.className =
    `toast toast--${type}`;


  const icons = {

    success: "✓",

    error: "×",

    warning: "!",

    info: "i"

  };


  toast.innerHTML = `

    <div class="toast__icon">

      ${icons[type] ?? icons.info}

    </div>


    <div class="toast__content">

      <span class="toast__message">

        ${message}

      </span>


      <div class="toast__progress">

      </div>

    </div>

  `;



  requestAnimationFrame(() => {

    toast.classList.add("is-visible");

  });



  const progress =
    toast.querySelector(".toast__progress");


  if (progress) {

    progress.style.animationDuration =
      `${duration}ms`;

  }



  setTimeout(() => {

    toast.classList.remove(
      "is-visible"
    );


    setTimeout(() => {

      toast.remove();

    }, 300);


  }, duration);



  return toast;

}