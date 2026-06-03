import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  FlatList,
  View,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { api } from "../../api/api";

export type Produto = {
  id_produto: number;
  nome_categoria: string;
  nome_produto: string;
  valor_produto: number;
  fk_id_categoria?: string | number;
  data_cadastro?: string;
};

export default function Produtos() {
  const navigation = useNavigation();

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [nomeProduto, setNomeProduto] = useState("");
  const [valorProduto, setValorProduto] = useState("");
  const [idCategoria, setIdCategoria] = useState("1");
  const [selectedProduto, setSelectedProduto] = useState<Produto | null>(null);
  const [busca, setBusca] = useState("");

  const produtosFiltrados = produtos.filter((produto) =>
    produto.nome_produto.toLowerCase().includes(busca.toLowerCase()),
  );

  useEffect(() => {
    const setup = async () => {
      await loadData();
    };
    setup();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const response = await api.get("/produtos");
        
      const data = response.data.map((p: any) => ({
        ...p,
        valor_produto: Number(p.valor_produto),
      }));

      setProdutos(data);
    } catch (error) {
      Alert.alert("Erro", "Não foi possível carregar os produtos.");
      console.log(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  async function salvar() {
    try {
      if (!nomeProduto.trim() || !valorProduto.trim()) {
        Alert.alert("Atenção", "Preencha todos os campos.");
        return;
      }
      
      const body = {
        nome_produto: nomeProduto,
        valor_produto: valorProduto.replace(",", "."),
        fk_id_categoria: String(idCategoria),
      };

      if (selectedProduto) {
        await api.patch(`/produtos/${selectedProduto.id_produto}`, body);
      } else {
        await api.post("/produtos", body);
      }

      closeModal();
      await loadData();
    } catch (error: any) {
      if (error.response) {
        console.log("========================================");
        console.log("RESPOSTA REAL DO BACKEND (SALVAR):", error.response.data);
        console.log("STATUS CODE:", error.response.status);
        console.log("========================================");
        Alert.alert("Erro do Servidor", error.response.data.message || "Erro 400");
      } else {
        console.log("Erro na requisição:", error.message);
      }
    }
  }

  function openCreate(): void {
    setSelectedProduto(null);
    setNomeProduto("");
    setValorProduto("");
    setIdCategoria("1");
    setModalVisible(true);
  }

  function openEdit(item: Produto): void {
    setSelectedProduto(item);
    setNomeProduto(item.nome_produto);
    setValorProduto(String(item.valor_produto));

    if (item.fk_id_categoria) {
      setIdCategoria(String(item.fk_id_categoria));
    } else {
      switch (item.nome_categoria) {
        case "Medicamentos":
          setIdCategoria("1");
          break;
        case "Suplementos":
          setIdCategoria("2");
          break;
        case "Higiene":
          setIdCategoria("3");
          break;
        default:
          setIdCategoria("1");
      }
    }
    setModalVisible(true);
  }

  function closeModal(): void {
    setModalVisible(false);
    setSelectedProduto(null);
    setNomeProduto("");
    setValorProduto("");
    setIdCategoria("1");
  }

  async function onRefresh() {
    setRefreshing(true);
    await loadData();
  }

  async function handleDelete(id: number): Promise<void> {
    if (!id) {
      Alert.alert("Erro", "ID do produto inválido.");
      return;
    }

    Alert.alert(
      "Excluir produto",
      "Tem certeza que deseja excluir este produto?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            try {
              await api.delete(`/produtos/${id}`);
              await loadData();
            } catch (error: any) {
              if (error.response) {
                console.log("========================================");
                console.log("RESPOSTA REAL DO BACKEND (DELETE):", error.response.data);
                console.log("STATUS CODE:", error.response.status);
                console.log("========================================");
                
                Alert.alert("Erro ao Excluir", error.response.data.message || "O servidor rejeitou a exclusão.");
              } else {
                console.log("Erro na requisição de delete:", error.message);
              }
            }
          },
        },
      ],
    );
  }

  const totalProdutos = produtos.length;

  if (loading && !refreshing) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: FUNDO,
        }}
      >
        <ActivityIndicator size="large" color="#4d6cfa" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.customHeader}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.headerButton}
        >
          <Ionicons name="arrow-back" size={26} color="#4d6cfa" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Produtos</Text>
        <View style={styles.headerButton} />
      </View>

      <View style={styles.searchContainer}>
        <Ionicons
          name="search-outline"
          size={20}
          color="#6B7280"
          style={styles.searchIcon}
        />
        <TextInput
          placeholder="Pesquisar produto..."
          placeholderTextColor="#6B7280"
          value={busca}
          onChangeText={setBusca}
          style={styles.searchInput}
        />
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Total</Text>
          <Text style={styles.statValue}>{totalProdutos}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Em Estoque</Text>
          <Text style={[styles.statValue, { color: "#F59E0B" }]}>
            {totalProdutos}
          </Text>
        </View>
      </View>

      <FlatList
        data={produtosFiltrados}
        keyExtractor={(item) => String(item.id_produto)}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="cube-outline" size={70} color="#D1D5DB" />
            <Text style={styles.emptyText}>Nenhum produto encontrado</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardContent}>
              <View style={styles.iconBox}>
                <Ionicons name="cube" size={28} color="#4d6cfa" />
              </View>
              <View style={styles.cardInfo}>
                <Text style={styles.nomeProduto} numberOfLines={1}>
                  {item.nome_produto}
                </Text>
                <View style={styles.categoriaBadge}>
                  <Text style={styles.categoriaText}>
                    {item.nome_categoria || "Geral"}
                  </Text>
                </View>
                <Text style={styles.idText}>ID: PRD-{item.id_produto}</Text>
                <Text style={styles.precoText}>
                  R$ {item.valor_produto.toFixed(2)}
                </Text>
              </View>
            </View>
            <View style={styles.acoesContainer}>
              <TouchableOpacity
                style={styles.buttonEditar}
                onPress={() => openEdit(item)}
              >
                <Ionicons name="pencil" size={18} color="#4d6cfa" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.buttonExcluir}
                onPress={() => handleDelete(item.id_produto)}
              >
                <Ionicons name="trash" size={18} color="#EF4444" />
              </TouchableOpacity>
            </View>
          </View>
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />

      <TouchableOpacity style={styles.fab} onPress={openCreate}>
        <Ionicons name="add" size={30} color="#FFF" />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={closeModal}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitulo}>
              {selectedProduto ? "Editar Produto" : "Novo Produto"}
            </Text>

            <Text style={styles.modalLabel}>Nome do produto</Text>
            <TextInput
              style={styles.modalInput}
              value={nomeProduto}
              onChangeText={setNomeProduto}
              placeholder="Ex: Caneta Cristal"
              placeholderTextColor="#9CA3AF"
            />

            <Text style={styles.modalLabel}>Valor (R$)</Text>
            <TextInput
              style={styles.modalInput}
              value={valorProduto}
              onChangeText={setValorProduto}
              placeholder="Ex: 12.00"
              placeholderTextColor="#9CA3AF"
              keyboardType="decimal-pad"
            />

            <Text style={styles.modalLabel}>ID da Categoria</Text>
            <TextInput
              style={styles.modalInput}
              value={idCategoria}
              onChangeText={setIdCategoria}
              placeholder="Ex: 1"
              placeholderTextColor="#9CA3AF"
              keyboardType="numeric"
            />

            <View style={styles.modalBotoes}>
              <TouchableOpacity
                style={styles.buttonCancelar}
                onPress={closeModal}
              >
                <Text style={styles.textCancelar}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.buttonSalvar} onPress={salvar}>
                <Text style={styles.textSalvar}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const AZUL = "#4d6cfa";
