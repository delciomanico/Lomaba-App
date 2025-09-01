import AsyncStorage from "@react-native-async-storage/async-storage"
import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { API_BASE_URL } from "@/constants/global"

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
    // Verificar token armazenado (localStorage/AsyncStorage) ao inicializar
    const checkAuth = async () => {
      try {
        // Aqui você pode verificar se há um token JWT armazenado
        // e fazer uma requisição para validá-lo
        // Exemplo simplificado:
        const token = await AsyncStorage.getItem('authToken');
        //if (token) {
        //   const response = await fetch(`${API_BASE_URL}/validate-token`, {...});
        //   if (response.ok) {
        //     const userData = await response.json();
        //     setUser(userData);
        //     setUserType(userData.type);
        //   }
        // }
        setLoading(false)
      } catch (error) {
        console.error("Erro ao verificar autenticação:", error)
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (
    email: string,
    password: string,
    type: 'client' | 'provider'
  ): Promise<RegisterResult> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          user_type: type,
        }),
      })

      const data = await response.json()
      if (!data.user) {
        throw new Error(data.message || 'Falha ao autenticar.')
      }

      // Armazena o token (se necessário)
     await AsyncStorage.setItem('authToken', data.token);

      const loggedInUser: User = {
        id: data.user.id,
        email: data.user.email,
        name: data.user.name,
        phone: data.user.phone,
        type: data.user.userType
      }

      setUser(loggedInUser)
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
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          phone,
          password,
          user_type: type
        }),
      })

      const data = await response.json()

      if (!data.ok) {
        return { success: false, error: "Erro ao registrar usuário." }
      }

      // Armazena o token (se necessário)
      await AsyncStorage.setItem('authToken', data.token);

      const newUser: User = {
        id: data.user.id,
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

  const logout = async () => {
    try {
      // Opcional: chamar endpoint de logout na API
      // await fetch(`${API_BASE_URL}/auth/logout`, {
      //   method: 'POST',
      //   headers: {
      //     'Authorization': `Bearer ${await AsyncStorage.getItem('authToken')}`
      //   }
      // });

      // Remove o token armazenado
      // await AsyncStorage.removeItem('authToken');
      
      setUser(null)
      setUserType(null)
    } catch (error) {
      console.error("Erro ao fazer logout:", error)
    }
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