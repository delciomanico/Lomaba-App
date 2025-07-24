"use client"

import { useEffect } from "react"
import { View, Text, StyleSheet, Dimensions, Image } from "react-native"
import { useRouter } from "expo-router"
import { useAuth } from "../contexts/AuthContext"

export default function SplashScreen() {
  const router = useRouter()
  const { user, userType } = useAuth()

  useEffect(() => {
    const timer = setTimeout(() => {
      if (user) {
        if (userType === "client") {
          router.replace("/(client)/(tabs)")
        } else {
          router.replace("/(provider)/(tabs)")
        }
      } else {
        router.replace("/auth")
      }
    }, 2000)

    return () => clearTimeout(timer)
  }, [user, userType])

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <View style={styles.logo}>
          <Image
        source={require('@/assets/icons/logo.png')}
        style={{width: "100%", height: "100%"}}
        resizeMode='contain'
      />
        </View>
        <Text style={styles.subtitle}>Delivery de Gás</Text>
      </View>
      <Text style={styles.loading}>Carregando...</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FF6B35",
    justifyContent: "center",
    alignItems: "center",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 50,
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  logoText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FF6B35",
  },
  subtitle: {
    fontSize: 18,
    color: "white",
    fontWeight: "600",
  },
  loading: {
    color: "white",
    fontSize: 16,
    marginTop: 30,
  },
})
