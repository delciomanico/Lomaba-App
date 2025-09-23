
import { useState } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"

export default function TermsScreen() {
  const router = useRouter()
  const [activeSection, setActiveSection] = useState("terms")

  const sections = [
    { id: "terms", title: "Termos de Uso" },
    { id: "privacy", title: "Política de Privacidade" },
  ]

  const handleEmailPress = () => {
    Linking.openURL("mailto:support@lomba.com")
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Termos e Privacidade</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Tabs de Navegação */}
      <View style={styles.tabsContainer}>
        {sections.map((section) => (
          <TouchableOpacity
            key={section.id}
            style={[styles.tab, activeSection === section.id && styles.activeTab]}
            onPress={() => setActiveSection(section.id)}
          >
            <Text style={[styles.tabText, activeSection === section.id && styles.activeTabText]}>
              {section.title}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Conteúdo */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeSection === "terms" ? (
          <View style={styles.section}>
            <Text style={styles.title}>Termos de Uso do GasApp</Text>
            <Text style={styles.lastUpdated}>Última atualização: 15 de Novembro de 2023</Text>
            
            <Text style={styles.paragraph}>
              Bem-vindo ao GasApp! Estes Termos de Uso regem o seu uso do nosso aplicativo 
              e serviços relacionados. Ao acessar ou usar o GasApp, você concorda com estes Termos.
            </Text>
            
            <Text style={styles.subtitle}>1. Elegibilidade</Text>
            <Text style={styles.paragraph}>
              Você deve ter pelo menos 18 anos de idade para usar o GasApp. Ao usar o aplicativo, 
              você declara e garante que tem pelo menos 18 anos e que todas as informações 
              fornecidas são verdadeiras e precisas.
            </Text>
            
            <Text style={styles.subtitle}>2. Conta do Usuário</Text>
            <Text style={styles.paragraph}>
              Para acessar certos recursos do GasApp, você precisará criar uma conta. Você é 
              responsável por manter a confidencialidade de suas credenciais de login e por 
              todas as atividades que ocorrem em sua conta.
            </Text>
            
            <Text style={styles.subtitle}>3. Serviços de Entrega</Text>
            <Text style={styles.paragraph}>
              O GasApp atua como intermediário entre você e os fornecedores de gás. Não somos 
              o fornecedor direto do gás, mas facilitamos a conexão entre clientes e fornecedores 
              credenciados.
            </Text>
            
            <Text style={styles.subtitle}>4. Pagamentos</Text>
            <Text style={styles.paragraph}>
              Todos os pagamentos são processados de forma segura através de nossos parceiros 
              de pagamento. Os preços podem variar dependendo do fornecedor, localização e 
              outros fatores.
            </Text>
            
            <Text style={styles.subtitle}>5. Conduta do Usuário</Text>
            <Text style={styles.paragraph}>
              Você concorda em não usar o GasApp para qualquer finalidade ilegal ou não autorizada. 
              Você não pode, em nenhuma circunstância, interferir ou prejudicar a integridade ou 
              desempenho do aplicativo.
            </Text>
            
            <Text style={styles.subtitle}>6. Modificações nos Termos</Text>
            <Text style={styles.paragraph}>
              Reservamo-nos o direito de modificar estes Termos a qualquer momento. 
              Notificaremos você sobre mudanças materiais através do aplicativo ou por e-mail. 
              O uso continuado do GasApp após tais modificações constitui sua concordância 
              com os Termos revisados.
            </Text>
            
            <Text style={styles.subtitle}>7. Rescisão</Text>
            <Text style={styles.paragraph}>
              Podemos rescindir ou suspender sua conta imediatamente, sem aviso prévio, 
              se você violar estes Termos de Uso.
            </Text>
            
            <Text style={styles.contactText}>
              Em caso de dúvidas sobre estes Termos, entre em contato conosco através do 
              e-mail: <Text style={styles.link} onPress={handleEmailPress}>support@gasapp.com</Text>
            </Text>
          </View>
        ) : (
          <View style={styles.section}>
            <Text style={styles.title}>Política de Privacidade</Text>
            <Text style={styles.lastUpdated}>Última atualização: 15 de Novembro de 2023</Text>
            
            <Text style={styles.paragraph}>
              Sua privacidade é importante para nós. Esta Política de Privacidade explica 
              como o GasApp coleta, usa e protege suas informações pessoais.
            </Text>
            
            <Text style={styles.subtitle}>1. Informações que Coletamos</Text>
            <Text style={styles.paragraph}>
              Coletamos informações que você nos fornece diretamente, como nome, endereço, 
              e-mail, número de telefone e informações de pagamento. Também coletamos 
              automaticamente informações sobre seu dispositivo e uso do aplicativo.
            </Text>
            
            <Text style={styles.subtitle}>2. Uso de Informações</Text>
            <Text style={styles.paragraph}>
              Utilizamos suas informações para:
              {"\n"}• Fornecer, operar e manter nossos serviços
              {"\n"}• Processar suas transações e enviar confirmações
              {"\n"}• Comunicar-nos com você sobre serviços, atualizações e promoções
              {"\n"}• Melhorar e personalizar sua experiência
              {"\n"}• Garantir a segurança e prevenir fraudes
            </Text>
            
            <Text style={styles.subtitle}>3. Compartilhamento de Informações</Text>
            <Text style={styles.paragraph}>
              Não vendemos suas informações pessoais. Podemos compartilhar informações com:
              {"\n"}• Fornecedores de serviços que nos auxiliam na operação do aplicativo
              {"\n"}• Prestadores de serviços de entrega para concluir seus pedidos
              {"\n"}• Autoridades legais quando exigido por lei
            </Text>
            
            <Text style={styles.subtitle}>4. Segurança de Dados</Text>
            <Text style={styles.paragraph}>
              Implementamos medidas de segurança técnicas e organizacionais para proteger 
              suas informações pessoais contra acesso não autorizado, alteração, divulgação 
              ou destruição.
            </Text>
            
            <Text style={styles.subtitle}>5. Seus Direitos</Text>
            <Text style={styles.paragraph}>
              Você tem o direito de:
              {"\n"}• Acessar e corrigir suas informações pessoais
              {"\n"}• Solicitar a exclusão de suas informações
              {"\n"}• Optar por não receber comunicações de marketing
              {"\n"}• Retirar seu consentimento para o uso de suas informações
            </Text>
            
            <Text style={styles.subtitle}>6. Retenção de Dados</Text>
            <Text style={styles.paragraph}>
              Manteremos suas informações pessoais apenas pelo tempo necessário para 
              cumprir as finalidades descritas nesta Política de Privacidade, a menos 
              que um período de retenção mais longo seja exigido ou permitido por lei.
            </Text>
            
            <Text style={styles.subtitle}>7. Alterações nesta Política</Text>
            <Text style={styles.paragraph}>
              Podemos atualizar nossa Política de Privacidade periodicamente. 
              Notificaremos você sobre quaisquer alterações publicando a nova 
              Política de Privacidade nesta página.
            </Text>
            
            <Text style={styles.contactText}>
              Para exercer seus direitos de privacidade ou para questions, 
              entre em contato: <Text style={styles.link} onPress={handleEmailPress}>privacy@lomba.com</Text>
            </Text>
          </View>
        )}
        
        {/* Aceitação dos Termos (visível apenas na seção de Termos) */}
        {activeSection === "terms" && (
          <View style={styles.acceptanceContainer}>
            <Text style={styles.acceptanceText}>
              Ao usar o GasApp, você confirma que leu, compreendeu e concorda 
              com estes Termos de Uso.
            </Text>
          </View>
        )}
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  tabsContainer: {
    flexDirection: "row",
    backgroundColor: "white",
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  activeTab: {
    borderBottomColor: "#FF6B35",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  activeTabText: {
    color: "#FF6B35",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    paddingVertical: 25,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  lastUpdated: {
    fontSize: 14,
    color: "#666",
    marginBottom: 25,
    fontStyle: "italic",
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginTop: 20,
    marginBottom: 10,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    color: "#444",
    marginBottom: 15,
  },
  contactText: {
    fontSize: 16,
    lineHeight: 24,
    color: "#444",
    marginTop: 30,
    marginBottom: 20,
  },
  link: {
    color: "#FF6B35",
    fontWeight: "600",
  },
  acceptanceContainer: {
    backgroundColor: "#FFF5F0",
    padding: 20,
    borderRadius: 12,
    marginVertical: 20,
    borderLeftWidth: 4,
    borderLeftColor: "#FF6B35",
  },
  acceptanceText: {
    fontSize: 16,
    lineHeight: 22,
    color: "#333",
    fontWeight: "500",
    textAlign: "center",
  },
})