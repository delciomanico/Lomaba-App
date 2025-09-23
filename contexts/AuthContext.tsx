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
  updateUser: (id: string | undefined, name: string | undefined, email: string | undefined, phone: string | undefined) => Promise<RegisterResult>
  changePassword: (newPassword: string, currentPassword:string, confirmPassword: string) => Promise<RegisterResult>
  logout: () => void
  me: () => Promise<RegisterResult>
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

  const updateUser = async (
    id: string | undefined,
    name: string | undefined,
    email: string | undefined,
    phone: string | undefined,
  ): Promise<RegisterResult> => {

    try {
      const token = await AsyncStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/user`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: id,
          name: name,
          email: email,
          phone: phone,
        }),
      })

      
      
      if (!response.ok) {
        if (response.status === 401) {
          logout();
        }
      }
     
      const data = await response.json()
      if (!data.success) {
        return { success: false, error: "Erro ao editar informações." }
      }
      return { success: true };

    } catch (error) {
      return { success: false, error: "Erro ao editar informações." + error }
    }
  }

  const me = async (): Promise<RegisterResult> => {

    try {
      if (!user)
        throw new Error("not exist user");
      const token = await AsyncStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/user/${user.id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'authorization': `Bearer ${token}`,
        },
      })

      const data = await response.json()
      if (!data) {
        throw new Error(data.message || 'Falha ao autenticar.')
      }

      const loggedInUser: User = {
        id: data.id,
        email: data.email,
        name: data.name,
        phone: data.phone,
        type: data.userType
      }

      setUser(loggedInUser)
      return { success: true }
    } catch (error) {

      return { success: false, error: "Erro ao atualizar os dados" }
    }

  }

  const changePassword = async (newPassword: string, currentPassword:string, confirmPassword: string): Promise<RegisterResult> => {

    try {
      if (!user)
        throw new Error("not exist user");
      const token = await AsyncStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/changePassword`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({newPassword, currentPassword, confirmPassword, email: user.email})
      })

      const data = await response.json()
      if (!data.success) {
        throw new Error(data.message || 'Falha ao alterar senha.')
      }
      return { success: true }
    } catch (error) {

      return { success: false, error: "Erro ao atualizar os senha" }
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
      await AsyncStorage.removeItem('authToken');

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
        updateUser,
        logout,
        me,
        changePassword,
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