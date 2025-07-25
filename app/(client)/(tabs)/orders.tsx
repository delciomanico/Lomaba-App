"use client"
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { useOrders } from "../../../contexts/OrderContext"
import { Order, OrderItem } from "@/types/order"
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

export default function ClientOrdersScreen() {
  const { orders, loadOrders } = useOrders()
  const router = useRouter()

  const activeOrders = orders.filter((order) =>
    ["pending", "confirmed", "preparing", "delivering"].includes(order.status),
  )

  const renderOrder = ({ item }: { item: Order }) => (
    <TouchableOpacity style={styles.orderCard} onPress={() => router.push(`/(client)/order/${item.id}`)}>
      <View style={styles.orderHeader}>
        <Text style={styles.orderId}>Pedido #{item.id.slice(0,10)}</Text>
        <View style={[styles.statusBadge, { backgroundColor: statusColors[item.status] }]}>
          <Text style={styles.statusText}>{statusLabels[item.status]}</Text>
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
          </View>
        ))}
        {item.items.length > 2 && <Text style={styles.moreItems}>+{item.items.length - 2} mais</Text>}
      </View>

      <View style={styles.orderFooter}>
        <Text style={styles.orderTotal}>Total: {item.total_amount.toLocaleString("pt-AO")} Kz</Text>
        <Text style={styles.orderDate}>{ new Date(item.created_at).toLocaleDateString("pt-AO")}</Text>
      </View>

      {item.estimated_delivery && item.status === "delivering" && (
        <View style={styles.deliveryInfo}>
          <Ionicons name="time" size={16} color="#FF6B35" />
          <Text style={styles.deliveryText}>
            Entrega prevista:{" "}
            {new Date(item.estimated_delivery).toLocaleTimeString("pt-AO", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  )

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Meus Pedidos</Text>
      </View>

      {activeOrders.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="receipt-outline" size={80} color="#CCC" />
          <Text style={styles.emptyTitle}>Nenhum pedido ativo</Text>
          <Text style={styles.emptySubtitle}>Seus pedidos aparecerão aqui</Text>
        </View>
      ) : (
        <FlatList
          data={activeOrders}
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
  deliveryInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    padding: 10,
    backgroundColor: "#FFF5F0",
    borderRadius: 8,
  },
  deliveryText: {
    marginLeft: 8,
    fontSize: 12,
    color: "#FF6B35",
    fontWeight: "600",
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
