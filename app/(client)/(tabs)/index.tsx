import { useState, useEffect, useRef } from "react"
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Dimensions, TextInput, Animated, ScrollView } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { useCart } from "../../../contexts/CartContext"
import { useProductContext } from "../../../contexts/ProductContext"
import { useOrders } from "@/contexts/OrderContext"
import * as Location from 'expo-location'
import { FloatingRefreshButton } from "@/components/buttons/ButtonFloating"

const { width } = Dimensions.get("window")
const itemWidth = (width - 40) / 2



export default function ClientHomeScreen() {
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [refreshing, setRefreshing] = useState(false)
  const router = useRouter()
  const { addToCart, cartItems } = useCart()
  const { products, categories, fetchProductsNearby } = useProductContext()
  const { loadOrders } = useOrders()
  
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(30)).current

  useEffect(() => {
    loadOrders()
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      })
    ]).start()
  }, [])

  async function getProductFresh() {
    setRefreshing(true)
    const { status } = await Location.requestForegroundPermissionsAsync()
    if (status !== 'granted') {
      console.warn('Permissão de localização negada')
      setRefreshing(false)
      return
    }

    try {
      const location = await Location.getCurrentPositionAsync({})
      const { latitude, longitude } = location.coords
      await fetchProductsNearby(latitude, longitude)
    } catch (error) {
      console.warn('Erro ao buscar localização:', error)
    } finally {
      setRefreshing(false)
    }
  }

  useEffect(() => {
    getProductFresh()
  }, [])

  const filteredProducts = products.filter((product) => {
    const matchesCategory = selectedCategory == "all" || product.categoryId == selectedCategory
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const cartItemsCount = cartItems.reduce((sum, item) => sum + item.quantity, 0)

  const renderProduct = ({ item, index }: { item: (typeof products)[0], index: number }) => (
    <Animated.View 
      style={[
        styles.productCard, 
        { 
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }] 
        }
      ]}
    >
      <TouchableOpacity 
        activeOpacity={0.7}
        onPress={() => router.push(`/product/${item.id}`)}
      >
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: item.imageUrl || 'https://via.placeholder.com/150' }} 
            style={styles.productImage} 
            onError={(e) => console.log('Erro ao carregar imagem:', e.nativeEvent.error)}
          />
          <View style={styles.overlay} />
        </View>
        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={2}>
            {item.name}
          </Text>
          <Text style={styles.productPrice}>{item.price.toLocaleString("pt-AO")} Kz</Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity 
        style={styles.addButton} 
        onPress={() => addToCart(item)}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={20} color="white" />
      </TouchableOpacity>
    </Animated.View>
  )

  const renderCategory = ({ item }: { item: (typeof categories)[0] }) => (
    <TouchableOpacity
      style={[styles.categoryButton, selectedCategory === item.id && styles.categoryButtonActive]}
      onPress={() => setSelectedCategory(item.id)}
      activeOpacity={0.7}
    >
      <Ionicons 
        name={item.icon as any} 
        size={20} 
        color={selectedCategory === item.id ? "white" : "#FF6B35"} 
      />
      <Text style={[styles.categoryText, selectedCategory === item.id && styles.categoryTextActive]}>
        {item.name}
      </Text>
    </TouchableOpacity>
  )

  const renderEmptyList = () => (
    <View style={styles.emptyState}>
      <Ionicons name="search-outline" size={60} color="#DDD" />
      <Text style={styles.emptyTitle}>
        {searchQuery ? "Nenhum produto encontrado" : "Zona de entrega indisponível"}
      </Text>
      <Text style={styles.emptySubtitle}>
        {searchQuery 
          ? "Tente ajustar os termos da busca" 
          : "Quando disponível, os produtos aparecerão aqui."
        }
      </Text>
      {searchQuery && (
        <TouchableOpacity 
          style={styles.clearSearchButton}
          onPress={() => setSearchQuery('')}
        >
          <Text style={styles.clearSearchText}>Limpar busca</Text>
        </TouchableOpacity>
      )}
    </View>
  )

  return (
    <SafeAreaView style={styles.container}>
      {/* Header simplificado */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Olá!</Text>
          <Text style={styles.subtitle}>O que precisa hoje?</Text>
        </View>
        <TouchableOpacity 
          style={styles.cartButton} 
          onPress={() => router.push("/cart")}
          activeOpacity={0.7}
        >
          <Ionicons name="cart" size={24} color="#FF6B35" />
          {cartItemsCount > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{cartItemsCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Search com foco na usabilidade */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#999" />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar produtos..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
          clearButtonMode="while-editing"
        />
      </View>

      {/* Categorias com scroll suave */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesContainer}
        style={styles.categoriesScrollView}
      >
        {categories.map((category) => (
          <View key={category.id}>
            {renderCategory({ item: category })}
          </View>
        ))}
      </ScrollView>

      {/* Lista de produtos otimizada */}
      <FlatList
        data={filteredProducts}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.productsContainer}
        columnWrapperStyle={styles.productRow}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyList}
        refreshing={refreshing}
        onRefresh={getProductFresh}
      />
      
      <FloatingRefreshButton onRefresh={getProductFresh} />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "white",
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
    backgroundColor: "#f5f5f5",
    borderRadius: 20,
  },
  cartBadge: {
    position: "absolute",
    top: -5,
    right: -5,
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
    backgroundColor: "white",
    marginHorizontal: 20,
    marginVertical: 15,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: "#333",
  },
  categoriesScrollView: {
    maxHeight: 50,
    minHeight:50,
    marginBottom: 10,
  },
  categoriesContainer: {
    paddingHorizontal: 15,
  },
  categoryButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    paddingHorizontal: 16,
    paddingVertical: 8,
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
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
  productRow: {
    justifyContent: "space-between",
    marginBottom: 10,
  },
  productCard: {
    width: itemWidth,
    backgroundColor: "white",
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    overflow: "hidden",
    position: "relative",
  },
  imageContainer: {
    position: "relative",
  },
  productImage: {
    width: "100%",
    height: 130,
    backgroundColor: "#F5F5F5",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.02)",
  },
  productInfo: {
    padding: 12,
    paddingBottom: 40,
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
  },
  addButton: {
    backgroundColor: "#FF6B35",
    borderRadius: 20,
    width: 35,
    height: 35,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    bottom: 10,
    right: 10,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    paddingTop: 50,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginTop: 20,
    marginBottom: 10,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
  },
  clearSearchButton: {
    marginTop: 15,
    paddingVertical: 8,
    paddingHorizontal: 15,
    backgroundColor: "#FF6B35",
    borderRadius: 20,
  },
  clearSearchText: {
    color: "white",
    fontWeight: "600",
  },
})