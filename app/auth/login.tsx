"use client"

import { useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native"
import { useRouter } from "expo-router"
import { SafeAreaView } from "react-native-safe-area-context"
import { useAuth } from "../../contexts/AuthContext"

export default function LoginScreen() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [userType, setUserType] = useState<"client" | "provider">("client")
  const [loading, setLoading] = useState(false)

  const router = useRouter()
  const { login } = useAuth()

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Erro", "Preencha todos os campos")
      return
    }
    router.replace("/(client)/(tabs)")

    setLoading(true)
    try {
      const verif = await login(email, password, userType)
      if (verif.success) {
        if (userType === "client") {
          router.replace("/(client)/(tabs)")
        } else {
          router.replace("/(provider)/(tabs)")
        }
      }else
      {
        Alert.alert("Erro", "Credenciais inválidas")
      }
    } catch (error) {
      Alert.alert("Erro", "Credenciais inválidas")
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboardView}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={styles.backButton}>← Voltar</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <Text style={styles.title}>Entrar</Text>
            <Text style={styles.subtitle}>Acesse sua conta LOMBA</Text>

            <View style={styles.userTypeContainer}>
              <TouchableOpacity
                style={[styles.userTypeButton, userType === "client" && styles.userTypeButtonActive]}
                onPress={() => setUserType("client")}
              >
                <Text style={[styles.userTypeText, userType === "client" && styles.userTypeTextActive]}>Cliente</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.userTypeButton, userType === "provider" && styles.userTypeButtonActive]}
                onPress={() => setUserType("provider")}
              >
                <Text style={[styles.userTypeText, userType === "provider" && styles.userTypeTextActive]}>
                  Fornecedor
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.form}>

              <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                placeholderTextColor={"#aaa"}
              />
              <TextInput
                style={styles.input}
                placeholder="Senha"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                placeholderTextColor={"#aaa"}
              />

              <TouchableOpacity
                style={[styles.loginButton, loading && styles.loginButtonDisabled]}
                onPress={handleLogin}
                disabled={loading}
              >
                <Text style={styles.loginButtonText}>{loading ? "Entrando..." : "Entrar"}</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => router.push("/auth/register")}>
                <Text style={styles.registerLink}>Não tem conta? Criar conta</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  backButton: {
    fontSize: 16,
    color: "#FF6B35",
    fontWeight: "600",
  },
  content: {
    flex: 1,
    paddingHorizontal: 30,
    paddingTop: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 40,
  },
  userTypeContainer: {
    flexDirection: "row",
    marginBottom: 30,
    backgroundColor: "#F5F5F5",
    borderRadius: 25,
    padding: 4,
  },
  userTypeButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 20,
  },
  userTypeButtonActive: {
    backgroundColor: "#FF6B35",
  },
  userTypeText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
  },
  userTypeTextActive: {
    color: "white",
  },
  form: {
    flex: 1,
  },
  input: {
    backgroundColor: "#F5F5F5",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 25,
    fontSize: 16,
    marginBottom: 20,
  },
  loginButton: {
    backgroundColor: "#FF6B35",
    paddingVertical: 15,
    borderRadius: 25,
    marginTop: 20,
    marginBottom: 20,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  registerLink: {
    color: "#FF6B35",
    fontSize: 16,
    textAlign: "center",
    fontWeight: "600",
  },
})
