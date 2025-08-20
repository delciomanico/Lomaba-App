"use client"

import { useState } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { useOrders } from "../../../contexts/OrderContext"
import { FloatingRefreshButton } from "@/components/buttons/ButtonFloating"

const { width } = Dimensions.get("window")
const cardWidth = (width - 45) / 2

export default function ProviderReportsScreen() {
  const { orders, loadOrdersProvider } = useOrders()
  const [selectedPeriod, setSelectedPeriod] = useState<"today" | "week" | "month" | "year">("today")

  const getFilteredOrders = () => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    switch (selectedPeriod) {
      case "today":
        return orders.filter((order) => {
          const orderDate = new Date(order.createdAt)
          return orderDate >= today
        })
      case "week":
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
        return orders.filter((order) => {
          const orderDate = new Date(order.createdAt)
          return orderDate >= weekAgo
        })
      case "month":
        const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
        return orders.filter((order) => {
          const orderDate = new Date(order.createdAt)
          return orderDate >= monthAgo
        })
      case "year":
        const yearAgo = new Date(today.getTime() - 365 * 24 * 60 * 60 * 1000)
        return orders.filter((order) => {
          const orderDate = new Date(order.createdAt)
          return orderDate >= yearAgo
        })
      default:
        return orders
    }
  }

  const filteredOrders = getFilteredOrders()
  const deliveredOrders = filteredOrders.filter((order) => order.status === "delivered")

  const totalOrders = filteredOrders.length
  const totalRevenue = deliveredOrders.reduce((sum, order) => sum + order.totalAmount, 0)
  const averageOrderValue = totalOrders > 0 ? totalRevenue / deliveredOrders.length : 0
  const pendingOrders = filteredOrders.filter((order) => order.status === "pending").length

  const periodLabels = {
    today: "Hoje",
    week: "Esta Semana",
    month: "Este Mês",
    year: "Este Ano",
  }

  const statsCards = [
    {
      title: "Total de Pedidos",
      value: totalOrders.toString(),
      icon: "receipt",
      color: "#4CAF50",
      subtitle: `${deliveredOrders.length} entregues`,
    },
    {
      title: "Receita Total",
      value: `${Math.round(totalRevenue).toLocaleString("pt-AO")} Kz`,
      icon: "cash",
      color: "#2196F3",
      subtitle: "Pedidos entregues",
    },
    {
      title: "Ticket Médio",
      value: `${Math.round(averageOrderValue).toLocaleString("pt-AO")} Kz`,
      icon: "trending-up",
      color: "#FF6B35",
      subtitle: "Por pedido",
    },
    {
      title: "Pedidos Pendentes",
      value: pendingOrders.toString(),
      icon: "hourglass",
      color: "#FFA500",
      subtitle: "Aguardando confirmação",
    },
  ]

  // Análise de produtos mais vendidos
  const productSales = deliveredOrders.reduce(
    (acc, order) => {
      order.items.forEach((item) => {
        if (acc[item.product.name]) {
          acc[item.product.name] += item.quantity
        } else {
          acc[item.product.name] = item.quantity
        }
      })
      return acc
    },
    {} as Record<string, number>,
  )

  const topProducts = Object.entries(productSales)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)

  // Análise de vendas por status
  const statusAnalysis = {
    pending: filteredOrders.filter((o) => o.status === "pending").length,
    confirmed: filteredOrders.filter((o) => o.status === "confirmed").length,
    preparing: filteredOrders.filter((o) => o.status === "preparing").length,
    delivering: filteredOrders.filter((o) => o.status === "delivering").length,
    delivered: filteredOrders.filter((o) => o.status === "delivered").length,
    cancelled: filteredOrders.filter((o) => o.status === "cancelled").length,
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Relatórios</Text>
          <Text style={styles.subtitle}>Análise de vendas e performance</Text>
        </View>

        {/* Period Filter */}
        <View style={styles.periodContainer}>
          <Text style={styles.periodTitle}>Período:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {Object.entries(periodLabels).map(([key, label]) => (
              <TouchableOpacity
                key={key}
                style={[styles.periodButton, selectedPeriod === key && styles.periodButtonActive]}
                onPress={() => setSelectedPeriod(key as any)}
              >
                <Text style={[styles.periodText, selectedPeriod === key && styles.periodTextActive]}>{label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          {statsCards.map((card, index) => (
            <View key={index} style={[styles.statsCard, { width: cardWidth }]}>
              <View style={[styles.statsIcon, { backgroundColor: card.color }]}>
                <Ionicons name={card.icon as any} size={24} color="white" />
              </View>
              <Text style={styles.statsValue}>{card.value}</Text>
              <Text style={styles.statsTitle}>{card.title}</Text>
              <Text style={styles.statsSubtitle}>{card.subtitle}</Text>
            </View>
          ))}
        </View>

        {/* Top Products */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Produtos Mais Vendidos</Text>
          <View style={styles.topProductsContainer}>
            {topProducts.length > 0 ? (
              topProducts.map(([product, quantity], index) => (
                <View key={index} style={styles.productItem}>
                  <View style={styles.productRank}>
                    <Text style={styles.rankNumber}>{index + 1}</Text>
                  </View>
                  <View style={styles.productInfo}>
                    <Text style={styles.productName}>{product}</Text>
                    <Text style={styles.productQuantity}>{quantity} vendidos</Text>
                  </View>
                </View>
              ))
            ) : (
              <Text style={styles.noDataText}>Nenhum produto vendido no período</Text>
            )}
          </View>
        </View>

        {/* Status Analysis */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Análise por Status</Text>
          <View style={styles.statusContainer}>
            {Object.entries(statusAnalysis).map(([status, count]) => {
              const statusLabels = {
                pending: "Pendentes",
                confirmed: "Confirmados",
                preparing: "Preparando",
                delivering: "Em entrega",
                delivered: "Entregues",
                cancelled: "Cancelados",
              }

              const statusColors = {
                pending: "#FFA500",
                confirmed: "#4CAF50",
                preparing: "#2196F3",
                delivering: "#FF6B35",
                delivered: "#4CAF50",
                cancelled: "#F44336",
              }

              return (
                <View key={status} style={styles.statusItem}>
                  <View
                    style={[styles.statusDot, { backgroundColor: statusColors[status as keyof typeof statusColors] }]}
                  />
                  <Text style={styles.statusLabel}>{statusLabels[status as keyof typeof statusLabels]}</Text>
                  <Text style={styles.statusCount}>{count}</Text>
                </View>
              )
            })}
          </View>
        </View>

        {/* Performance Insights */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Insights de Performance</Text>
          <View style={styles.insightsContainer}>
            <View style={styles.insightItem}>
              <Ionicons name="trending-up" size={24} color="#4CAF50" />
              <View style={styles.insightText}>
                <Text style={styles.insightTitle}>Taxa de Conversão</Text>
                <Text style={styles.insightValue}>
                  {totalOrders > 0 ? Math.round((deliveredOrders.length / totalOrders) * 100) : 0}%
                </Text>
                <Text style={styles.insightSubtitle}>Pedidos entregues vs total</Text>
              </View>
            </View>

            <View style={styles.insightItem}>
              <Ionicons name="time" size={24} color="#FF6B35" />
              <View style={styles.insightText}>
                <Text style={styles.insightTitle}>Pedidos Ativos</Text>
                <Text style={styles.insightValue}>
                  {filteredOrders.filter((o) => ["confirmed", "preparing", "delivering"].includes(o.status)).length}
                </Text>
                <Text style={styles.insightSubtitle}>Em processamento</Text>
              </View>
            </View>

            <View style={styles.insightItem}>
              <Ionicons name="star" size={24} color="#2196F3" />
              <View style={styles.insightText}>
                <Text style={styles.insightTitle}>Produto Top</Text>
                <Text style={styles.insightValue}>{topProducts[0]?.[0] || "N/A"}</Text>
                <Text style={styles.insightSubtitle}>Mais vendido</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
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
    paddingVertical: 20,
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
  periodContainer: {
    backgroundColor: "white",
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  periodTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 10,
  },
  periodButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: "#F5F5F5",
  },
  periodButtonActive: {
    backgroundColor: "#FF6B35",
  },
  periodText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  periodTextActive: {
    color: "white",
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
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  statsTitle: {
    fontSize: 12,
    color: "#666",
    marginBottom: 2,
  },
  statsSubtitle: {
    fontSize: 10,
    color: "#999",
  },
  section: {
    backgroundColor: "white",
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 15,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  topProductsContainer: {
    gap: 10,
  },
  productItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },
  productRank: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#FF6B35",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  rankNumber: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  productQuantity: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  noDataText: {
    textAlign: "center",
    color: "#666",
    fontSize: 14,
    fontStyle: "italic",
  },
  statusContainer: {
    gap: 12,
  },
  statusItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  statusLabel: {
    flex: 1,
    fontSize: 14,
    color: "#333",
  },
  statusCount: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  insightsContainer: {
    gap: 15,
  },
  insightItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#F8F9FA",
    borderRadius: 10,
  },
  insightText: {
    marginLeft: 15,
    flex: 1,
  },
  insightTitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 2,
  },
  insightValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 2,
  },
  insightSubtitle: {
    fontSize: 12,
    color: "#999",
  },
})
