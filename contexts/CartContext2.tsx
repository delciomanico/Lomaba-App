import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

interface Product {
    category: string
    id: string
    name: string
    description: string
    price: number
    zona_id: string
    provider_id: string
    image_url: string
    stock_quantity: number
    is_active: boolean
    created_at: string
}

interface CartItem extends Product {
  quantity: number
}

interface CartContextType {
  cartItems: CartItem[]
  addToCart: (product: Product) => Promise<void>
  removeFromCart: (productId: string) => Promise<void>
  updateQuantity: (productId: string, quantity: number) => Promise<void>
  clearCart: () => Promise<void>
  getTotalPrice: () => number
  getTotalItems: () => number
  loading: boolean
  error: string | null
}

const API_BASE_URL = "https://sua-api-nodejs.com/api"; // Substitua pela URL da sua API

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Carrega o carrinho do usuário ao iniciar (se autenticado)
  useEffect(() => {
    const loadCart = async () => {
      try {
        setLoading(true)
        // Aqui você pode buscar o carrinho salvo na API
        // Exemplo:
        // const token = await AsyncStorage.getItem('authToken');
        // if (token) {
        //   const response = await fetch(`${API_BASE_URL}/cart`, {
        //     headers: {
        //       'Authorization': `Bearer ${token}`
        //     }
        //   });
        //   const data = await response.json();
        //   if (response.ok) {
        //     setCartItems(data.items);
        //   }
        // }
      } catch (err) {
        console.error("Erro ao carregar carrinho:", err)
        setError("Erro ao carregar carrinho")
      } finally {
        setLoading(false)
      }
    }

    loadCart()
  }, [])

  const syncCartWithAPI = async (updatedCart: CartItem[]) => {
    try {
      // Aqui você pode sincronizar o carrinho com a API
      // Exemplo:
      // const token = await AsyncStorage.getItem('authToken');
      // if (token) {
      //   await fetch(`${API_BASE_URL}/cart`, {
      //     method: 'PUT',
      //     headers: {
      //       'Content-Type': 'application/json',
      //       'Authorization': `Bearer ${token}`
      //     },
      //     body: JSON.stringify({ items: updatedCart })
      //   });
      // }
    } catch (err) {
      console.error("Erro ao sincronizar carrinho:", err)
      setError("Erro ao sincronizar carrinho")
    }
  }

  const addToCart = async (product: Product) => {
    try {
      setLoading(true)
      const updatedCart = [...cartItems]
      const existingItem = updatedCart.find((item) => item.id === product.id)

      if (existingItem) {
        existingItem.quantity += 1
      } else {
        updatedCart.push({ ...product, quantity: 1 })
      }

      setCartItems(updatedCart)
      await syncCartWithAPI(updatedCart)
    } catch (err) {
      console.error("Erro ao adicionar ao carrinho:", err)
      setError("Erro ao adicionar item ao carrinho")
    } finally {
      setLoading(false)
    }
  }

  const removeFromCart = async (productId: string) => {
    try {
      setLoading(true)
      const updatedCart = cartItems.filter((item) => item.id !== productId)
      setCartItems(updatedCart)
      await syncCartWithAPI(updatedCart)
    } catch (err) {
      console.error("Erro ao remover do carrinho:", err)
      setError("Erro ao remover item do carrinho")
    } finally {
      setLoading(false)
    }
  }

  const updateQuantity = async (productId: string, quantity: number) => {
    try {
      if (quantity <= 0) {
        await removeFromCart(productId)
        return
      }

      setLoading(true)
      const updatedCart = cartItems.map((item) => 
        item.id === productId ? { ...item, quantity } : item
      )
      setCartItems(updatedCart)
      await syncCartWithAPI(updatedCart)
    } catch (err) {
      console.error("Erro ao atualizar quantidade:", err)
      setError("Erro ao atualizar quantidade")
    } finally {
      setLoading(false)
    }
  }

  const clearCart = async () => {
    try {
      setLoading(true)
      setCartItems([])
      await syncCartWithAPI([])
    } catch (err) {
      console.error("Erro ao limpar carrinho:", err)
      setError("Erro ao limpar carrinho")
    } finally {
      setLoading(false)
    }
  }

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0)
  }

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0)
  }

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalPrice,
        getTotalItems,
        loading,
        error
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}