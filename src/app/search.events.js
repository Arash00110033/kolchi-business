/* ==================================================
   SEARCH EVENTS
================================================== */

import { actions } from "../store/store.js";


let searchDebounceTimer = null;


export function bindSearchEvents() {


  document.addEventListener(
    "input",
    (event) => {


      if (
        event.target.id !== "search"
      ) {

        return;

      }


      clearTimeout(
        searchDebounceTimer
      );


      const value =
        event.target.value;


      searchDebounceTimer =
        setTimeout(
          () => {

            actions.setQuery(
              value
            );

          },
          300
        );

    }
  );


}