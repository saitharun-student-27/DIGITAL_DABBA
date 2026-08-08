'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface CartItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string | null;
}

interface CartContextType {
  cartItems: CartItem[];
  kitchenId: string | null;
  kitchenName: string | null;
  deliveryDate: string;
  deliverySlot: string;
  addToCart: (kitchenId: string, kitchenName: string, item: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  updateQuantity: (menuItemId: string, quantity: number) => void;
  removeFromCart: (menuItemId: string) => void;
  setDeliveryInfo: (date: string, slot: string) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [kitchenId, setKitchenId] = useState<string | null>(null);
  const [kitchenName, setKitchenName] = useState<string | null>(null);
  const [deliveryDate, setDeliveryDate] = useState<string>('');
  const [deliverySlot, setDeliverySlot] = useState<string>('12:00 PM - 1:00 PM');

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    const savedKitchenId = localStorage.getItem('cart_kitchen_id');
    const savedKitchenName = localStorage.getItem('cart_kitchen_name');
    const savedDate = localStorage.getItem('cart_delivery_date');
    const savedSlot = localStorage.getItem('cart_delivery_slot');

    if (savedCart) setCartItems(JSON.parse(savedCart));
    if (savedKitchenId) setKitchenId(savedKitchenId);
    if (savedKitchenName) setKitchenName(savedKitchenName);
    
    // Set default delivery date as tomorrow
    const tomorrowStr = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    setDeliveryDate(savedDate || tomorrowStr);
    if (savedSlot) setDeliverySlot(savedSlot);
  }, []);

  // Save to localStorage whenever cart changes
  const saveCart = (items: CartItem[], kId: string | null, kName: string | null) => {
    setCartItems(items);
    setKitchenId(kId);
    setKitchenName(kName);
    
    if (items.length === 0) {
      localStorage.removeItem('cart');
      localStorage.removeItem('cart_kitchen_id');
      localStorage.removeItem('cart_kitchen_name');
    } else {
      localStorage.setItem('cart', JSON.stringify(items));
      if (kId) localStorage.setItem('cart_kitchen_id', kId);
      if (kName) localStorage.setItem('cart_kitchen_name', kName);
    }
  };

  const addToCart = (kId: string, kName: string, item: Omit<CartItem, 'quantity'>, quantity = 1) => {
    // If ordering from a new kitchen, clear the previous cart
    if (kitchenId && kitchenId !== kId) {
      const confirmClear = window.confirm(
        `You have items from "${kitchenName}" in your cart. Adding items from "${kName}" will empty your current cart. Continue?`
      );
      if (!confirmClear) return;
      
      const newItems = [{ ...item, quantity }];
      saveCart(newItems, kId, kName);
      return;
    }

    const existingIndex = cartItems.findIndex((ci) => ci.menuItemId === item.menuItemId);
    let newItems = [...cartItems];

    if (existingIndex > -1) {
      newItems[existingIndex].quantity += quantity;
    } else {
      newItems.push({ ...item, quantity });
    }

    saveCart(newItems, kId || kitchenId, kName || kitchenName);
  };

  const updateQuantity = (menuItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(menuItemId);
      return;
    }

    const newItems = cartItems.map((ci) => 
      ci.menuItemId === menuItemId ? { ...ci, quantity } : ci
    );
    saveCart(newItems, kitchenId, kitchenName);
  };

  const removeFromCart = (menuItemId: string) => {
    const newItems = cartItems.filter((ci) => ci.menuItemId !== menuItemId);
    if (newItems.length === 0) {
      saveCart([], null, null);
    } else {
      saveCart(newItems, kitchenId, kitchenName);
    }
  };

  const setDeliveryInfo = (date: string, slot: string) => {
    setDeliveryDate(date);
    setDeliverySlot(slot);
    localStorage.setItem('cart_delivery_date', date);
    localStorage.setItem('cart_delivery_slot', slot);
  };

  const clearCart = () => {
    saveCart([], null, null);
  };

  const cartCount = cartItems.reduce((acc, ci) => acc + ci.quantity, 0);
  const cartTotal = cartItems.reduce((acc, ci) => acc + ci.price * ci.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        kitchenId,
        kitchenName,
        deliveryDate,
        deliverySlot,
        addToCart,
        updateQuantity,
        removeFromCart,
        setDeliveryInfo,
        clearCart,
        cartCount,
        cartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
