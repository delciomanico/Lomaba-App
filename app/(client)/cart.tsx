"use client"

import { useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { useCart } from "@/contexts/CartContext"
import { useOrders } from "@/contexts/OrderContext"
import { useAuth } from "@/contexts/AuthContext"
import { OrderItem } from "@/types/order"
import * as Location from "expo-location"

export default function CartScreen() {
  const { cartItems, updateQuantity, removeFromCart, getTotalPrice, clearCart } = useCart()
  const { createOrder } = useOrders()
  const { user } = useAuth()
  const router = useRouter()

  const [deliveryAddress, setDeliveryAddress] = useState("")
  const [customerName, setCustomerName] = useState(user?.name || "")
  const [customerPhone, setCustomerPhone] = useState(user?.phone || "")
  const [loading, setLoading] = useState(false)

  const deliveryFee = 500
  const subtotal = getTotalPrice()
  const total = subtotal + deliveryFee

  const handleQuantityChange = (productId: string, change: number) => {
    const item = cartItems.find((item) => item.id === productId)
    if (item) {
      const newQuantity = item.quantity + change
      if (newQuantity > 0) {
        updateQuantity(productId, newQuantity)
      }
    }
  }

  const handleCheckout = async () => {
    if (!deliveryAddress.trim()) {
      Alert.alert("Erro", "Por favor, informe uma descricao do endereço de entrega")
      return
    }

    if (!customerName.trim() || !customerPhone.trim()) {
      Alert.alert("Erro", "Por favor, preencha todos os dados")
      return
    }

    setLoading(true)
    try {
      const orderItems = cartItems.map((item) => ({
        product_id: item.id,
        unit_price: item.price,
        quantity: item.quantity,
      }))

      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== 'granted') {
        console.warn('Permissão de localização negada')
        return
      }

      const location = await Location.getCurrentPositionAsync({})
      const { latitude, longitude } = location.coords
      const orderId = await createOrder(orderItems as Omit<OrderItem, "id" | "order_id">[], deliveryAddress,latitude, longitude, customerName, customerPhone)

      clearCart()

      Alert.alert("Pedido Realizado!", "Seu pedido foi enviado com sucesso!", [
        {
          text: "Ver Pedido",
          onPress: () => router.replace(`/(client)/order/${orderId}`),
        },
      ])
    } catch (error) {
      Alert.alert("Erro", "Erro ao processar pedido. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  const renderCartItem = ({ item }: { item: any }) => (
    <View style={styles.cartItem}>
      <Image source={{ uri: item.image_url }} style={styles.itemImage} />
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemPrice}>{item.price.toLocaleString("pt-AO")} Kz</Text>
        <View style={styles.quantityContainer}>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => handleQuantityChange(item.id, -1)}
            disabled={item.quantity <= 1}
          >
            <Ionicons name="remove" size={16} color={item.quantity <= 1 ? "#CCC" : "#FF6B35"} />
          </TouchableOpacity>
          <Text style={styles.quantity}>{item.quantity}</Text>
          <TouchableOpacity style={styles.quantityButton} onPress={() => handleQuantityChange(item.id, 1)}>
            <Ionicons name="add" size={16} color="#FF6B35" />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.itemRight}>
        <TouchableOpacity style={styles.removeButton} onPress={() => removeFromCart(item.id)}>
          <Ionicons name="trash-outline" size={20} color="#F44336" />
        </TouchableOpacity>
        <Text style={styles.itemTotal}>{(item.price * item.quantity).toLocaleString("pt-AO")} Kz</Text>
      </View>


    </View>
  )

  const checkComponent = () => (
    <View style={styles.checkoutSection}>
      <View style={styles.deliveryForm}>
        <Text style={styles.formTitle}>Dados da Entrega</Text>

        <TextInput
          style={styles.input}
          placeholder="Nome completo"
          value={customerName}
          onChangeText={setCustomerName}
        />

        <TextInput
          style={styles.input}
          placeholder="Telefone"
          value={customerPhone}
          onChangeText={setCustomerPhone}
          keyboardType="phone-pad"
        />

        <TextInput
          style={[styles.input, styles.addressInput]}
          placeholder="Rotulo do Endereço de entrega"
          value={deliveryAddress}
          onChangeText={setDeliveryAddress}
          multiline
          numberOfLines={3}
          placeholderTextColor={"#aaa"}
        />
      </View>

      <View style={styles.summary}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Subtotal</Text>
          <Text style={styles.summaryValue}>{subtotal.toLocaleString("pt-AO")} Kz</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Taxa de entrega</Text>
          <Text style={styles.summaryValue}>{deliveryFee.toLocaleString("pt-AO")} Kz</Text>
        </View>
        <View style={[styles.summaryRow, styles.totalRow]}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>{total.toLocaleString("pt-AO")} Kz</Text>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.checkoutButton, loading && styles.checkoutButtonDisabled]}
        onPress={handleCheckout}
        disabled={loading}
      >
        <Text style={styles.checkoutButtonText}>{loading ? "Processando..." : "Finalizar Pedido"}</Text>
      </TouchableOpacity>
    </View>

  )
  if (cartItems.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.title}>Carrinho</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.emptyState}>
          <Ionicons name="cart-outline" size={80} color="#CCC" />
          <Text style={styles.emptyTitle}>Carrinho vazio</Text>
          <Text style={styles.emptySubtitle}>Adicione produtos para continuar</Text>
          <TouchableOpacity style={styles.shopButton} onPress={() => router.back()}>
            <Text style={styles.shopButtonText}>Continuar Comprando</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
  <KeyboardAvoidingView
    behavior={Platform.OS === "ios" ? "padding" : "height"}
    style={styles.keyboardView}
    keyboardVerticalOffset={Platform.select({ ios: 60, android: 0 })}
  >
    {/* Cabeçalho Fixo */}
    <View style={styles.header}>
      <TouchableOpacity onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color="#333" />
      </TouchableOpacity>
      <Text style={styles.title}>Carrinho ({cartItems.length})</Text>
      <TouchableOpacity onPress={clearCart}>
        <Text style={styles.clearText}>Limpar</Text>
      </TouchableOpacity>
    </View>

    {/* Conteúdo Rolável */}
    <ScrollView
      contentContainerStyle={styles.scrollContainer}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="interactive"
    >
      {/* Formulário de Entrega (parte superior) */}
      <View style={styles.deliveryForm}>
        <Text style={styles.formTitle}>Dados da Entrega</Text>
        
        <TextInput
          style={styles.input}
          placeholder="Nome completo"
          value={customerName}
          onChangeText={setCustomerName}
          returnKeyType="next"
        />

        <TextInput
          style={styles.input}
          placeholder="Telefone"
          value={customerPhone}
          onChangeText={setCustomerPhone}
          keyboardType="phone-pad"
          returnKeyType="next"
        />

        <TextInput
          style={[styles.input, styles.addressInput]}
          placeholder="Endereço de entrega"
          value={deliveryAddress}
          onChangeText={setDeliveryAddress}
          multiline
          numberOfLines={3}
          placeholderTextColor="#aaa"
          returnKeyType="done"
        />
      </View>

      {/* Lista de Itens */}
      {cartItems.map((item) => (
        <View key={item.id} style={styles.cartItem}>
          <Image source={{ uri: item.image_url }} style={styles.itemImage} />
          <View style={styles.itemInfo}>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemPrice}>{item.price.toLocaleString("pt-AO")} Kz</Text>
            <View style={styles.quantityContainer}>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => handleQuantityChange(item.id, -1)}
                disabled={item.quantity <= 1}
              >
                <Ionicons name="remove" size={16} color={item.quantity <= 1 ? "#CCC" : "#FF6B35"} />
              </TouchableOpacity>
              <Text style={styles.quantity}>{item.quantity}</Text>
              <TouchableOpacity 
                style={styles.quantityButton} 
                onPress={() => handleQuantityChange(item.id, 1)}
              >
                <Ionicons name="add" size={16} color="#FF6B35" />
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.itemRight}>
            <TouchableOpacity 
              style={styles.removeButton} 
              onPress={() => removeFromCart(item.id)}
            >
              <Ionicons name="trash-outline" size={20} color="#F44336" />
            </TouchableOpacity>
            <Text style={styles.itemTotal}>{(item.price * item.quantity).toLocaleString("pt-AO")} Kz</Text>
          </View>
        </View>
      ))}

      {/* Resumo do Pedido */}
      <View style={styles.summary}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Subtotal</Text>
          <Text style={styles.summaryValue}>{subtotal.toLocaleString("pt-AO")} Kz</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Taxa de entrega</Text>
          <Text style={styles.summaryValue}>{deliveryFee.toLocaleString("pt-AO")} Kz</Text>
        </View>
        <View style={[styles.summaryRow, styles.totalRow]}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>{total.toLocaleString("pt-AO")} Kz</Text>
        </View>
      </View>
    </ScrollView>

    {/* Botão Fixo na Parte Inferior */}
    <View style={styles.footer}>
      <TouchableOpacity
        style={[styles.checkoutButton, loading && styles.checkoutButtonDisabled]}
        onPress={handleCheckout}
        disabled={loading}
      >
        <Text style={styles.checkoutButtonText}>
          {loading ? "Processando..." : "Finalizar Pedido"}
        </Text>
      </TouchableOpacity>
    </View>
  </KeyboardAvoidingView>
</SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContainer: {
    paddingBottom: 100, // Espaço para o botão fixo
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  deliveryForm: {
    padding: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
  },
  addressInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  cartItem: {
    flexDirection: 'row',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 15,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
 
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  clearText: {
    fontSize: 14,
    color: "#FF6B35",
    fontWeight: "600",
  },
  cartList: {
    padding: 20,
  },
  
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 10,
    backgroundColor: "#F5F5F5",
  },
  itemInfo: {
    flex: 1,
    marginLeft: 15,
  },
  itemName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 5,
  },
  itemPrice: {
    fontSize: 14,
    color: "#FF6B35",
    fontWeight: "bold",
    marginBottom: 10,
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  quantityButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
  },
  quantity: {
    marginHorizontal: 15,
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  itemRight: {
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  removeButton: {
    padding: 5,
  },
  itemTotal: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  checkoutSection: {
    backgroundColor: "#F8F9FA",
    paddingTop: 20,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },

  summary: {
    backgroundColor: "white",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#E5E5E5",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
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
    marginBottom: 0,
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
  checkoutButton: {
    backgroundColor: "#FF6B35",
    marginHorizontal: 20,
    marginVertical: 20,
    paddingVertical: 15,
    borderRadius: 25,
  },
  checkoutButtonDisabled: {
    opacity: 0.6,
  },
  checkoutButtonText: {
    color: "white",
    fontSize: 18,
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
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginTop: 20,
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 30,
  },
  shopButton: {
    backgroundColor: "#FF6B35",
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  shopButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
})
