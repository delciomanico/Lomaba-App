"use client"

import type React from "react"
import { createContext, useContext, useState } from "react"

interface OrderItem {
  id: string
  name: string
  price: number
  quantity: number
  image: string
}

interface Order {
  id: string
  items: OrderItem[]
  total: number
  status: "pending" | "confirmed" | "preparing" | "delivering" | "delivered" | "cancelled"
  createdAt: Date
  deliveryAddress: string
  customerName: string
  customerPhone: string
  estimatedDelivery?: Date
  deliveryFee: number
}

interface OrderContextType {
  orders: Order[]
  createOrder: (
    items: OrderItem[],
    deliveryAddress: string,
    customerName: string,
    customerPhone: string,
  ) => Promise<string>
  updateOrderStatus: (orderId: string, status: Order["status"]) => void
  getOrderById: (orderId: string) => Order | undefined
  getOrdersByStatus: (status: Order["status"]) => Order[]
}

const OrderContext = createContext<OrderContextType | undefined>(undefined)

export function OrderProvider({ children }: { children: React.ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([
    // Mock orders for demonstration
    {
      id: "1",
      items: [
        {
          id: "1",
          name: "Botija de Gás 13kg",
          price: 3500,
          quantity: 1,
          image: "/placeholder.svg?height=150&width=150",
        },
      ],
      total: 4000,
      status: "delivering",
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      deliveryAddress: "Rua da Paz, 123, Luanda",
      customerName: "João Silva",
      customerPhone: "+244 900 000 001",
      deliveryFee: 500,
      estimatedDelivery: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes from now
    },
    {
      id: "2",
      items: [
        {
          id: "2",
          name: "Botija de Gás 6kg",
          price: 2000,
          quantity: 2,
          image: "/placeholder.svg?height=150&width=150",
        },
      ],
      total: 4500,
      status: "delivered",
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      deliveryAddress: "Avenida Marginal, 456, Luanda",
      customerName: "Maria Santos",
      customerPhone: "+244 900 000 002",
      deliveryFee: 500,
    },
  ])

  const createOrder = async (
    items: OrderItem[],
    deliveryAddress: string,
    customerName: string,
    customerPhone: string,
  ): Promise<string> => {
    const deliveryFee = 500 // Fixed delivery fee
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const total = subtotal + deliveryFee

    const newOrder: Order = {
      id: Date.now().toString(),
      items,
      total,
      status: "pending",
      createdAt: new Date(),
      deliveryAddress,
      customerName,
      customerPhone,
      deliveryFee,
      estimatedDelivery: new Date(Date.now() + 60 * 60 * 1000), // 1 hour from now
    }

    setOrders((prevOrders) => [newOrder, ...prevOrders])
    return newOrder.id
  }

  const updateOrderStatus = (orderId: string, status: Order["status"]) => {
    setOrders((prevOrders) => prevOrders.map((order) => (order.id === orderId ? { ...order, status } : order)))
  }

  const getOrderById = (orderId: string) => {
    return orders.find((order) => order.id === orderId)
  }

  const getOrdersByStatus = (status: Order["status"]) => {
    return orders.filter((order) => order.status === status)
  }

  return (
    <OrderContext.Provider
      value={{
        orders,
        createOrder,
        updateOrderStatus,
        getOrderById,
        getOrdersByStatus,
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
