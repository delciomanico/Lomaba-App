import { createContext, useContext, useState, useEffect } from "react"
import { useAuth } from "./AuthContext";
import { Order, OrderContextType, OrderItem, OrderStatus } from "@/types/order";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_BASE_URL = "http://192.168.100.23:3333/api/v1";

const OrderContext = createContext<OrderContextType | undefined>(undefined)

export function OrderProvider({ children }: { children: React.ReactNode }) {
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const { user, logout } = useAuth()

    useEffect(() => {
        if (user?.type === "provider") {
            loadOrdersProvider();
        } else {
            loadOrders();
        }
    }, [user]);

    const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
        try {
            const token = await AsyncStorage.getItem('authToken'); 
            const response = await fetch(`${API_BASE_URL}${url}`, {
                ...options,
                headers: {
                    ...options.headers,
                    'Content-Type': 'application/json',
                    'authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                if (response.status === 401) {
                    logout();
                }
                throw new Error(await response.text());
            }

            return await response.json();
        } catch (err) {
            console.error("API request failed:", err);
            throw err;
        }
    };

    const loadOrders = async () => {
        setLoading(true)
        setError(null)
        try {
            const data = await fetchWithAuth(`/orders`);
            
            setOrders(data);
        } catch (err: any) {
            console.error("Error loading orders:", err)
            setError(err.message || "Failed to load orders")
        } finally {
            setLoading(false)
        }
    }

    const loadOrdersProvider = async () => {
        setLoading(true)
        setError(null)
        try {
            const data = await fetchWithAuth(`/orders/all`);
            setOrders(data);
        } catch (err: any) {
            console.error("Error loading provider orders:", err)
            setError(err.message || "Failed to load provider orders")
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
            const subtotal = items.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0)
            const deliveryFee = 500
            const total_amount = subtotal + deliveryFee

            const orderData = await fetchWithAuth('/orders', {
                method: 'POST',
                body: JSON.stringify({
                    items,
                    total_amount,
                    deliveryAddress,
                    latitude,
                    longitude,
                    customerName,
                    customerPhone,
                    delivery_fee: deliveryFee
                })
            });

            // Atualiza a lista de pedidos após criação
            if (user?.type === "provider") {
                await loadOrdersProvider();
            } else {
                await loadOrders();
            }

            return orderData.id;
        } catch (err: any) {
            console.error("Error creating order:", err)
            setError(err.message || "Failed to create order")
            throw err
        } finally {
            setLoading(false)
        }
    }

    const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
        setLoading(true)
        setError(null)
        try {
            await fetchWithAuth(`/orders/${orderId}/status`, {
                method: 'PATCH',
                body: JSON.stringify({ status })
            });

            setOrders(prevOrders =>
                prevOrders.map(order =>
                    order.id === orderId ? { ...order, status } : order
                )
            )
        } catch (err: any) {
            console.error("Error updating order status:", err)
            setError(err.message || "Failed to update order status")
        } finally {
            setLoading(false)
        }
    }

    const getOrderById = async (orderId: string): Promise<Order | null> => {
        setLoading(true)
        setError(null)
        try {
            const order = await fetchWithAuth(`/orders/${orderId}`);
            return order;
        } catch (err: any) {
            console.error("Error fetching order:", err)
            setError(err.message || "Failed to fetch order")
            return null
        } finally {
            setLoading(false)
        }
    }

    const getOrdersByStatus = async (status: OrderStatus): Promise<Order[]> => {
        setLoading(true)
        setError(null)
        try {
            const orders = await fetchWithAuth(`/orders/status/${status}`);
            return orders;
        } catch (err: any) {
            console.error("Error fetching orders by status:", err)
            setError(err.message || "Failed to fetch orders by status")
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
                refreshOrders: user?.type === "provider" ? loadOrdersProvider : loadOrders,
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