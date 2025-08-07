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

export default function RegisterScreen() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [userType, setUserType] = useState<"client" | "provider">("client")
  const [loading, setLoading] = useState(false)

  const router = useRouter()
  const { register } = useAuth()

  const handleRegister = async () => {
    if (!name || !phone || !email || !password || !confirmPassword) {
      Alert.alert("Erro", "Preencha todos os campos")
      return
    }

    if (password !== confirmPassword) {
      Alert.alert("Erro", "As senhas não coincidem")
      return
    }

    if (password.length < 6) {
      Alert.alert("Erro", "A senha deve ter pelo menos 6 caracteres")
      return
    }

    setLoading(true)
    try {

      const verif = await register(name, email, phone, password, userType)


      if (verif.success) {
        Alert.alert("Sucesso", "Conta criada com sucesso!", [
          {
            text: "OK",
            onPress: () => {
              if (userType === "client") {
                router.replace("/(client)/(tabs)")
              } else {
                router.replace("/(provider)/(tabs)")
              }
            },
          },
        ])
      }else {
        Alert.alert(verif.error)
      }


    } catch (error) {
      Alert.alert("Erro", "Erro ao criar conta")
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
            <Text style={styles.title}>Criar Conta</Text>
            <Text style={styles.subtitle}>Junte-se ao LOMBA</Text>

            <View style={styles.userTypeContainer}>
              <TouchableOpacity
                style={[styles.userTypeButton, userType === "client" && styles.userTypeButtonActive]}
                onPress={() => setUserType("client")}
              >
                <Text style={[styles.userTypeText, userType === "client" && styles.userTypeTextActive]}>Cliente</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.form}>
              <TextInput style={styles.input} placeholder="Nome completo" value={name} onChangeText={setName} placeholderTextColor={"#aaa"} />

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
                placeholder="Telefone"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
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
              <TextInput
                style={styles.input}
                placeholder="Confirmar senha"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                placeholderTextColor={"#aaa"}
              />

              <TouchableOpacity
                style={[styles.registerButton, loading && styles.registerButtonDisabled]}
                onPress={handleRegister}
                disabled={loading}
              >
                <Text style={styles.registerButtonText}>{loading ? "Criando conta..." : "Criar Conta"}</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => router.push("/auth/login")}>
                <Text style={styles.loginLink}>Já tem conta? Entrar</Text>
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
  registerButton: {
    backgroundColor: "#FF6B35",
    paddingVertical: 15,
    borderRadius: 25,
    marginTop: 20,
    marginBottom: 20,
  },
  registerButtonDisabled: {
    opacity: 0.6,
  },
  registerButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  loginLink: {
    color: "#FF6B35",
    fontSize: 16,
    textAlign: "center",
    fontWeight: "600",
  },
})
