import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { dish } from '@/db/schema';

export type Dish = typeof dish.$inferSelect;

export interface SelectedOption {
    id: string;
    name: string;
    price: number;
}

export interface CartItem {
    cartItemId: string;
    dish: Pick<Dish, 'id' | 'name' | 'price'> & Partial<Dish>;
    quantity: number;
    selectedOptions?: SelectedOption[];
}

export interface CheckoutAttempt {
    token: string;
    fingerprint: string;
    items: { cartItemId: string; quantity: number }[];
    orderId?: number;
    amount?: number;
    paymentStatus: 'pending' | 'paid';
}

interface CartState {
    items: CartItem[];
    tableCode?: string;
    orderType: string;
    addItem: (dish: Omit<CartItem['dish'], 'id'> & { id: number | string }, selectedOptions?: SelectedOption[]) => void;
    removeItem: (cartItemId: string) => void;
    updateQuantity: (cartItemId: string, quantity: number) => void;
    clearCart: () => void;
    getTotalItems: () => number;
    getTotalPrice: () => number;
    setTableCode: (code?: string) => void;
    setOrderType: (type: string) => void;
    checkouts: CheckoutAttempt[];
    saveCheckout: (checkout: CheckoutAttempt) => void;
    completeCheckout: (token: string, orderId: number, amount: number) => void;
}

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            items: [],
            orderType: 'dineout',
            checkouts: [],
            saveCheckout: (checkout) => set(state => ({
                checkouts: [...state.checkouts.filter(item => item.token !== checkout.token), checkout],
            })),
            completeCheckout: (token, orderId, amount) => set(state => {
                const checkout = state.checkouts.find(item => item.token === token);
                if (!checkout || checkout.paymentStatus === 'paid') return state;
                const purchased = new Map(checkout.items.map(item => [item.cartItemId, item.quantity]));
                return {
                    items: state.items.map(item => ({
                        ...item, quantity: Math.max(0, item.quantity - (purchased.get(item.cartItemId) ?? 0)),
                    })).filter(item => item.quantity > 0),
                    checkouts: state.checkouts.map(item => item.token === token ? { ...item, orderId, amount, paymentStatus: 'paid' } : item),
                };
            }),
            setTableCode: (code) => set({ tableCode: code }),
            setOrderType: (type) => set({ orderType: type, ...(type === 'dineout' ? { tableCode: undefined } : {}) }),

            addItem: (inputDish, selectedOptions = []) => {
                const dish = { ...inputDish, id: Number(inputDish.id) };
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
            partialize: (state) => ({ items: state.items, checkouts: state.checkouts, tableCode: state.tableCode, orderType: state.orderType }),
        }
    )
);
