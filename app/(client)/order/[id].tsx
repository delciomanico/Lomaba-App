"use client"

import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, ActivityIndicator } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { useRouter, useLocalSearchParams } from "expo-router"
import { useOrders } from "../../../contexts/OrderContext"
import { useAuth } from "../../../contexts/AuthContext"
import { useState, useEffect } from "react"
import { Order } from "@/types/order"

const DEFAULT_IMAGE = "https://via.placeholder.com/150"

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

export default function OrderDetailScreen() {
    const { id } = useLocalSearchParams()
    const router = useRouter()
    const { getOrderById, updateOrderStatus } = useOrders()
    const { userType } = useAuth()
    const [order, setOrder] = useState<Order | null>(null)
    const [loading, setLoading] = useState(true)
    const [updating, setUpdating] = useState(false)

    useEffect(() => {
        const loadOrders = async () => {
            try {
                const orderData = await getOrderById(id as string)
                setOrder(orderData)
            } catch (error) {
                console.error("Failed to load order:", error)
                Alert.alert("Erro", "Não foi possível carregar os dados do pedido")
            } finally {
                setLoading(false)
            }
        }

        loadOrders()
    }, [])

    const formatDate = (dateString?: string) => {
        if (!dateString) return "N/A"
        const date = new Date(dateString)
        return date.toLocaleDateString("pt-AO", {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        })
    }

    const formatTime = (dateString?: string) => {
        if (!dateString) return "N/A"
        const date = new Date(dateString)
        return date.toLocaleTimeString("pt-AO", {
            hour: '2-digit',
            minute: '2-digit'
        })
    }

  

    const handleCancelOrder = async () => {
        setUpdating(true)
        try {
            await updateOrderStatus(order?.id as string, "cancelled")
            const updatedOrder = await getOrderById(id as string)
            router.replace("/history");
        } catch (error) {
            Alert.alert("Erro", "Não foi possível cancelar o pedido")
        } finally {
            setUpdating(false)
        }
    }


    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <ActivityIndicator size="large" color="#FF6B35" />
            </SafeAreaView>
        )
    }

    if (!order) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={24} color="#333" />
                    </TouchableOpacity>
                    <Text style={styles.title}>Pedido</Text>
                    <View style={{ width: 24 }} />
                </View>
                <View style={styles.notFound}>
                    <Text style={styles.notFoundText}>Pedido não encontrado</Text>
                </View>
            </SafeAreaView>
        )
    }

  
    const canCancel = order.status == "pending"

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.title}>Pedido #{order.id.slice(0, 10)}</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Order Status */}
                <View style={styles.statusSection}>
                    <View style={[styles.statusBadge, { backgroundColor: statusColors[order.status] }]}>
                        <Text style={styles.statusText}>{statusLabels[order.status]}</Text>
                    </View>
                    <Text style={styles.orderDate}>
                        Pedido realizado em {formatDate(order.created_at)} às {formatTime(order.created_at)}
                    </Text>
                    {order.estimated_delivery && order.status === "delivering" && (
                        <View style={styles.deliveryEstimate}>
                            <Ionicons name="time" size={16} color="#FF6B35" />
                            <Text style={styles.deliveryText}>
                                Entrega prevista: {formatTime(order.estimated_delivery)}
                            </Text>
                        </View>
                    )}
                </View>

                {/* Customer Info */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Informações do Cliente</Text>
                    <View style={styles.customerInfo}>
                        <View style={styles.infoRow}>
                            <Ionicons name="person" size={20} color="#666" />
                            <Text style={styles.infoText}>{order.customer_name}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Ionicons name="call" size={20} color="#666" />
                            <Text style={styles.infoText}>{order.customer_phone}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Ionicons name="location" size={20} color="#666" />
                            <Text style={styles.infoText}>{order.delivery_address}</Text>
                        </View>
                    </View>
                </View>
                 <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Informações do Entregador</Text>
                    <View style={styles.customerInfo}>
                        <View style={styles.infoRow}>
                            <Ionicons name="person" size={20} color="#666" />
                            <Text style={styles.infoText}>{order.provider && order.provider.map((value: { name: string })=> value.name)}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Ionicons name="call" size={20} color="#666" />
                            <Text style={styles.infoText}>{order.provider && order.provider.map((value: { phone: string })=> value.phone)}</Text>
                        </View>
                       
                    </View>
                </View>

                {/* Order Items */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Itens do Pedido</Text>
                    <View style={styles.itemsList}>
                        {order.items?.map((item) => (
                            <View key={item.id} style={styles.orderItem}>
                                <Image
                                    source={{ uri: item.product?.image_url || DEFAULT_IMAGE }}
                                    style={styles.itemImage}
                                />
                                <View style={styles.itemInfo}>
                                    <Text style={styles.itemName}>{item.product?.name || "Produto não encontrado"}</Text>
                                    <Text style={styles.itemPrice}>{item.unit_price.toLocaleString("pt-AO")} Kz</Text>
                                    <Text style={styles.itemQuantity}>Quantidade: {item.quantity}</Text>
                                </View>
                                <Text style={styles.itemTotal}>{(item.unit_price * item.quantity).toLocaleString("pt-AO")} Kz</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Order Summary */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Resumo do Pedido</Text>
                    <View style={styles.summary}>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Subtotal</Text>
                            <Text style={styles.summaryValue}>
                                {(order.total_amount - order.delivery_fee).toLocaleString("pt-AO")} Kz
                            </Text>
                        </View>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Taxa de entrega</Text>
                            <Text style={styles.summaryValue}>{order.delivery_fee.toLocaleString("pt-AO")} Kz</Text>
                        </View>
                        <View style={[styles.summaryRow, styles.totalRow]}>
                            <Text style={styles.totalLabel}>Total</Text>
                            <Text style={styles.totalValue}>{order.total_amount.toLocaleString("pt-AO")} Kz</Text>
                        </View>
                    </View>
                </View>

                {/* Order Timeline */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Status do Pedido</Text>
                    <View style={styles.timeline}>
                        {["pending", "confirmed", "preparing", "delivering", "delivered"].map((status, index) => {
                            const isCompleted =
                                ["pending", "confirmed", "preparing", "delivering", "delivered"].indexOf(order.status) >= index
                            const isCurrent = order.status === status

                            return (
                                <View key={status} style={styles.timelineItem}>
                                    <View style={styles.timelineLeft}>
                                        <View
                                            style={[
                                                styles.timelineDot,
                                                {
                                                    backgroundColor: isCompleted ? "#FF6B35" : "#E5E5E5",
                                                    borderColor: isCurrent ? "#FF6B35" : "transparent",
                                                    borderWidth: isCurrent ? 3 : 0,
                                                },
                                            ]}
                                        />
                                        {index < 4 && (
                                            <View style={[styles.timelineLine, { backgroundColor: isCompleted ? "#FF6B35" : "#E5E5E5" }]} />
                                        )}
                                    </View>
                                    <View style={styles.timelineContent}>
                                        <Text style={[styles.timelineTitle, { color: isCompleted ? "#333" : "#999" }]}>
                                            {statusLabels[status as keyof typeof statusLabels]}
                                        </Text>
                                        {isCurrent && <Text style={styles.timelineSubtitle}>Status atual</Text>}
                                    </View>
                                </View>
                            )
                        })}
                    </View>
                </View>
            </ScrollView>

            {/* Action Buttons */}
            
                <View style={styles.actionButtons}>
                    {canCancel && (
                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={handleCancelOrder}
                            disabled={updating}
                        >
                            {updating ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <Text style={styles.cancelButtonText}>Cancelar Pedido</Text>
                            )}
                        </TouchableOpacity>
                    )}

                    
                </View>
          
        </SafeAreaView>
    )
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
        paddingVertical: 15,
        backgroundColor: "white",
        borderBottomWidth: 1,
        borderBottomColor: "#E5E5E5",
    },
    title: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#333",
    },
    statusSection: {
        backgroundColor: "white",
        padding: 20,
        alignItems: "center",
        borderBottomWidth: 1,
        borderBottomColor: "#E5E5E5",
    },
    statusBadge: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
        marginBottom: 10,
    },
    statusText: {
        color: "white",
        fontSize: 16,
        fontWeight: "bold",
    },
    orderDate: {
        fontSize: 14,
        color: "#666",
        textAlign: "center",
    },
    deliveryEstimate: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 10,
        padding: 10,
        backgroundColor: "#FFF5F0",
        borderRadius: 8,
    },
    deliveryText: {
        marginLeft: 8,
        fontSize: 14,
        color: "#FF6B35",
        fontWeight: "600",
    },
    section: {
        backgroundColor: "white",
        marginTop: 10,
        padding: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#333",
        marginBottom: 15,
    },
    customerInfo: {
        gap: 12,
    },
    infoRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    infoText: {
        marginLeft: 12,
        fontSize: 16,
        color: "#333",
        flex: 1,
    },
    itemsList: {
        gap: 15,
    },
    orderItem: {
        flexDirection: "row",
        alignItems: "center",
        padding: 15,
        backgroundColor: "#F8F9FA",
        borderRadius: 10,
    },
    itemImage: {
        width: 50,
        height: 50,
        borderRadius: 8,
        backgroundColor: "#E5E5E5",
    },
    itemInfo: {
        marginLeft: 15,
        flex: 1,
    },
    itemName: {
        fontSize: 16,
        fontWeight: "600",
        color: "#333",
        marginBottom: 2,
    },
    itemPrice: {
        fontSize: 14,
        color: "#FF6B35",
        fontWeight: "bold",
        marginBottom: 2,
    },
    itemQuantity: {
        fontSize: 12,
        color: "#666",
    },
    itemTotal: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#333",
    },
    summary: {
        gap: 10,
    },
    summaryRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    summaryLabel: {
        fontSize: 16,
        color: "#666",
    },
    summaryValue: {
        fontSize: 16,
        color: "#333",
        fontWeight: "600",
    },
    totalRow: {
        borderTopWidth: 1,
        borderTopColor: "#E5E5E5",
        paddingTop: 10,
        marginTop: 5,
    },
    totalLabel: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#333",
    },
    totalValue: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#FF6B35",
    },
    timeline: {
        paddingLeft: 10,
    },
    timelineItem: {
        flexDirection: "row",
        alignItems: "flex-start",
    },
    timelineLeft: {
        alignItems: "center",
        marginRight: 15,
    },
    timelineDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginBottom: 5,
    },
    timelineLine: {
        width: 2,
        height: 30,
    },
    timelineContent: {
        flex: 1,
        paddingBottom: 20,
    },
    timelineTitle: {
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 2,
    },
    timelineSubtitle: {
        fontSize: 12,
        color: "#FF6B35",
        fontWeight: "600",
    },
    actionButtons: {
        flexDirection: "row",
        backgroundColor: "white",
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderTopWidth: 1,
        borderTopColor: "#E5E5E5",
        gap: 10,
    },
    cancelButton: {
        backgroundColor: "#F44336",
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        flex: 1,
    },
    cancelButtonText: {
        color: "white",
        fontSize: 14,
        fontWeight: "bold",
        textAlign: "center",
    },
    updateButton: {
        flex: 1,
        backgroundColor: "#FF6B35",
        paddingVertical: 12,
        borderRadius: 8,
    },
    updateButtonText: {
        color: "white",
        fontSize: 16,
        fontWeight: "bold",
        textAlign: "center",
    },
    notFound: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    notFoundText: {
        fontSize: 18,
        color: "#666",
    },
})