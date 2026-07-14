export function CartFooter(totalPrice) {

  return `
    <footer class="cart-footer">

      <div class="cart-footer__row">

        <span>جمع کل</span>

        <strong>
          ${totalPrice.toLocaleString("fa-IR")}
          تومان
        </strong>

      </div>

      <button
        class="btn btn-primary btn-block"
        type="button"
      >
        ادامه خرید
      </button>

    </footer>
  `;

}