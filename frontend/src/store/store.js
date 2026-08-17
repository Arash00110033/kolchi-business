/* =========================
   INITIAL STATE
========================= */

const initialState = {
  query: "",
  category: "all",
  brand: "all",
  sort: "default",

  cart: [],

  isCartOpen: false,

  selectedProduct: null,
  isProductModalOpen: false,

  wishlist: [],

  compare: [],

  user: null
};


/* =========================
   PERSISTENCE
========================= */

const STORAGE_KEY =
  "kolchi-business-state";


function loadPersistedState() {

  try {

    const savedState =
      localStorage.getItem(STORAGE_KEY);

    if (!savedState) {

      return structuredClone(initialState);

    }

    const parsedState =
      JSON.parse(savedState);


    return {

      ...structuredClone(initialState),

      cart: Array.isArray(parsedState.cart)
        ? parsedState.cart
        : [],

      wishlist: Array.isArray(parsedState.wishlist)
        ? parsedState.wishlist
        : [],

      compare: Array.isArray(parsedState.compare)
        ? parsedState.compare
        : [],

      user: parsedState.user ?? null

    };

  } catch (error) {

    console.warn(
      "Failed to load persisted state:",
      error
    );

    return structuredClone(initialState);

  }

}


/* =========================
   INTERNAL STATE
========================= */

let state =
  loadPersistedState();

const listeners =
  new Set();


/* =========================
   GET STATE (READ ONLY)
========================= */

export function getState() {

  return state;

}


/* =========================
   RESET STATE
========================= */

export function resetState() {

  state =
    structuredClone(initialState);

  notify();

}


/* =========================
   DISPATCH (CORE ENGINE)
   - action based update
========================= */

export function dispatch(action) {

  if (!action || !action.type) {

    console.warn(
      "Invalid action"
    );

    return;

  }


  switch (action.type) {


    /* ---------- UI STATE ---------- */

    case "SET_QUERY":

      state = {

        ...state,

        query: action.payload

      };

      break;


    case "SET_CATEGORY":

      state = {

        ...state,

        category: action.payload

      };

      break;


    case "SET_BRAND":

      state = {

        ...state,

        brand: action.payload

      };

      break;


    case "SET_SORT":

      state = {

        ...state,

        sort: action.payload

      };

      break;


    /* ---------- WISHLIST ---------- */

    case "TOGGLE_WISHLIST": {

      const id =
        action.payload;


      const isInWishlist =
        state.wishlist.includes(id);


      state = {

        ...state,

        wishlist: isInWishlist

          ? state.wishlist.filter(

              productId =>
                productId !== id

            )

          : [

              ...state.wishlist,

              id

            ]

      };


      break;

    }


    /* ---------- CART ---------- */

    case "ADD_TO_CART": {

      const id =
        action.payload;


      const existing =
        state.cart.find(

          item =>
            item.id === id

        );


      if (existing) {

        state = {

          ...state,

          cart: state.cart.map(

            item =>

              item.id === id

                ? {

                    ...item,

                    qty: item.qty + 1

                  }

                : item

          )

        };

      } else {

        state = {

          ...state,

          cart: [

            ...state.cart,

            {

              id,

              qty: 1

            }

          ]

        };

      }


      break;

    }


    case "UPDATE_CART_ITEM_QTY": {

      const {

        id,

        qty

      } = action.payload;


      state = {

        ...state,

        cart: state.cart.map(

          item =>

            item.id === id

              ? {

                  ...item,

                  qty

                }

              : item

        )

      };


      break;

    }


    case "REMOVE_FROM_CART": {

      const id =
        action.payload;


      state = {

        ...state,

        cart: state.cart.filter(

          item =>
            item.id !== id

        )

      };


      break;

    }


    case "CLEAR_CART":

      state = {

        ...state,

        cart: []

      };

      break;


    /* ---------- CART DRAWER ---------- */

    case "TOGGLE_CART":

      state = {

        ...state,

        isCartOpen:
          !state.isCartOpen

      };

      break;


    case "CLOSE_CART":

      state = {

        ...state,

        isCartOpen: false

      };

      break;


    /* ---------- PRODUCT MODAL ---------- */

    case "OPEN_PRODUCT_MODAL":

      state = {

        ...state,

        selectedProduct:
          action.payload,

        isProductModalOpen:
          true

      };

      break;


    case "CLOSE_PRODUCT_MODAL":

      state = {

        ...state,

        selectedProduct:
          null,

        isProductModalOpen:
          false

      };

      break;


    /* ---------- USER ---------- */

    case "SET_USER":

      state = {

        ...state,

        user:
          action.payload

      };

      break;


    /* ---------- UNKNOWN ACTION ---------- */

    default:

      console.warn(

        `Unknown action type: ${action.type}`

      );

      return;

  }


  notify();

}


