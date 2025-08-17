"use client"

import { useState , useEffect} from "react"
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Alert } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { useRouter, useLocalSearchParams } from "expo-router"
import { useCart } from "../../../contexts/CartContext"
import { useProductContext } from "../../../contexts/ProductContext"
import * as Location from 'expo-location'
/*
const products = [
  {
    id: "1",
    name: "Botija de Gás 13kg",
    price: 3500,
    image: "/placeholder.svg?height=300&width=300",
    category: "gas",
    description:
      "Botija de gás 13kg para uso doméstico. Ideal para famílias de 4-6 pessoas. Duração média de 30-45 dias.",
    stock: 10,
    specifications: [
      "Peso: 13kg",
      "Capacidade: 13 litros",
      "Material: Aço carbono",
      "Válvula: Rosca padrão",
      "Certificação: INMETRO",
    ],
    features: ["Alta durabilidade", "Segurança garantida", "Fácil instalação", "Compatível com todos os fogões"],
  },
  {
    id: "2",
    name: "Botija de Gás 6kg",
    price: 2000,
    image: "/placeholder.svg?height=300&width=300",
    category: "gas",
    description: "Botija de gás 6kg ideal para pequenas famílias ou uso esporádico. Compacta e fácil de manusear.",
    stock: 15,
    specifications: [
      "Peso: 6kg",
      "Capacidade: 6 litros",
      "Material: Aço carbono",
      "Válvula: Rosca padrão",
      "Certificação: INMETRO",
    ],
    features: ["Tamanho compacto", "Fácil transporte", "Ideal para apartamentos", "Economia de espaço"],
  },
  {
    id: "3",
    name: "Botija de Gás 45kg",
    price: 8500,
    image: "/placeholder.svg?height=300&width=300",
    category: "gas",
    description:
      "Botija de gás 45kg para uso comercial. Ideal para restaurantes, padarias e estabelecimentos comerciais.",
    stock: 5,
    specifications: [
      "Peso: 45kg",
      "Capacidade: 45 litros",
      "Material: Aço carbono reforçado",
      "Válvula: Industrial",
      "Certificação: INMETRO",
    ],
    features: ["Alta capacidade", "Uso comercial", "Durabilidade superior", "Válvula industrial"],
  },
  {
    id: "4",
    name: "Regulador de Gás",
    price: 1200,
    image: "/placeholder.svg?height=300&width=300",
    category: "accessories",
    description:
      "Regulador de pressão para botijas de gás. Controla a pressão do gás garantindo segurança e eficiência.",
    stock: 20,
    specifications: ["Pressão: 2,8 kPa", "Material: Latão", "Rosca: 1/4 polegada", "Certificação: INMETRO"],
    features: ["Controle de pressão", "Material resistente", "Fácil instalação", "Segurança garantida"],
  },
  {
    id: "5",
    name: "Mangueira de Gás 1m",
    price: 800,
    image: "/placeholder.svg?height=300&width=300",
    category: "accessories",
    description: "Mangueira flexível para conexão do gás. Material resistente e flexível para instalação segura.",
    stock: 25,
    specifications: [
      "Comprimento: 1 metro",
      "Material: Borracha sintética",
      "Pressão máxima: 5 kPa",
      "Certificação: INMETRO",
    ],
    features: ["Material flexível", "Resistente a vazamentos", "Fácil instalação", "Durabilidade comprovada"],
  },
  {
    id: "6",
    name: "Kit Completo Gás",
    price: 4500,
    image: "/placeholder.svg?height=300&width=300",
    category: "kit",
    description: "Kit completo com botija 13kg + regulador + mangueira. Tudo que você precisa para começar a usar gás.",
    stock: 8,
    specifications: ["Botija: 13kg", "Regulador: 2,8 kPa", "Mangueira: 1 metro", "Certificação: INMETRO"],
    features: ["Kit completo", "Pronto para usar", "Economia garantida", "Instalação incluída"],
  },
]
*/


