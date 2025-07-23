"use client"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { useOrders } from "../../../contexts/OrderContext"
import { useAuth } from "../../../contexts/AuthContext"

const { width } = Dimensions.get("window")
const cardWidth = (width - 45) / 2

export default function ProviderDashboardScreen() {
  const { orders } = useOrders()
  const { user } = useAuth()
  const router = useRouter()

  const pendingOrders = orders.filter((order) => order.status === "pending").length
  const deliveringOrders = orders.filter((order) => order.status === "delivering").length
  const todayOrders = orders.filter((order) => {
    const today = new Date()
    const orderDate = new Date(order.created_at)
    return orderDate.toDateString() === today.toDateString()
  }).length

  const todayRevenue = orders
    .filter((order) => {
      const today = new Date()
      const orderDate = new Date(order.created_at)
      return orderDate.toDateString() === today.toDateString() && order.status === "delivered"
    })
    .reduce((sum, order) => sum + order.total_amount, 0)

  const statsCards = [
    {
      title: "Pedidos Pendentes",
      value: pendingOrders.toString(),
      icon: "hourglass",
      color: "#FFA500",
      onPress: () => router.push("/(provider)/(tabs)/orders"),
    },
    {
      title: "Em Entrega",
      value: deliveringOrders.toString(),
      icon: "car",
      color: "#FF6B35",
      onPress: () => router.push("/(provider)/(tabs)/orders"),
    },
    {
      title: "Pedidos Hoje",
      value: todayOrders.toString(),
      icon: "today",
      color: "#4CAF50",
      onPress: () => router.push("/(provider)/(tabs)/reports"),
    },
    {
      title: "Receita Hoje",
      value: `${todayRevenue.toLocaleString("pt-AO")} Kz`,
      icon: "cash",
      color: "#2196F3",
      onPress: () => router.push("/(provider)/(tabs)/reports"),
    },
  ]

  const quickActions = [
    {
      title: "Novo Pedido",
      icon: "add-circle",
      color: "#4CAF50",
      onPress: () => {},
    },
    {
      title: "Gerenciar Estoque",
      icon: "cube",
      color: "#FF6B35",
      onPress: () => {},
    },
    {
      title: "Relatório Mensal",
      icon: "document-text",
      color: "#2196F3",
      onPress: () => router.push("/(provider)/(tabs)/reports"),
    },
    {
      title: "Configurações",
      icon: "settings",
      color: "#9C27B0",
      onPress: () => {},
    },
  ]

  const recentOrders = orders.slice(0, 3)

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Olá, {user?.name?.split(" ")[0]}!</Text>
            <Text style={styles.subtitle}>Bem-vindo ao painel LOMBA</Text>
          </View>
          <TouchableOpacity style={styles.notificationButton}>
            <Ionicons name="notifications" size={24} color="#FF6B35" />
            <View style={styles.notificationDot} />
          </TouchableOpacity>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          {statsCards.map((card, index) => (
            <TouchableOpacity key={index} style={[styles.statsCard, { width: cardWidth }]} onPress={card.onPress}>
              <View style={[styles.statsIcon, { backgroundColor: card.color }]}>
                <Ionicons name={card.icon as any} size={24} color="white" />
              </View>
              <Text style={styles.statsValue}>{card.value}</Text>
              <Text style={styles.statsTitle}>{card.title}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ações Rápidas</Text>
          <View style={styles.actionsContainer}>
            {quickActions.map((action, index) => (
              <TouchableOpacity key={index} style={styles.actionButton} onPress={action.onPress}>
                <Ionicons name={action.icon as any} size={24} color={action.color} />
                <Text style={styles.actionText}>{action.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recent Orders */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Pedidos Recentes</Text>
            <TouchableOpacity onPress={() => router.push("/(provider)/(tabs)/orders")}>
              <Text style={styles.seeAllText}>Ver todos</Text>
            </TouchableOpacity>
          </View>

          {recentOrders.map((order, index) => (
            <TouchableOpacity key={index} style={styles.orderCard} onPress={() => router.push(`/order/${order.id}`)}>
              <View style={styles.orderInfo}>
                <Text style={styles.orderId}>Pedido #{order.id}</Text>
                <Text style={styles.customerName}>{order.customer_name}</Text>
                <Text style={styles.orderTime}>
                  {new Date(order.created_at).toLocaleTimeString("pt-AO", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
              </View>
              <View style={styles.orderRight}>
                <Text style={styles.orderTotal}>{order.total_amount.toLocaleString("pt-AO")} Kz</Text>
                <View style={[styles.orderStatus, { backgroundColor: getStatusColor(order.status) }]}>
                  <Text style={styles.orderStatusText}>{getStatusLabel(order.status)}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const getStatusColor = (status: string) => {
  const colors = {
    pending: "#FFA500",
    confirmed: "#4CAF50",
    preparing: "#2196F3",
    delivering: "#FF6B35",
    delivered: "#4CAF50",
    cancelled: "#F44336",
  }
  return colors[status as keyof typeof colors] || "#999"
}

const getStatusLabel = (status: string) => {
  const labels = {
    pending: "Pendente",
    confirmed: "Confirmado",
    preparing: "Preparando",
    delivering: "Entregando",
    delivered: "Entregue",
    cancelled: "Cancelado",
  }
  return labels[status as keyof typeof labels] || status
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: "white",
  },
  greeting: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  notificationButton: {
    position: "relative",
    padding: 8,
  },
  notificationDot: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FF6B35",
  },
  statsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  statsCard: {
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
  statsIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  statsValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  statsTitle: {
    fontSize: 12,
    color: "#666",
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  seeAllText: {
    fontSize: 14,
    color: "#FF6B35",
    fontWeight: "600",
  },
  actionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  actionButton: {
    width: cardWidth,
    backgroundColor: "white",
    borderRadius: 15,
    padding: 20,
    alignItems: "center",
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionText: {
    fontSize: 12,
    color: "#333",
    fontWeight: "600",
    marginTop: 8,
    textAlign: "center",
  },
  orderCard: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 15,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderInfo: {
    flex: 1,
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
  orderTime: {
    fontSize: 12,
    color: "#999",
  },
  orderRight: {
    alignItems: "flex-end",
  },
  orderTotal: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FF6B35",
    marginBottom: 5,
  },
  orderStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  orderStatusText: {
    fontSize: 10,
    color: "white",
    fontWeight: "bold",
  },
})
