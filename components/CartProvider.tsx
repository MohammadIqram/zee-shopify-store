'use client';

import { createContext, useContext, useSyncExternalStore, type ReactNode } from 'react';

export interface CartItem {
  variantId: string;
  productId: string;
  title: string;
  variantTitle: string;
  price: string;
  currencyCode: string;
  imageUrl?: string;
  imageAlt?: string;
  compareAtPrice?: string;
  quantity: number;
}

interface AddCartItem {
  variantId: string;
  productId: string;
  title: string;
  variantTitle: string;
  price: string;
  currencyCode: string;
  imageUrl?: string;
  imageAlt?: string;
  compareAtPrice?: string;
}

interface CartContextValue {
  items: CartItem[];
  itemCount: number;
  addItem: (item: AddCartItem, quantity?: number) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  removeItem: (variantId: string) => void;
}

const CartContext = createContext<CartContextValue | null>(null);
const storageKey = 'urbanplant-cart';
let cartItems: CartItem[] = [];
let hasLoadedCart = false;
const listeners = new Set<() => void>();
const emptyCart: CartItem[] = [];

function getItems() {
  if (typeof window === 'undefined') return [];
  if (!hasLoadedCart) {
    const savedCart = window.localStorage.getItem(storageKey);
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart) as CartItem[];
        if (Array.isArray(parsedCart)) cartItems = parsedCart;
      } catch {
        window.localStorage.removeItem(storageKey);
      }
    }
    hasLoadedCart = true;
  }
  return cartItems;
}

function updateItems(nextItems: CartItem[]) {
  cartItems = nextItems;
  window.localStorage.setItem(storageKey, JSON.stringify(cartItems));
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function CartProvider({ children }: { children: ReactNode }) {
  const items = useSyncExternalStore(subscribe, getItems, () => emptyCart);

  const addItem = (item: AddCartItem, quantity = 1) => {
    const existingItem = items.find(({ variantId }) => variantId === item.variantId);
    if (existingItem) {
      updateItems(items.map((cartItem) => cartItem.variantId === item.variantId
        ? { ...cartItem, quantity: cartItem.quantity + quantity }
        : cartItem));
      return;
    }
    updateItems([...items, { ...item, quantity }]);
  };

  const updateQuantity = (variantId: string, quantity: number) => {
    if (quantity <= 0) {
      updateItems(items.filter((item) => item.variantId !== variantId));
      return;
    }
    updateItems(items.map((item) => item.variantId === variantId ? { ...item, quantity } : item));
  };

  const removeItem = (variantId: string) => {
    updateItems(items.filter((item) => item.variantId !== variantId));
  };

  return (
    <CartContext.Provider value={{ items, itemCount: items.reduce((total, item) => total + item.quantity, 0), addItem, updateQuantity, removeItem }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
}