/* =========================
   SUBSCRIBE SYSTEM
========================= */

export function subscribe(listener) {

  listeners.add(listener);


  // return unsubscribe function

  return () =>
    listeners.delete(listener);

}


/* =========================
   PERSIST STATE
========================= */

function persistState() {

  try {

    const persistedState = {

      cart:
        state.cart,

      wishlist:
        state.wishlist,

      compare:
        state.compare,

      user:
        state.user

    };


    localStorage.setItem(

      STORAGE_KEY,

      JSON.stringify(
        persistedState
      )

    );

  } catch (error) {

    console.warn(

      "Failed to persist state:",

      error

    );

  }

}


/* =========================
   NOTIFY RENDERERS
========================= */

function notify() {


  persistState();


  listeners.forEach(

    listener =>
      listener(state)

  );

}


/* =========================
   ACTION HELPERS
========================= */

export const actions = {


  /* ---------- SEARCH ---------- */

  setQuery: (value) =>

    dispatch({

      type:
        "SET_QUERY",

      payload:
        value

    }),


  /* ---------- FILTERS ---------- */

  setCategory: (value) =>

    dispatch({

      type:
        "SET_CATEGORY",

      payload:
        value

    }),


  setBrand: (value) =>

    dispatch({

      type:
        "SET_BRAND",

      payload:
        value

    }),


  /* ---------- SORT ---------- */

  setSort: (value) =>

    dispatch({

      type:
        "SET_SORT",

      payload:
        value

    }),


  /* ---------- CART ---------- */

  addToCart: (id) =>

    dispatch({

      type:
        "ADD_TO_CART",

      payload:
        id

    }),


  updateCartItemQty: (id, qty) =>

    dispatch({

      type:
        "UPDATE_CART_ITEM_QTY",

      payload: {

        id,

        qty

      }

    }),


  removeFromCart: (id) =>

    dispatch({

      type:
        "REMOVE_FROM_CART",

      payload:
        id

    }),


  clearCart: () =>

    dispatch({

      type:
        "CLEAR_CART"

    }),


  /* ---------- CART DRAWER ---------- */

  toggleCart: () =>

    dispatch({

      type:
        "TOGGLE_CART"

    }),


  closeCart: () =>

    dispatch({

      type:
        "CLOSE_CART"

    }),


  /* ---------- PRODUCT MODAL ---------- */

  openProductModal: (product) =>

    dispatch({

      type:
        "OPEN_PRODUCT_MODAL",

      payload:
        product

    }),


  closeProductModal: () =>

    dispatch({

      type:
        "CLOSE_PRODUCT_MODAL"

    }),


  /* ---------- WISHLIST ---------- */

  toggleWishlist: (id) =>

    dispatch({

      type:
        "TOGGLE_WISHLIST",

      payload:
        id

    }),


  /* ---------- USER ---------- */

  setUser: (user) =>

    dispatch({

      type:
        "SET_USER",

      payload:
        user

    })

};
