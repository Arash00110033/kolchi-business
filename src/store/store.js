/* =========================
   INITIAL STATE
========================= */

const initialState = {
  query: "",
  category: "all",
  brand: "all",
  sort:"default",
  cart: [],
  isCartOpen: false,
  wishlist: [],
  compare: [],

  user: null
};

/* =========================
   INTERNAL STATE
========================= */

let state = structuredClone(initialState);
const listeners = new Set();

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
  state = structuredClone(initialState);
  notify();
}

/* =========================
   DISPATCH (CORE ENGINE)
   - action based update
========================= */

export function dispatch(action) {
  if (!action || !action.type) {
    console.warn("Invalid action");
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
    /* ---------- CART ---------- */
    case "ADD_TO_CART": {
      const id = action.payload;

      const existing = state.cart.find(i => i.id === id);

      if (existing) {
        existing.qty += 1;
      } else {
        state.cart = [...state.cart, { id, qty: 1 }];
      }
      break;
    }
    case "UPDATE_CART_ITEM_QTY": {
      const { id, qty} = action.payload;

      state = {
        ...state,
        cart: state.cart.map(item =>
          item.id === id
            ? { ...item,qty }
            : item
        )
      };

      break;
    }

    case "REMOVE_FROM_CART": {
      const id = action.payload;
      state.cart = state.cart.filter(i => i.id !== id);
      break;
    }

    case "CLEAR_CART":
      state.cart = [];
      break;
    
      /* ---------- CART DRAWER ---------- */

    case "TOGGLE_CART":
      state = {
        ...state,
       isCartOpen: !state.isCartOpen
       };
    break;
case "CLOSE_CART":
  state = {
    ...state,
    isCartOpen: false
  };
  break;
    /* ---------- USER ---------- */
    case "SET_USER":
      state = {
        ...state,
        user: action.payload
      };
      break;

    default:
      console.warn(`Unknown action type: ${action.type}`);
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
  return () => listeners.delete(listener);
}

/* =========================
   NOTIFY RENDERERS
========================= */

function notify() {
  listeners.forEach(listener => listener(state));
}

/* =========================
   HELPERS (optional future use)
========================= */

export const actions = {
  setQuery: (value) => dispatch({ type: "SET_QUERY", payload: value }),
  setCategory: (value) => dispatch({ type: "SET_CATEGORY", payload: value }),
  setBrand: (value) => dispatch({ type: "SET_BRAND", payload: value }),
  setSort: (valiu) =>
    dispatch({
      type: "SET_SORT",
      payload: valiu
    }),
  addToCart: (id) => dispatch({ type: "ADD_TO_CART", payload: id }),
  updateCartItemQty: (id, qty) => dispatch({type: "UPDATE_CART_ITEM_QTY", payload: {id,qty}}),
  removeFromCart: (id) => dispatch({ type: "REMOVE_FROM_CART", payload: id }),
  clearCart: () => dispatch({ type: "CLEAR_CART" }),
  toggleCart: () =>
    dispatch({
      type: "TOGGLE_CART"
   }),

  closeCart: () =>
    dispatch({
      type: "CLOSE_CART"
   }),
  setUser: (user) => dispatch({ type: "SET_USER", payload: user })
};