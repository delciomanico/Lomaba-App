import React, { createContext, useContext, useState, useEffect } from 'react'

type UserType = 'client' | 'provider'

interface User {
    id: string
    email: string
    name: string
    phone: string
    type: UserType
}

interface Zona {
    id: string
    name: string
    description: string
    latitude: number
    longitude: number
    radius_m: number
    created_at: string
}

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

interface OrderItem {
    product_id: string
    quantity: number
    unit_price: number
}

interface OrderInput {
    customerId: string
    providerId: string
    items: OrderItem[]
    deliveryAddress: string
    deliveryFee: number
    customerName: string
    customerPhone: string
}

interface ProductContextProps {
    products: Product[]
    zonas: Zona[]
    fetchProductsNearby: (lat: number, lng: number) => Promise<void>
    isUserWithinZone: (lat: number, lng: number, zonaId: string) => Promise<boolean>
    createOrder: (order: OrderInput) => Promise<any>
    loading: boolean
    error: string | null
}

const API_BASE_URL = "https://sua-api-nodejs.com/api"; // Substitua pela URL da sua API

const ProductContext = createContext<ProductContextProps | undefined>(undefined)

export const ProductProvider = ({ children }: { children: React.ReactNode }) => {
    const [products, setProducts] = useState<Product[]>([])
    const [zonas, setZonas] = useState<Zona[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
        try {
            setLoading(true)
            setError(null)
            // Obter token de autenticação (exemplo usando AsyncStorage)
            // const token = await AsyncStorage.getItem('authToken');
            const token = "seu-token-aqui"; // Substitua pela lógica real
            
            const response = await fetch(`${API_BASE_URL}${url}`, {
                ...options,
                headers: {
                    ...options.headers,
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error(await response.text())
            }

            return await response.json()
        } catch (err) {
            console.error("API request failed:", err)
            setError(err instanceof Error ? err.message : 'Erro desconhecido')
            throw err
        } finally {
            setLoading(false)
        }
    };

    const fetchProductsNearby = async (lat: number, lng: number) => {
        try {
            const data = await fetchWithAuth(`/products/nearby?lat=${lat}&lng=${lng}`)
            setProducts(data)
        } catch (err) {
            console.error('Erro ao buscar produtos próximos:', err)
            throw err
        }
    }

    const isUserWithinZone = async (lat: number, lng: number, zonaId: string): Promise<boolean> => {
        try {
            const data = await fetchWithAuth(`/zones/${zonaId}/contains?lat=${lat}&lng=${lng}`)
            return data.isWithin
        } catch (err) {
            console.error('Erro ao verificar zona:', err)
            return false
        }
    }

    const createOrder = async (order: OrderInput) => {
        try {
            const { customerId, providerId, items, deliveryAddress, deliveryFee, customerName, customerPhone } = order
            
            const orderData = await fetchWithAuth('/orders', {
                method: 'POST',
                body: JSON.stringify({
                    customerId,
                    providerId,
                    items,
                    deliveryAddress,
                    deliveryFee,
                    customerName,
                    customerPhone
                })
            })

            return orderData
        } catch (err) {
            console.error('Erro ao criar pedido:', err)
            throw err
        }
    }

    // Carregar zonas ao iniciar
    useEffect(() => {
        const loadZonas = async () => {
            try {
                const data = await fetchWithAuth('/zones')
                setZonas(data)
            } catch (err) {
                console.error('Erro ao carregar zonas:', err)
            }
        }
        
        loadZonas()
    }, [])

    return (
        <ProductContext.Provider value={{
            products,
            zonas,
            fetchProductsNearby,
            isUserWithinZone,
            createOrder,
            loading,
            error
        }}>
            {children}
        </ProductContext.Provider>
    )
}

export const useProductContext = () => {
    const context = useContext(ProductContext)
    if (!context) {
        throw new Error('useProductContext deve ser usado dentro de ProductProvider')
    }
    return context
}