export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams()
  const router = useRouter()
  const { addToCart, cartItems } = useCart()
  const [quantity, setQuantity] = useState(1)

  const { products, fetchProductsNearby } = useProductContext()



  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== 'granted') {
        console.warn('Permissão de localização negada')
        return
      }

      const location = await Location.getCurrentPositionAsync({})
      const { latitude, longitude } = location.coords
      fetchProductsNearby(latitude, longitude)
    })()
  }, [])
  const product = products.find((p) => p.id == id)
  if (!product) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.title}>Produto</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Produto não encontrado</Text>
        </View>
      </SafeAreaView>
    )
  }

  const cartItem = cartItems.find((item) => item.id === product.id)
  const cartQuantity = cartItem ? cartItem.quantity : 0

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart(product)
    }
    Alert.alert("Sucesso!", `${quantity} ${product.name} adicionado(s) ao carrinho`, [
      { text: "Continuar comprando", style: "cancel" },
      { text: "Ver carrinho", onPress: () => router.push("/cart") },
    ])
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Detalhes</Text>
        <TouchableOpacity onPress={() => router.push("/cart")}>
          <View style={styles.cartButton}>
            <Ionicons name="cart" size={24} color="#FF6B35" />
            {cartQuantity > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{cartQuantity}</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <Image source={{ uri: product.imageUrl }} style={styles.productImage} />

        <View style={styles.content}>
          <View style={styles.productHeader}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{product.name.toUpperCase()}</Text>
            </View>
          {/*  <View style={styles.stockInfo}>
              <Ionicons name="checkmark-circle" size={16} color={product.stock > 0 ? "#4CAF50" : "#F44336"} />
              <Text style={[styles.stockText, { color: product.stock > 0 ? "#4CAF50" : "#F44336" }]}>
                {product.stock > 0 ? `${product.stock} em estoque` : "Fora de estoque"}
              </Text>
            </View>
            */}
          </View>

          <Text style={styles.productName}>{product.name}</Text>
          <Text style={styles.productPrice}>{product.price.toLocaleString("pt-AO")} Kz</Text>

          <Text style={styles.sectionTitle}>Descrição</Text>
          <Text style={styles.description}>{product.description}</Text>

          {/* {product.specifications && (
            <>
              <Text style={styles.sectionTitle}>Especificações</Text>
              <View style={styles.specificationsList}>
                {product.specifications.map((spec, index) => (
                  <View key={index} style={styles.specificationItem}>
                    <Ionicons name="checkmark" size={16} color="#FF6B35" />
                    <Text style={styles.specificationText}>{spec}</Text>
                  </View>
                ))}
              </View>
            </>
          )}

          {product.features && (
            <>
              <Text style={styles.sectionTitle}>Características</Text>
              <View style={styles.featuresList}>
                {product.features.map((feature, index) => (
                  <View key={index} style={styles.featureItem}>
                    <Ionicons name="star" size={16} color="#FF6B35" />
                    <Text style={styles.featureText}>{feature}</Text>
                  </View>
                ))}
              </View>
            </>
          )}
            */}
        </View>
      </ScrollView>

      <View style={styles.bottomSection}>
        <View style={styles.quantitySection}>
          <Text style={styles.quantityLabel}>Quantidade:</Text>
          <View style={styles.quantityControls}>
            <TouchableOpacity
              style={[styles.quantityButton, quantity <= 1 && styles.quantityButtonDisabled]}
              onPress={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={quantity <= 1}
            >
              <Ionicons name="remove" size={20} color={quantity <= 1 ? "#CCC" : "#FF6B35"} />
            </TouchableOpacity>
            <Text style={styles.quantityValue}>{quantity}</Text>
            <TouchableOpacity
              style={[styles.quantityButton, quantity >= product.stock_quantity && styles.quantityButtonDisabled]}
              onPress={() => setQuantity(quantity + 1)}
              disabled={quantity >= 5}
            >
              <Ionicons name="add" size={20} color={quantity >= product.stock_quantity ? "#CCC" : "#FF6B35"} />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.addToCartButton, product.stock_quantity === 0 && styles.addToCartButtonDisabled]}
          onPress={handleAddToCart}
          disabled={false}
        >
          <Text style={styles.addToCartButtonText}>
            {`Adicionar - ${(product.price * quantity).toLocaleString("pt-AO")} Kz`}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  cartButton: {
    position: "relative",
  },
  cartBadge: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "#FF6B35",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  cartBadgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  productImage: {
    width: "100%",
    height: 300,
    backgroundColor: "#F5F5F5",
  },
  content: {
    padding: 20,
  },
  productHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  categoryBadge: {
    backgroundColor: "#FF6B35",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  categoryText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  stockInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  stockText: {
    marginLeft: 5,
    fontSize: 14,
    fontWeight: "600",
  },
  productName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  productPrice: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FF6B35",
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginTop: 20,
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: "#666",
    lineHeight: 24,
  },
  specificationsList: {
    marginBottom: 10,
  },
  specificationItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  specificationText: {
    marginLeft: 10,
    fontSize: 14,
    color: "#666",
  },
  featuresList: {
    marginBottom: 10,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  featureText: {
    marginLeft: 10,
    fontSize: 14,
    color: "#666",
  },
  bottomSection: {
    backgroundColor: "#F8F9FA",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: "#E5E5E5",
  },
  quantitySection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  quantityLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  quantityControls: {
    flexDirection: "row",
    alignItems: "center",
  },
  quantityButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },
  quantityButtonDisabled: {
    backgroundColor: "#F5F5F5",
  },
  quantityValue: {
    marginHorizontal: 20,
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  addToCartButton: {
    backgroundColor: "#FF6B35",
    paddingVertical: 15,
    borderRadius: 25,
  },
  addToCartButtonDisabled: {
    backgroundColor: "#CCC",
  },
  addToCartButtonText: {
    color: "white",
    fontSize: 18,
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
