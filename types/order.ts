export interface OrderItem {
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
    id: string
    total_amount: number
    status: OrderStatus
    created_at: string
    delivery_address: string
    provider_id: string | null
    customer_id: string | null
    customer_name: string
    customer_phone: string
    estimated_delivery?: string
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
        customerName: string,
        customerPhone: string,
    ) => Promise<string>
    updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>
    getOrderById: (orderId: string) => Promise<Order | null>
    getOrdersByStatus: (status: OrderStatus) => Promise<Order[]>
    refreshOrders: () => Promise<void>
}