"use client"

import { useState } from "react"
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { useOrders } from "@/contexts/OrderContext"
import { Order, OrderItem } from "@/types/order"
import { FloatingRefreshButton } from "@/components/buttons/ButtonFloating"

const statusColors = {
  delivered: "#4CAF50",
  cancelled: "#F44336",
}

const statusLabels = {
  delivered: "Entregue",
  cancelled: "Cancelado",
}

export default function ClientHistoryScreen() {
  const { orders , loadOrders} = useOrders()
  const router = useRouter()
  const [filter, setFilter] = useState<"all" | "delivered" | "cancelled">("all")

  const completedOrders = orders.filter((order) => ["delivered", "cancelled"].includes(order.status))

  const filteredOrders = filter === "all" ? completedOrders : completedOrders.filter((order) => order.status === filter)

  const renderOrder = ({ item }: { item: Order }) => (
    <TouchableOpacity style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <Text style={styles.orderId}>Pedido #{item.id.slice(0,10)}</Text>
        <View style={[styles.statusBadge, { backgroundColor: statusColors[item.status as keyof typeof statusColors] }]}>
          <Text style={styles.statusText}>{statusLabels[item.status as keyof typeof statusLabels]}</Text>
        </View>
      </View>

      <View style={styles.orderItems}>
        {item.items.slice(0, 2).map((orderItem: OrderItem, index: number) => (
          <View key={index} style={styles.orderItem}>
            <Image source={{ uri: orderItem.product.image_url }} style={styles.itemImage} />
            <View style={styles.itemInfo}>
              <Text style={styles.itemName}>{orderItem.product.name}</Text>
              <Text style={styles.itemQuantity}>Qtd: {orderItem.quantity}</Text>
            </View>
            <Text style={styles.itemPrice}>{orderItem.unit_price.toLocaleString("pt-AO")} Kz</Text>
          </View>
        ))}
        {item.items.length > 2 && <Text style={styles.moreItems}>+{item.items.length - 2} mais</Text>}
      </View>

      <View style={styles.orderFooter}>
        <Text style={styles.orderTotal}>Total: {item.total_amount.toLocaleString("pt-AO")} Kz</Text>
        <Text style={styles.orderDate}>{new Date(item.created_at).toLocaleDateString("pt-AO")}</Text>
      </View>
    </TouchableOpacity>
  )

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Histórico</Text>
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
          style={[styles.filterButton, filter === "delivered" && styles.filterButtonActive]}
          onPress={() => setFilter("delivered")}
        >
          <Text style={[styles.filterText, filter === "delivered" && styles.filterTextActive]}>Entregues</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === "cancelled" && styles.filterButtonActive]}
          onPress={() => setFilter("cancelled")}
        >
          <Text style={[styles.filterText, filter === "cancelled" && styles.filterTextActive]}>Cancelados</Text>
        </TouchableOpacity>
      </View>

      {filteredOrders.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="time-outline" size={80} color="#CCC" />
          <Text style={styles.emptyTitle}>Nenhum pedido encontrado</Text>
          <Text style={styles.emptySubtitle}>Seu histórico aparecerá aqui</Text>
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

      <FloatingRefreshButton onRefresh={loadOrders}/>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  header: {
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
  filterContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  filterButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: "#F5F5F5",
  },
  filterButtonActive: {
    backgroundColor: "#FF6B35",
  },
  filterText: {
    fontSize: 14,
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
    alignItems: "center",
    marginBottom: 15,
  },
  orderId: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
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
  itemPrice: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#FF6B35",
  },
  moreItems: {
    fontSize: 12,
    color: "#FF6B35",
    fontWeight: "600",
    marginTop: 5,
  },
  orderFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  orderTotal: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FF6B35",
  },
  orderDate: {
    fontSize: 12,
    color: "#666",
  },
  reorderButton: {
    backgroundColor: "#FF6B35",
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  reorderText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
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
