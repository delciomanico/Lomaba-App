import { useState, useEffect } from "react"
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, TextInput, Alert, ActivityIndicator } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Feather, Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { useAuth } from "@/contexts/AuthContext"

export default function ProfileScreen() {
  const { user, updateUser, me, changePassword } = useAuth()
  const [userData, setUserData] = useState({
    id: user?.id,
    name: user?.name,
    email: user?.email,
    phone: user?.phone,
  })

  const [editMode, setEditMode] = useState(false)
  const [passwordEditMode, setPasswordEditMode] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({ ...userData })
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  })

  const router = useRouter()

  useEffect(() => {
    // Simular carregamento de dados do usuário
    const loadUserData = async () => {

      setLoading(true)
      setTimeout(() => {
        setLoading(false)
      }, 800)
    }

    loadUserData()
  }, [])

  const handleSave = async () => {

    try {

      setLoading(true)

      const res = await updateUser(formData.id, formData.name, formData.email, formData.phone);
      if (!res.success) {
        throw new Error("Falha ao atualizar dados!")
      }

      await me();

      setTimeout(() => {
        setUserData({ ...formData })
        setEditMode(false)
        setLoading(false)
        Alert.alert("Sucesso", "Dados atualizados com sucesso!")
      }, 1000)

    } catch (error) {

      setEditMode(false)
      setLoading(false)
      Alert.alert("Erro", "" + error)

    }

  }

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      Alert.alert("Erro", "As senhas não coincidem")
      return
    }

    if (passwordData.newPassword.length < 6) {
      Alert.alert("Erro", "A nova senha deve ter pelo menos 6 caracteres")
      return
    }

    setLoading(true)
    try {
      const res = await changePassword(passwordData.newPassword, passwordData.currentPassword, passwordData.confirmPassword);

      if (!res.success)
        setTimeout(() => {
          setPasswordData({
            currentPassword: "",
            newPassword: "",
            confirmPassword: ""
          })
          setPasswordEditMode(false)
          setLoading(false)
          Alert.alert("Senha alterada com successo.")
        }, 1000)
    } catch (error) {
      Alert.alert("Erro ao alterar senha")
    }

  }

  const handleInputChange = (field: string, value: string) => {
    setFormData({
      ...formData,
      [field]: value
    })
  }

  const handlePasswordInputChange = (field: string, value: string) => {
    setPasswordData({
      ...passwordData,
      [field]: value
    })
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Meu Perfil</Text>
        <TouchableOpacity
          onPress={() => editMode ? handleSave() : setEditMode(true)}
          style={styles.editButton}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#FF6B35" />
          ) : (
            <Text style={styles.editButtonText}>
              {editMode ? "Salvar" : "Editar"}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Personal Data Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dados Pessoais</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Nome Completo</Text>
            {editMode ? (
              <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={(text) => handleInputChange("name", text)}
                placeholder="Seu nome completo"
              />
            ) : (
              <Text style={styles.dataText}>{userData.name}</Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email</Text>
            {editMode ? (
              <TextInput
                style={styles.input}
                value={formData.email}
                onChangeText={(text) => handleInputChange("email", text)}
                placeholder="Seu email"
                keyboardType="email-address"
              />
            ) : (
              <Text style={styles.dataText}>{userData.email}</Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Telefone</Text>
            {editMode ? (
              <TextInput
                style={styles.input}
                value={formData.phone}
                onChangeText={(text) => handleInputChange("phone", text)}
                placeholder="Seu telefone"
                keyboardType="phone-pad"
              />
            ) : (
              <Text style={styles.dataText}>{userData.phone}</Text>
            )}
          </View>
        </View>

        {/* Password Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Alterar Senha</Text>
            {!passwordEditMode ? (
              <TouchableOpacity
                onPress={() => setPasswordEditMode(true)}
                style={styles.changePasswordButton}
              >
                <Text style={styles.changePasswordText}>Alterar</Text>
              </TouchableOpacity>
            ) : null}
          </View>

          {passwordEditMode ? (
            <>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Senha Atual</Text>
                <TextInput
                  style={styles.input}
                  value={passwordData.currentPassword}
                  onChangeText={(text) => handlePasswordInputChange("currentPassword", text)}
                  placeholder="Digite sua senha atual"
                  secureTextEntry
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Nova Senha</Text>
                <TextInput
                  style={styles.input}
                  value={passwordData.newPassword}
                  onChangeText={(text) => handlePasswordInputChange("newPassword", text)}
                  placeholder="Digite a nova senha"
                  secureTextEntry
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Confirmar Nova Senha</Text>
                <TextInput
                  style={styles.input}
                  value={passwordData.confirmPassword}
                  onChangeText={(text) => handlePasswordInputChange("confirmPassword", text)}
                  placeholder="Confirme a nova senha"
                  secureTextEntry
                />
              </View>

              <View style={styles.passwordActions}>
                <TouchableOpacity
                  onPress={handlePasswordChange}
                  style={[styles.button, styles.saveButton]}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Text style={styles.buttonText}>Salvar Senha</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    setPasswordEditMode(false)
                    setPasswordData({
                      currentPassword: "",
                      newPassword: "",
                      confirmPassword: ""
                    })
                  }}
                  style={[styles.button, styles.cancelButton]}
                  disabled={loading}
                >
                  <Text style={[styles.buttonText, styles.cancelButtonText]}>Cancelar</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <Text style={styles.hintText}>
              Mantenha sua conta segura com uma senha forte
            </Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",

  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  editButton: {
    padding: 5,
  },
  editButtonText: {
    color: "#FF6B35",
    fontWeight: "600",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  avatarSection: {
    alignItems: "center",
    paddingVertical: 30,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 15,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  cameraButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#FF6B35",
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "white",
  },
  userName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 14,
    color: "#666",
  },
  section: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    marginTop: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "#333",
  },
  dataText: {
    fontSize: 16,
    color: "#333",
    paddingVertical: 5,
  },
  changePasswordButton: {
    padding: 5,
  },
  changePasswordText: {
    color: "#FF6B35",
    fontWeight: "600",
  },
  passwordActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 5,
  },
  saveButton: {
    backgroundColor: "#FF6B35",
  },
  cancelButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  buttonText: {
    color: "white",
    fontWeight: "600",
  },
  cancelButtonText: {
    color: "#666",
  },
  hintText: {
    fontSize: 14,
    color: "#666",
    fontStyle: "italic",
  },
  preferenceItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  preferenceText: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    marginLeft: 15,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
    padding: 15,
    borderRadius: 12,
    marginBottom: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  logoutText: {
    fontSize: 16,
    color: "#FF3B30",
    fontWeight: "600",
    marginLeft: 10,
  },
})