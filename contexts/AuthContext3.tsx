"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { supabase } from "../lib/supabase"

interface User {
  id: string | undefined
  name: string
  email: string
  phone: string
  type: "client" | "provider"
}

interface AuthContextType {
  user: User | null
  userType: "client" | "provider" | null
  login: (email: string, password: string, type: "client" | "provider") => Promise<RegisterResult>
  register: (name: string, email: string, phone: string, password: string, type: "client" | "provider") => Promise<RegisterResult>
  logout: () => void
  loading: boolean
}

type RegisterResult =
  | { success: true }
  | { success: false; error: string }


const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userType, setUserType] = useState<"client" | "provider" | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate checking for stored auth data
    setTimeout(() => {
      setLoading(false)
    }, 1000)
  }, [])

  const login = async (
    email: string,
    password: string,
    type: 'client' | 'provider'
  ): Promise<RegisterResult> => {
    try {
      // 1. Autentica no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (authError || !authData.user) {
        throw authError || new Error('Falha ao autenticar.')
      }

      const userId = authData.user.id

      // 2. Busca dados adicionais na tabela users
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('user_type, user_id, email, phone, name')
        .eq('user_id', userId)
        .single()

      if (userError || !userData) {
        throw userError || new Error('Usuário não encontrado na tabela de metadados.')
      }

      // 3. Valida o tipo do usuário
      if (userData.user_type !== type) {
        // Opcional: deslogar usuário se tipo for inválido
        await supabase.auth.signOut()
        throw new Error('Usuário não autorizado: tipo inválido.')
      }

      // 4. Define usuário na aplicação
      const mockUser: User = {
        id: userData.user_id,
        email: userData.email,
        name: userData.name,
        phone: userData.phone,
        type: userData.user_type
      }

      setUser(mockUser)
      setUserType(type)

      return { success: true }
    } catch (err: any) {
      console.error('Erro no login:', err.message || err)
      return { success: false, error: err.message || 'Erro desconhecido ao autenticar.' }
    }
  }

  const register = async (
    name: string,
    email: string,
    phone: string,
    password: string,
    type: "client" | "provider",
  ): Promise<RegisterResult> => {
    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            phone,
            user_type: type
          }
        }
      })


      if (error) {
        console.log("Erro no cadastro:", error.message)
        return { success: false, error: error.message }
      }

      if (!session) {
        console.log("Usuário não retornado. Talvez precise confirmar o e-mail.")
        return { success: false, error: "Usuário não retornado. Confirme o e-mail." }
      }
      const userId  = session.user.id;

      const { error: insertError } = await supabase.from('users').insert([
        {
          user_id: userId,
          email,
          name,
          phone,
          user_type: type
        }
      ])


      if (insertError) {
        await supabase.auth.admin.deleteUser(userId)
        throw insertError
      }

      const newUser: User = {
        id: userId,
        email,
        name,
        phone,
        type
      }

      setUser(newUser)
      setUserType(type)

      return { success: true }

    } catch (err: any) {
      console.error("Erro inesperado:", err.message || err)
      return { success: false, error: err.message || "Erro desconhecido" }
    }
  }

  const logout = () => {
    setUser(null)
    setUserType(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        userType,
        login,
        register,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
