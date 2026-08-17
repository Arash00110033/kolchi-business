/* ==================================================
   FILTER EVENTS
================================================== */

import { actions } from "../store/store.js";


export function bindFilterEvents() {


  document.addEventListener(
    "change",
    (event) => {


      /* =========================
         CATEGORY
      ========================= */

      if (
        event.target.id === "category"
      ) {

        actions.setCategory(
          event.target.value
        );

        return;

      }


      /* =========================
         BRAND
      ========================= */

      if (
        event.target.id === "brand"
      ) {

        actions.setBrand(
          event.target.value
        );

        return;

      }


      /* =========================
         SORT
      ========================= */

      if (
        event.target.id === "sort"
      ) {

        actions.setSort(
          event.target.value
        );

      }

    }
  );


}