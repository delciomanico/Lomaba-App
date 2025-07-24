"use client"

import { useState } from "react"
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Alert } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { useOrders } from "../../../contexts/OrderContext"
import { Order, OrderStatus } from "@/types/order"
import { FloatingRefreshButton } from "@/components/buttons/ButtonFloating"

const statusColors = {
  pending: "#FFA500",
  confirmed: "#4CAF50",
  preparing: "#2196F3",
  delivering: "#FF6B35",
  delivered: "#4CAF50",
  cancelled: "#F44336",
}

const statusLabels = {
  pending: "Pendente",
  confirmed: "Confirmado",
  preparing: "Preparando",
  delivering: "Em entrega",
  delivered: "Entregue",
  cancelled: "Cancelado",
}

export default function ProviderOrdersScreen() {
  const { orders, updateOrderStatus, loadOrdersProvider } = useOrders()
  const router = useRouter()
  const [filter, setFilter] = useState<"all" | "pending" | "confirmed" | "preparing" | "delivering">("all")

  const activeOrders = orders.filter((order) =>
    ["pending", "confirmed", "preparing", "delivering"].includes(order.status),
  )

  const filteredOrders = filter === "all" ? activeOrders : activeOrders.filter((order) => order.status === filter)

  const handleStatusUpdate = (orderId: string, currentStatus: string) => {
    const statusFlow = {
      pending: "confirmed",
      confirmed: "preparing",
      preparing: "delivering",
      delivering: "delivered",
    }

    const nextStatus = statusFlow[currentStatus as keyof typeof statusFlow]

    if (nextStatus) {
      Alert.alert(
        "Atualizar Status",
        `Alterar status para "${statusLabels[nextStatus as keyof typeof statusLabels]}"?`,
        [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Confirmar",
            onPress: () => updateOrderStatus(orderId, nextStatus as OrderStatus),
          },
        ],
      )
    }
  }

  const handleCancelOrder = (orderId: string) => {
    Alert.alert("Cancelar Pedido", "Tem certeza que deseja cancelar este pedido?", [
      { text: "Não", style: "cancel" },
      {
        text: "Sim, cancelar",
        style: "destructive",
        onPress: () => updateOrderStatus(orderId, "cancelled"),
      },
    ])
  }

 
  const renderOrder = ({ item }: { item: Order }) => (
    <TouchableOpacity style={styles.orderCard} onPress={() => router.push(`/(provider)/order/${item.id}`)}>
      <View style={styles.orderHeader}>
        <View>
          <Text style={styles.orderId}>Pedido #{item.id.slice(0,10)}</Text>
          <Text style={styles.customerName}>{item.customer_name}</Text>
          <Text style={styles.customerPhone}>{item.customer_phone} </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusColors[item.status] }]}>
          <Text style={styles.statusText}>{statusLabels[item.status]}</Text>
        </View>
      </View>

      <View style={styles.orderItems}>
        {item.items.slice(0, 2).map((orderItem: any, index: number) => (
          <View key={index} style={styles.orderItem}>
            <Image source={{ uri: orderItem.product.image_url }} style={styles.itemImage} />
            <View style={styles.itemInfo}>
              <Text style={styles.itemName}>{orderItem.name}</Text>
              <Text style={styles.itemQuantity}>Qtd: {orderItem.quantity}</Text>
            </View>
          </View>
        ))}
        {item.items.length > 2 && <Text style={styles.moreItems}>+{item.items.length - 2} mais</Text>}
      </View>

      <View style={styles.deliveryInfo}>
        <Ionicons name="location" size={16} color="#666" />
        <Text style={styles.deliveryAddress} numberOfLines={2}>
          {item.delivery_address}
        </Text>
      </View>

      <View style={styles.orderFooter}>
        <Text style={styles.orderTotal}>Total: {item.total_amount.toLocaleString("pt-AO")} Kz</Text>
        <Text style={styles.orderTime}>
          {new Date(item.estimated_delivery).toLocaleTimeString("pt-AO",{
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>
      </View>

      <View style={styles.actionButtons}>
        {item.status !== "delivered" && item.status !== "cancelled" && (
          <TouchableOpacity style={styles.updateButton} onPress={() => handleStatusUpdate(item.id, item.status)}>
            <Text style={styles.updateButtonText}>
              {item.status === "pending" && "Confirmar"}
              {item.status === "confirmed" && "Preparar"}
              {item.status === "preparing" && "Entregar"}
              {item.status === "delivering" && "Finalizar"}
            </Text>
          </TouchableOpacity>
        )}

        {item.status === "confirmed" && (
          <TouchableOpacity style={styles.cancelButton} onPress={() => handleCancelOrder(item.id)}>
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  )

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Gestão de Pedidos</Text>
        <Text style={styles.subtitle}>{filteredOrders.length} pedidos</Text>
      </View>

      {/* Filter Buttons */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, filter === "all" && styles.filterButtonActive]}
          onPress={() => setFilter("all")}
        >
          <Text style={[styles.filterText, filter === "all" && styles.filterTextActive]}>Todos</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === "pending" && styles.filterButtonActive]}
          onPress={() => setFilter("pending")}
        >
          <Text style={[styles.filterText, filter === "pending" && styles.filterTextActive]}>Pendentes</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === "confirmed" && styles.filterButtonActive]}
          onPress={() => setFilter("confirmed")}
        >
          <Text style={[styles.filterText, filter === "confirmed" && styles.filterTextActive]}>Confirmados</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === "preparing" && styles.filterButtonActive]}
          onPress={() => setFilter("preparing")}
        >
          <Text style={[styles.filterText, filter === "preparing" && styles.filterTextActive]}>Preparando</Text>
        </TouchableOpacity>
      </View>

      {filteredOrders.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="receipt-outline" size={80} color="#CCC" />
          <Text style={styles.emptyTitle}>Nenhum pedido encontrado</Text>
          <Text style={styles.emptySubtitle}>Os pedidos aparecerão aqui</Text>
        </View>
      ) : (
        <FlatList
          data={filteredOrders}
          renderItem={renderOrder}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.ordersList}
          showsVerticalScrollIndicator={false}
        />
      )}
      <FloatingRefreshButton onRefresh={loadOrdersProvider}/>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  header: {
    backgroundColor: "white",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  filterContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "white",
  },
  filterButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: "#F5F5F5",
  },
  filterButtonActive: {
    backgroundColor: "#FF6B35",
  },
  filterText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#666",
  },
  filterTextActive: {
    color: "white",
  },
  ordersList: {
    padding: 20,
  },
  orderCard: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 15,
  },
  orderId: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 2,
  },
  customerName: {
    fontSize: 14,
    color: "#666",
    marginBottom: 2,
  },
  customerPhone: {
    fontSize: 12,
    color: "#999",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  statusText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  orderItems: {
    marginBottom: 15,
  },
  orderItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  itemImage: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "#F5F5F5",
  },
  itemInfo: {
    marginLeft: 12,
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  itemQuantity: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  moreItems: {
    fontSize: 12,
    color: "#FF6B35",
    fontWeight: "600",
    marginTop: 5,
  },
  deliveryInfo: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 15,
    padding: 10,
    backgroundColor: "#F8F9FA",
    borderRadius: 8,
  },
  deliveryAddress: {
    marginLeft: 8,
    fontSize: 12,
    color: "#666",
    flex: 1,
  },
  orderFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
    marginBottom: 15,
  },
  orderTotal: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FF6B35",
  },
  orderTime: {
    fontSize: 12,
    color: "#666",
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  updateButton: {
    flex: 1,
    backgroundColor: "#FF6B35",
    paddingVertical: 10,
    borderRadius: 8,
    marginRight: 10,
  },
  updateButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
  },
  cancelButton: {
    backgroundColor: "#F44336",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  cancelButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginTop: 20,
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
})
