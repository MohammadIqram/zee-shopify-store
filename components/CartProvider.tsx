'use client';

import { createContext, useContext, useRef, useState, useSyncExternalStore, type ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Check, ShoppingBag, X } from 'lucide-react';

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
  toast: ToastState | null;
  closeToast: () => void;
}

interface ToastState {
  title: string;
  imageUrl?: string;
  quantity: number;
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
  const [toast, setToast] = useState<ToastState | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const triggerToast = (title: string, imageUrl?: string, quantity = 1) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ title, imageUrl, quantity });
    toastTimerRef.current = setTimeout(() => {
      setToast(null);
    }, 3800);
  };

  const closeToast = () => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast(null);
  };

  const addItem = (item: AddCartItem, quantity = 1) => {
    const existingItem = items.find(({ variantId }) => variantId === item.variantId);
    if (existingItem) {
      updateItems(items.map((cartItem) => cartItem.variantId === item.variantId
        ? { ...cartItem, quantity: cartItem.quantity + quantity }
        : cartItem));
    } else {
      updateItems([...items, { ...item, quantity }]);
    }
    triggerToast(item.title, item.imageUrl, quantity);
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
    <CartContext.Provider value={{ items, itemCount: items.reduce((total, item) => total + item.quantity, 0), addItem, updateQuantity, removeItem, toast, closeToast }}>
      {children}
      
      {/* Global Add to Cart Toast Notification */}
      {toast && (
        <div 
          role="status" 
          aria-live="polite"
          className="fixed bottom-6 right-6 z-[9999] flex w-[min(380px,calc(100vw-32px))] items-center gap-3.5 rounded-xl border border-[#3F6B45] bg-[#183D2B] p-4 text-[#F5F2E9] shadow-2xl backdrop-blur-md transition-all duration-300 animate-in fade-in slide-in-from-bottom-5"
        >
          {/* Checkmark Icon */}
          <div className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-[#3F6B45] text-[#B59A5A]">
            <Check className="h-5 w-5 stroke-[2.5]" />
          </div>

          {/* Product Thumbnail */}
          {toast.imageUrl && (
            <div className="relative h-11 w-11 flex-none overflow-hidden rounded-md border border-[#E7DFCF]/30 bg-white">
              <Image src={toast.imageUrl} alt={toast.title} fill className="object-contain p-0.5" sizes="44px" />
            </div>
          )}

          {/* Message Content */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#B59A5A]">
              <ShoppingBag className="h-3.5 w-3.5" />
              <span>Added to Cart</span>
            </div>
            <p className="m-0 mt-0.5 truncate text-xs font-medium text-[#F5F2E9]">
              {toast.title} {toast.quantity > 1 ? `(${toast.quantity})` : ''}
            </p>
            <p className="m-0 mt-0.5 text-[11px] text-[#8FAF8A]">Product added successfully!</p>
          </div>

          {/* Actions */}
          <div className="flex flex-col items-end gap-1.5 flex-none">
            <button
              onClick={closeToast}
              className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-full border-0 bg-transparent text-[#E7DFCF] hover:bg-[#3F6B45]/50 hover:text-white transition-colors"
              aria-label="Close notification"
            >
              <X className="h-4 w-4" />
            </button>
            <Link
              href="/cart"
              onClick={closeToast}
              className="text-xs font-bold text-[#B59A5A] no-underline hover:underline whitespace-nowrap"
            >
              View Cart →
            </Link>
          </div>
        </div>
      )}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
}
