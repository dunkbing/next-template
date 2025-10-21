"use client";

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  type ReactNode,
} from "react";

export type CartLine = {
  id: string;
  variantId: number;
  productName: string;
  variantName: string;
  sku: string;
  qty: number;
  price: number;
  discount: number;
  tax: number;
};

type CartState = {
  lines: CartLine[];
};

type CartAction =
  | { type: "ADD"; payload: Omit<CartLine, "id"> }
  | { type: "UPDATE_QTY"; id: string; qty: number }
  | { type: "UPDATE_DISCOUNT"; id: string; discount: number }
  | { type: "REMOVE"; id: string }
  | { type: "CLEAR" }
  | { type: "LOAD"; lines: CartLine[] };

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD": {
      const newLine: CartLine = {
        ...action.payload,
        id: crypto.randomUUID(),
      };
      return { lines: [...state.lines, newLine] };
    }
    case "UPDATE_QTY": {
      return {
        lines: state.lines.map((line) =>
          line.id === action.id ? { ...line, qty: action.qty } : line,
        ),
      };
    }
    case "UPDATE_DISCOUNT": {
      return {
        lines: state.lines.map((line) =>
          line.id === action.id ? { ...line, discount: action.discount } : line,
        ),
      };
    }
    case "REMOVE": {
      return { lines: state.lines.filter((l) => l.id !== action.id) };
    }
    case "CLEAR": {
      return { lines: [] };
    }
    case "LOAD": {
      return { lines: action.lines };
    }
    default:
      return state;
  }
}

type CartContextType = {
  state: CartState;
  dispatch: React.Dispatch<CartAction>;
  subtotal: number;
  taxTotal: number;
  discountTotal: number;
  total: number;
};

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { lines: [] });

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("pos-cart");
    if (saved) {
      try {
        const lines = JSON.parse(saved);
        dispatch({ type: "LOAD", lines });
      } catch (error) {
        console.error("Failed to load cart:", error);
      }
    }
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    localStorage.setItem("pos-cart", JSON.stringify(state.lines));
  }, [state.lines]);

  // Calculate totals
  const subtotal = state.lines.reduce(
    (sum, line) => sum + line.qty * line.price,
    0,
  );
  const discountTotal = state.lines.reduce(
    (sum, line) => sum + line.discount,
    0,
  );
  const taxTotal = state.lines.reduce((sum, line) => sum + line.tax, 0);
  const total = subtotal - discountTotal + taxTotal;

  return (
    <CartContext.Provider
      value={{ state, dispatch, subtotal, taxTotal, discountTotal, total }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}
