import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { dish } from '@/db/schema';

export type Dish = typeof dish.$inferSelect;

export interface SelectedOption {
    id: string;
    name: string;
    price: number;
}

export interface CartItem {
    cartItemId: string;
    dish: Dish;
    quantity: number;
    selectedOptions?: SelectedOption[];
}

interface CartState {
    items: CartItem[];
    tableCode?: string;
    orderType: string;
    addItem: (dish: any, selectedOptions?: SelectedOption[]) => void;
    removeItem: (cartItemId: string) => void;
    updateQuantity: (cartItemId: string, quantity: number) => void;
    clearCart: () => void;
    getTotalItems: () => number;
    getTotalPrice: () => number;
    setTableCode: (code?: string) => void;
    setOrderType: (type: string) => void;
}

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            items: [],
            orderType: 'dineout',
            setTableCode: (code) => set({ tableCode: code }),
            setOrderType: (type) => set({ orderType: type }),

            addItem: (dish, selectedOptions = []) => {
                const currentItems = get().items;
                const sortedOptionIds = [...selectedOptions].map(o => o.id).sort().join(',');
                const cartItemId = `${dish.id}${sortedOptionIds ? '-' + sortedOptionIds : ''}`;
                const existingItem = currentItems.find(item => item.cartItemId === cartItemId);

                if (existingItem) {
                    set({
                        items: currentItems.map(item =>
                            item.cartItemId === cartItemId
                                ? { ...item, quantity: item.quantity + 1 }
                                : item
                        )
                    });
                } else {
                    set({ items: [...currentItems, { cartItemId, dish, quantity: 1, selectedOptions }] });
                }
            },

            removeItem: (cartItemId) => {
                set({ items: get().items.filter(item => item.cartItemId !== cartItemId) });
            },

            updateQuantity: (cartItemId, quantity) => {
                if (quantity <= 0) {
                    get().removeItem(cartItemId);
                    return;
                }

                set({
                    items: get().items.map(item =>
                        item.cartItemId === cartItemId
                            ? { ...item, quantity }
                            : item
                    )
                });
            },

            clearCart: () => set({ items: [] }),

            getTotalItems: () => {
                return get().items.reduce((total, item) => total + item.quantity, 0);
            },

            getTotalPrice: () => {
                return get().items.reduce((total, item) => {
                    const optionsPrice = item.selectedOptions?.reduce((sum, opt) => sum + opt.price, 0) || 0;
                    return total + ((item.dish.price + optionsPrice) * item.quantity);
                }, 0);
            }
        }),
        {
            name: 't20-cart-storage',
        }
    )
);
