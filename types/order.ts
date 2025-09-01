import { ReactNode } from "react";

export interface OrderItem {
    unitPrice: any;
    price: any;
    id: string;
    order_id: string;
    product_id: string;
    quantity: number;
    unit_price: number;
    image_url: string;
    product: any;
}

export type OrderStatus = "pending" | "confirmed" | "preparing" | "delivering" | "delivered" | "cancelled"

export interface Order {
    providerId: ReactNode;
    estimatedDelivery: string | number | Date;
    deliveryAddress: string;
    customerPhone: ReactNode;
    customerName: ReactNode;
    deliveryFrete: any;
    deliveryFee: number;
    createdAt: string | number | Date;
    totalAmount: any;
    id: string
    total_amount: number
    status: OrderStatus
    created_at: string
    delivery_address: string
    latitude: number
    longitude: number
    provider_id: string | null
    provider: any
    customer_id: string | null
    customer_name: string
    customer_phone: string
    estimated_delivery: string
    delivery_fee: number
    items: OrderItem[]
}

export interface OrderContextType {
    orders: Order[]
    loading: boolean
    error: string | null
    loadOrders: () => Promise<void>
    loadOrdersProvider: () => Promise<void>
    createOrder: (
        items: Omit<OrderItem, "id" | "order_id">[],
        deliveryAddress: string,
        latitude: number,
        longitude: number,
        customerName: string,
        customerPhone: string,
        deliveryFee: number,
    ) => Promise<string>
    updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>
    getOrderById: (orderId: string) => Promise<Order | null>
    getOrdersByStatus: (status: OrderStatus) => Promise<Order[]>
    refreshOrders: () => Promise<void>
}

///jguiggu

export interface FloatingRefreshButtonProps {
  onRefresh: () => Promise<void> | void;
  isLoading?: boolean;
}