const VERMELHO = "#BA1A1A";
const FUNDO = "#F4F7FC";

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: FUNDO },
  customHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    paddingTop: Platform.OS === "ios" ? 50 : 20,
    paddingBottom: 16,
    paddingHorizontal: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  headerButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { fontSize: 18, fontWeight: "700", color: "#111827" },
  statsRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 12,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  statLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 4,
    fontWeight: "500",
  },
  statValue: { fontSize: 26, fontWeight: "700", color: AZUL },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    elevation: 1,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 15, color: "#111827" },
  listContainer: { paddingHorizontal: 16, paddingBottom: 100 },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  iconBox: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: "#EEF2FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  cardInfo: { flex: 1 },
  nomeProduto: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 6,
  },
  categoriaBadge: {
    backgroundColor: "#EEF2FF",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: "flex-start",
    marginBottom: 6,
  },
  categoriaText: { fontSize: 12, fontWeight: "600", color: AZUL },
  idText: { fontSize: 12, color: "#9CA3AF", marginBottom: 2 },
  precoText: { fontSize: 16, fontWeight: "700", color: AZUL },
  acoesContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    paddingTop: 10,
  },
  buttonEditar: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#EEF2FF",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonExcluir: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#FEE2E2",
    alignItems: "center",
    justifyContent: "center",
  },
  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: AZUL,
    alignItems: "center",
    justifyContent: "center",
    elevation: 6,
    shadowColor: AZUL,
    shadowOpacity: 0.4,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalTitulo: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 20,
    textAlign: "center",
  },
  modalLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6B7280",
    marginBottom: 6,
    marginTop: 14,
  },
  modalInput: {
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: "#111827",
    backgroundColor: "#F9FAFB",
  },
  modalBotoes: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 24,
    gap: 12,
  },
  buttonCancelar: {
    flex: 1,
    backgroundColor: "#FEE2E2",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  textCancelar: { color: VERMELHO, fontWeight: "700", fontSize: 15 },
  buttonSalvar: {
    flex: 1,
    backgroundColor: AZUL,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  textSalvar: { color: "#FFFFFF", fontWeight: "700", fontSize: 15 },
  emptyContainer: { marginTop: 100, alignItems: "center" },
  emptyText: { marginTop: 12, color: "#6B7280", fontSize: 16 },
});