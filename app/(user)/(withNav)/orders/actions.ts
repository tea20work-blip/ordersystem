"use server";

import db from "../../../../db";
import { user, order, orderItem, table } from "../../../../db/schema";
import { eq, desc, inArray } from "drizzle-orm";

export async function fetchOrdersByMobileAction(mobile: string) {
    try {
        const foundUser = await db.select().from(user).where(eq(user.number, mobile)).limit(1);
        if (!foundUser.length) {
            return { success: false, message: 'User not found' };
        }

        const userId = foundUser[0].id;

        // Fetch last 7 orders
        const orders = await db
            .select({
                id: order.id,
                totalPricing: order.totalPricing,
                status: order.status,
                createdAt: order.createdAt,
                // tableCode: table.tableCode,
                paidOnline: order.paidOnline,
                paidCash: order.paidCash
            })
            .from(order)
            // .leftJoin(table, eq(order.tableId, table.id))
            .where(eq(order.userId, userId))
            .orderBy(desc(order.createdAt))
            .limit(7);

        // Fetch order items for these orders
        const orderIds = orders.map(o => o.id);
        let items: (typeof orderItem.$inferSelect)[] = [];
        if (orderIds.length > 0) {
            items = await db.select().from(orderItem).where(inArray(orderItem.orderId, orderIds));
        }

        // Group items by orderId
        const formattedOrders = orders.map(o => {
            return {
                ...o,
                items: items.filter(i => i.orderId === o.id)
            }
        });

        return { success: true, data: formattedOrders };
    } catch (error) {
        console.error(error);
        return { success: false, message: 'Failed to fetch orders' };
    }
}

export async function fetchOrdersByOrderIdAction(orderId: number) {
    try {

        // Fetch last 7 orders
        const orders = await db
            .select({
                id: order.id,
                totalPricing: order.totalPricing,
                status: order.status,
                createdAt: order.createdAt,
                // tableCode: table.tableCode,
                paidOnline: order.paidOnline,
                paidCash: order.paidCash
            })
            .from(order)
            .where(eq(order.id, orderId))
            .orderBy(desc(order.createdAt))
            .limit(7);

        // Fetch order items for these orders
        const orderIds = orders.map(o => o.id);
        let items: (typeof orderItem.$inferSelect)[] = [];
        if (orderIds.length > 0) {
            items = await db.select().from(orderItem).where(inArray(orderItem.orderId, orderIds));
        }

        // Group items by orderId
        const formattedOrders = orders.map(o => {
            return {
                ...o,
                items: items.filter(i => i.orderId === o.id)
            }
        });

        return { success: true, data: formattedOrders };
    } catch (error) {
        console.error(error);
        return { success: false, message: 'Failed to fetch orders' };
    }
}
