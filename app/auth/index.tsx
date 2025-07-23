"use client"
import { View, Text, StyleSheet, TouchableOpacity, Dimensions , Image} from "react-native"
import { useRouter } from "expo-router"
import { SafeAreaView } from "react-native-safe-area-context"

const { width } = Dimensions.get("window")

export default function AuthWelcome() {
  const router = useRouter()

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <View style={styles.logo}>
             <Image
                    source={require('@/assets/icons/logo.png')}
                    style={{width: "100%", height: "100%"}}
                    resizeMode='contain'
                  />
          </View>
          <Text style={styles.subtitle}>Delivery de Gás</Text>
          <Text style={styles.description}>Peça seu gás com facilidade e receba em casa</Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.loginButton} onPress={() => router.push("/auth/login")}>
            <Text style={styles.loginButtonText}>Entrar</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.registerButton} onPress={() => router.push("/auth/register")}>
            <Text style={styles.registerButtonText}>Criar Conta</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FF6B35",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 80,
  },
  logo: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  logoText: {
    fontSize: 40,
    fontWeight: "bold",
    color: "#FF6B35",
  },
  subtitle: {
    fontSize: 24,
    color: "white",
    fontWeight: "600",
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: "white",
    textAlign: "center",
    opacity: 0.9,
  },
  buttonContainer: {
    width: "100%",
  },
  loginButton: {
    backgroundColor: "white",
    paddingVertical: 15,
    borderRadius: 25,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  loginButtonText: {
    color: "#FF6B35",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  registerButton: {
    backgroundColor: "transparent",
    paddingVertical: 15,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: "white",
  },
  registerButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
})
