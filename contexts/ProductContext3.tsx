import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase' // ajuste o path conforme seu projeto

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
}

const ProductContext = createContext<ProductContextProps | undefined>(undefined)

export const ProductProvider = ({ children }: { children: React.ReactNode }) => {
    const [products, setProducts] = useState<Product[]>([])
    const [zonas, setZonas] = useState<Zona[]>([])

    const fetchProductsNearby = async (lat: number, lng: number) => {

        const { data, error } = await supabase.rpc('get_products_nearby', {
            user_lat: lat,
            user_lng: lng,
        })

        if (error) {
            console.error('Erro ao buscar produtos próximos:', error)
            return
        }
        setProducts(data)
    }

    const isUserWithinZone = async (lat: number, lng: number, zonaId: string): Promise<boolean> => {
        const { data, error } = await supabase.rpc('is_within_zone', {
            user_lat: lat,
            user_lng: lng,
            zone_id: zonaId,
        })
        if (error) {
            console.error('Erro ao verificar zona:', error)
            return false
        }
        return data
    }

    const createOrder = async (order: OrderInput) => {
        const { customerId, providerId, items, deliveryAddress, deliveryFee, customerName, customerPhone } = order
        const totalAmount = items.reduce((sum, item) => sum + item.unit_price * item.quantity, 0)

        const { data: orderData, error: orderError } = await supabase
            .from('orders')
            .insert([{
                customer_id: customerId,
                provider_id: providerId,
                status: 'pending',
                total_amount: totalAmount,
                delivery_fee: deliveryFee,
                delivery_address: deliveryAddress,
                customer_name: customerName,
                customer_phone: customerPhone,
            }])
            .select()
            .single()

        if (orderError) {
            console.error('Erro ao criar pedido:', orderError)
            throw orderError
        }

        const itemsToInsert = items.map(item => ({
            order_id: orderData.id,
            product_id: item.product_id,
            quantity: item.quantity,
            unit_price: item.unit_price,
            total_price: item.quantity * item.unit_price
        }))

        const { error: itemsError } = await supabase.from('order_items').insert(itemsToInsert)
        if (itemsError) {
            console.error('Erro ao inserir itens:', itemsError)
            throw itemsError
        }

        return orderData
    }

    return (
        <ProductContext.Provider value={{
            products,
            zonas,
            fetchProductsNearby,
            isUserWithinZone,
            createOrder,
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
