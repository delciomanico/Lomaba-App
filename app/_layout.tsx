import { Stack } from "expo-router"
import { StatusBar } from "expo-status-bar"
import { AuthProvider } from "../contexts/AuthContext"
import { CartProvider } from "../contexts/CartContext"
import { OrderProvider } from "../contexts/OrderContext"
import { ProductProvider } from "../contexts/ProductContext"

export default function RootLayout() {
  return (
    <AuthProvider>
      <CartProvider>
        <OrderProvider>
          <ProductProvider>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="auth" />
              <Stack.Screen name="(client)" />
              <Stack.Screen name="(provider)" />
            </Stack>
            <StatusBar style="auto" />
          </ProductProvider>
        </OrderProvider>
      </CartProvider>
    </AuthProvider>
  )
}
