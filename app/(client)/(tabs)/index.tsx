"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Dimensions, TextInput } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { useCart } from "../../../contexts/CartContext"
import { useProductContext } from "../../../contexts/ProductContext"
import {useOrders} from "@/contexts/OrderContext"
import * as Location from 'expo-location'

const { width } = Dimensions.get("window")
const itemWidth = (width - 45) / 2

/*
const products = [
  {
    id: "1",
    name: "Botija de Gás 13kg",
    price: 3500,
    image: "/placeholder.svg?height=150&width=150",
    category: "gas",
    description: "Botija de gás 13kg para uso doméstico",
    stock: 10,
  },
  {
    id: "2",
    name: "Botija de Gás 6kg",
    price: 2000,
    image: "/placeholder.svg?height=150&width=150",
    category: "gas",
    description: "Botija de gás 6kg ideal para pequenas famílias",
    stock: 15,
  },
  {
    id: "3",
    name: "Botija de Gás 45kg",
    price: 8500,
    image: "/placeholder.svg?height=150&width=150",
    category: "gas",
    description: "Botija de gás 45kg para uso comercial",
    stock: 5,
  },
  {
    id: "4",
    name: "Regulador de Gás",
    price: 1200,
    image: "/placeholder.svg?height=150&width=150",
    category: "accessories",
    description: "Regulador de pressão para botijas de gás",
    stock: 20,
  },
  {
    id: "5",
    name: "Mangueira de Gás 1m",
    price: 800,
    image: "/placeholder.svg?height=150&width=150",
    category: "accessories",
    description: "Mangueira flexível para conexão do gás",
    stock: 25,
  },
  {
    id: "6",
    name: "Kit Completo Gás",
    price: 4500,
    image: "/placeholder.svg?height=150&width=150",
    category: "kit",
    description: "Kit com botija 13kg + regulador + mangueira",
    stock: 8,
  },
]
*/
const categories = [
  { id: "all", name: "Todos", icon: "grid" },
  { id: "gas", name: "Botijas", icon: "flame" },
  { id: "accessories", name: "Acessórios", icon: "build" },
  { id: "kit", name: "Kits", icon: "cube" },
]

export default function ClientHomeScreen() {
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()
  const { addToCart, cartItems } = useCart()
  const { products, fetchProductsNearby } = useProductContext()
  const { loadOrders } = useOrders()

  useEffect(()=>{
      loadOrders();
  },[]);

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


  const filteredProducts = products.filter((product) => {
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const cartItemsCount = cartItems.reduce((sum, item) => sum + item.quantity, 0)

  const renderProduct = ({ item }: { item: (typeof products)[0] }) => (
    <TouchableOpacity style={styles.productCard} onPress={() => router.push(`/product/${item.id}`)}>
      <Image source={{ uri: item.image_url }} style={styles.productImage} />
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={styles.productPrice}>{item.price.toLocaleString("pt-AO")} Kz</Text>
        <TouchableOpacity style={styles.addButton} /*onPress={() => addToCart(item)}*/>
          <Ionicons name="add" size={20} color="white" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  )

  const renderCategory = ({ item }: { item: (typeof categories)[0] }) => (
    <TouchableOpacity
      style={[styles.categoryButton, selectedCategory === item.id && styles.categoryButtonActive]}
      onPress={() => setSelectedCategory(item.id)}
    >
      <Ionicons name={item.icon as any} size={20} color={selectedCategory === item.id ? "white" : "#FF6B35"} />
      <Text style={[styles.categoryText, selectedCategory === item.id && styles.categoryTextActive]}>{item.name}</Text>
    </TouchableOpacity>
  )

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Olá!</Text>
          <Text style={styles.subtitle}>O que precisa hoje?</Text>
        </View>
        <TouchableOpacity style={styles.cartButton} onPress={() => router.push("/cart")}>
          <Ionicons name="cart" size={24} color="#FF6B35" />
          {cartItemsCount > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{cartItemsCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#999" />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar produtos..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Categories */}
      <FlatList
        data={categories}
        renderItem={renderCategory}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesContainer}
      />

      {/* Products */}
      <FlatList
        data={filteredProducts}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.productsContainer}
        columnWrapperStyle={styles.productRow}
        showsVerticalScrollIndicator={false}
      />
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
  },
  greeting: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginTop: 2,
  },
  cartButton: {
    position: "relative",
    padding: 8,
  },
  cartBadge: {
    position: "absolute",
    top: 0,
    right: 0,
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
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    marginHorizontal: 20,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 25,
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
  },
  categoriesContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  categoryButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#FF6B35",
  },
  categoryButtonActive: {
    backgroundColor: "#FF6B35",
  },
  categoryText: {
    marginLeft: 5,
    fontSize: 14,
    fontWeight: "600",
    color: "#FF6B35",
  },
  categoryTextActive: {
    color: "white",
  },
  productsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  productRow: {
    justifyContent: "space-between",
  },
  productCard: {
    width: itemWidth,
    backgroundColor: "white",
    borderRadius: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productImage: {
    width: "100%",
    height: 120,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    backgroundColor: "#F5F5F5",
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 5,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FF6B35",
    marginBottom: 10,
  },
  addButton: {
    backgroundColor: "#FF6B35",
    borderRadius: 20,
    width: 35,
    height: 35,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "flex-end",
  },
})
