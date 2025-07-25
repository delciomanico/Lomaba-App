import { createContext, useContext, useState, useEffect } from "react"
import { supabase } from "../lib/supabase"
import { useAuth } from "./AuthContext";
import { Order, OrderContextType, OrderItem, OrderStatus } from "@/types/order";

const OrderContext = createContext<OrderContextType | undefined>(undefined)

export function OrderProvider({ children }: { children: React.ReactNode }) {
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const { user, logout } = useAuth()

    useEffect(() => {
        loadOrdersProvider();
    }, []);


    const loadOrders = async () => {
        setLoading(true)
        setError(null)
        try {
            const { data: ordersData, error: ordersError } = await supabase
                .from("orders")
                .select("*")
                .eq('customer_id', `${user?.id}`)
                .order("created_at", { ascending: false })

            if (ordersError) throw ordersError

            const ordersWithItems = await Promise.all(
                ordersData.map(async (order) => {
                    const { data: itemsData, error: itemsError } = await supabase
                        .from("order_items")
                        .select("*, product:products(*)")
                        .eq("order_id", order.id)
                    if (itemsError) throw itemsError

                    const { data: userData, error: userError } = await supabase
                        .from("users")
                        .select("*")
                        .single()
                    if (userError) throw userError
                    return { ...order, items: itemsData, provider: userData }
                })
            )
            console.log(ordersWithItems)
            setOrders(ordersWithItems)
        } catch (err) {
            console.error("Error loading orders:", err)
            setError("Failed to load orders")
        } finally {
            setLoading(false)
        }
    }

    const loadOrdersProvider = async () => {
        setLoading(true)
        setError(null)
        try {
            const { data: ordersData, error: ordersError } = await supabase
                .from("orders")
                .select("*")
                .order("created_at", { ascending: false })


            if (ordersError) throw ordersError

            const ordersWithItems = await Promise.all(
                ordersData.map(async (order) => {
                    const { data: itemsData, error: itemsError } = await supabase
                        .from("order_items")
                        .select("*, product:products(*)")
                        .eq("order_id", order.id)

                    if (itemsError) throw itemsError

                    return { ...order, items: itemsData }
                })
            )

            setOrders(ordersWithItems)
        } catch (err) {
            console.error("Error loading orders:", err)
            setError("Failed to load orders")
        } finally {
            setLoading(false)
        }
    }

    const createOrder = async (
        items: Omit<OrderItem, "id" | "order_id">[],
        deliveryAddress: string,
        latitude: number,
        longitude: number,
        customerName: string,
        customerPhone: string,
    ): Promise<string> => {
        setLoading(true)
        setError(null)
        try {
            const { data: { user }, error: userError } = await supabase.auth.getUser();

            if (userError || !user) {
                throw new Error("Usuário não autenticado");
            }

            const subtotal = items.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0)
            const deliveryFee = 500
            const total_amount = subtotal + deliveryFee

            const { data: orderData, error: orderError } = await supabase
                .from("orders")
                .insert({
                    customer_id: user.id,
                    total_amount,
                    status: "pending",
                    delivery_address: deliveryAddress,
                    latitude: latitude,
                    longitude: longitude,
                    customer_name: customerName,
                    customer_phone: customerPhone,
                    delivery_fee: deliveryFee,
                    estimated_delivery: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
                })
                .select()
                .single()

            if (orderError || !orderData) throw orderError || new Error("Failed to create order")

            const orderItems = items.map(item => ({
                ...item,
                order_id: orderData.id,
            }))

            const { error: itemsError } = await supabase
                .from("order_items")
                .insert(orderItems)

            if (itemsError) throw itemsError

            await loadOrders()
            await loadOrdersProvider()
            return orderData.id
        } catch (err) {
            console.error("Error creating order:", err)
            setError("Failed to create order")
            throw err
        } finally {
            setLoading(false)
        }
    }

    const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
        setLoading(true)
        setError(null)
        try {
            if (user?.type === "client") {
                var { error } = await supabase
                    .from("orders")
                    .update({ status })
                    .eq("id", orderId)
            } else {
                var { error } = await supabase
                    .from("orders")
                    .update({ status, provider_id: user?.id })
                    .eq("id", orderId)
            }

            if (error) throw error

            setOrders(prevOrders =>
                prevOrders.map(order =>
                    order.id === orderId ? { ...order, status } : order
                )
            )
        } catch (err) {
            console.error("Error updating order status:", err)
            setError("Failed to update order status")
        } finally {
            setLoading(false)
        }
    }

    const getOrderById = async (orderId: string): Promise<Order | null> => {
        setLoading(true)
        setError(null)
        try {
            const { data: orderData, error: orderError } = await supabase
                .from("orders")
                .select("*")
                .eq("id", orderId)
                .single()

            if (orderError || !orderData) return null

            const { data: itemsData, error: itemsError } = await supabase
                .from("order_items")
                .select("*, product:products(*)")
                .eq("order_id", orderId)

            if (itemsError) throw itemsError

            const { data: userData, error: userError } = await supabase
                .from("users")
                .select("*")
                .single()
            if (userError) throw userError

            return { ...orderData, items: itemsData , provider: userData}
        } catch (err) {
            console.error("Error fetching order:", err)
            setError("Failed to fetch order")
            return null
        } finally {
            setLoading(false)
        }
    }

    const getOrdersByStatus = async (status: OrderStatus): Promise<Order[]> => {
        setLoading(true)
        setError(null)
        try {
            const { data: ordersData, error: ordersError } = await supabase
                .from("orders")
                .select("*")
                .eq("status", status)
                .order("created_at", { ascending: false })

            if (ordersError) throw ordersError

            const ordersWithItems = await Promise.all(
                ordersData.map(async (order) => {
                    const { data: itemsData, error: itemsError } = await supabase
                        .from("order_items")
                        .select("*, product:products(*)")
                        .eq("order_id", order.id)

                    if (itemsError) throw itemsError

                    return { ...order, items: itemsData }
                })
            )

            return ordersWithItems
        } catch (err) {
            console.error("Error fetching orders by status:", err)
            setError("Failed to fetch orders by status")
            return []
        } finally {
            setLoading(false)
        }
    }

    return (
        <OrderContext.Provider
            value={{
                orders,
                loading,
                error,
                loadOrders,
                loadOrdersProvider,
                createOrder,
                updateOrderStatus,
                getOrderById,
                getOrdersByStatus,
                refreshOrders: loadOrders,
            }}
        >
            {children}
        </OrderContext.Provider>
    )
}

export function useOrders() {
    const context = useContext(OrderContext)
    if (context === undefined) {
        throw new Error("useOrders must be used within an OrderProvider")
    }
    return context
}