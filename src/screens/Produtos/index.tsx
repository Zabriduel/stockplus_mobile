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
  Image,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { api } from "../../api/api";
import * as ImagePicker from "expo-image-picker";

type Produto = {
  id_produto: number;
  nome_categoria: string;
  nome_produto: string;
  valor_produto: number;
  fk_id_categoria?: string | number;
  data_cadastro?: string;
  vinculo_imagem?: string;
};

type Categoria = {
  id_categoria: number;
  nome_categoria: string;
};

export default function Produtos() {
  const navigation = useNavigation();

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);

  const [modalVisible, setModalVisible] = useState(false);
  const [nomeProduto, setNomeProduto] = useState("");
  const [valorProduto, setValorProduto] = useState("");
  const [idCategoria, setIdCategoria] = useState<number | null>(null);
  const [selectedProduto, setSelectedProduto] = useState<Produto | null>(null);
  const [busca, setBusca] = useState("");
  const [imagem, setImagem] = useState<string | null>(null);

  const produtosFiltrados = produtos.filter((produto) =>
    produto.nome_produto.toLowerCase().includes(busca.toLowerCase())
  );

  useEffect(() => {
    loadData();
    loadCategorias();
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

  async function loadCategorias() {
    try {
      const response = await api.get("/categorias");

      const listaCategorias = response.data.categorias || [];

      setCategorias(listaCategorias);

      if (listaCategorias.length > 0) {
        setIdCategoria(listaCategorias[0].id_categoria);
      }
    } catch (error) {
      console.log("Erro ao carregar categorias:", error);
    }
  }

  async function selecionarImagem() {
    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 0.8,
    });

    if (!resultado.canceled) {
      setImagem(resultado.assets[0].uri);
    }
  }

  async function salvar() {
    try {
      if (!nomeProduto.trim() || !valorProduto.trim() || !idCategoria) {
        Alert.alert("Atenção", "Preencha todos os campos.");
        return;
      }

      if (selectedProduto) {
        await api.patch(`/produtos/${selectedProduto.id_produto}`, {
          nome_produto: nomeProduto,
          valor_produto: valorProduto.replace(",", "."),
          fk_id_categoria: idCategoria,
        });
      } else {
        if (!imagem) {
          Alert.alert("Atenção", "Selecione uma imagem para o produto.");
          return;
        }

        const formData = new FormData();

        formData.append("nome_produto", nomeProduto);
        formData.append("valor_produto", valorProduto.replace(",", "."));
        formData.append("fk_id_categoria", String(idCategoria));
        formData.append("image", {
          uri: imagem,
          name: `produto_${Date.now()}.jpg`,
          type: "image/jpeg",
        } as any);

        await api.post("/produtos", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      }

      closeModal();
      await loadData();
    } catch (error: any) {
      if (error.response) {
        console.log("========================================");
        console.log("RESPOSTA REAL DO BACKEND (SALVAR):", error.response.data);
        console.log("STATUS CODE:", error.response.status);
        console.log("========================================");

        Alert.alert(
          "Erro do Servidor",
          error.response.data.message || "Erro ao salvar produto."
        );
      } else {
        console.log("Erro na requisição:", error.message);
        Alert.alert("Erro", "Não foi possível conectar ao servidor.");
      }
    }
  }

  function openCreate() {
    setSelectedProduto(null);
    setNomeProduto("");
    setValorProduto("");
    setImagem(null);

    if (categorias.length > 0) {
      setIdCategoria(categorias[0].id_categoria);
    }

    setModalVisible(true);
  }

  function openEdit(item: Produto) {
    setSelectedProduto(item);
    setNomeProduto(item.nome_produto);
    setValorProduto(String(item.valor_produto));
    setImagem(null);

    if (item.fk_id_categoria) {
      setIdCategoria(Number(item.fk_id_categoria));
    } else {
      const categoriaEncontrada = categorias.find(
        (categoria) => categoria.nome_categoria === item.nome_categoria
      );

      if (categoriaEncontrada) {
        setIdCategoria(categoriaEncontrada.id_categoria);
      }
    }

    setModalVisible(true);
  }

  function closeModal() {
    setModalVisible(false);
    setSelectedProduto(null);
    setNomeProduto("");
    setValorProduto("");
    setImagem(null);

    if (categorias.length > 0) {
      setIdCategoria(categorias[0].id_categoria);
    }
  }

  async function onRefresh() {
    setRefreshing(true);
    await loadData();
  }

  function getDeleteErrorMessage(error: any): string {
    const mensagem = error.response?.data?.message || "";

    if (
      mensagem.includes("foreign key constraint fails") ||
      mensagem.includes("fk_id_produto_lote")
    ) {
      return "Não é possível excluir este produto porque existem lotes vinculados a ele.";
    }

    return mensagem || "Não foi possível excluir o produto.";
  }

  async function handleDelete(id: number) {
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
              Alert.alert("Erro ao excluir", getDeleteErrorMessage(error));
            }
          },
        },
      ]
    );
  }

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
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
          <Text style={styles.statValue}>{produtos.length}</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: "#F59E0B" }]}>
            {produtos.length}
          </Text>
          <Text style={styles.statLabel}>Em Estoque</Text>
        </View>
      </View>

      <FlatList
        data={produtosFiltrados}
        keyExtractor={(item) => String(item.id_produto)}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
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
      />

      <TouchableOpacity style={styles.fab} onPress={openCreate}>
        <Ionicons name="add" size={30} color="#FFFFFF" />
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
            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.modalScrollContent}
            >
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

              <Text style={styles.modalLabel}>Categoria</Text>

              <View style={styles.categoriasContainer}>
                {Array.isArray(categorias) &&
                  categorias.map((categoria) => {
                    const selecionada = idCategoria === categoria.id_categoria;

                    return (
                      <TouchableOpacity
                        key={categoria.id_categoria}
                        style={[
                          styles.categoriaOption,
                          selecionada && styles.categoriaOptionSelected,
                        ]}
                        onPress={() => setIdCategoria(categoria.id_categoria)}
                      >
                        <Text
                          style={[
                            styles.categoriaOptionText,
                            selecionada && styles.categoriaOptionTextSelected,
                          ]}
                        >
                          {categoria.nome_categoria}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
              </View>

              {!selectedProduto && (
                <>
                  <Text style={styles.modalLabel}>Imagem do produto</Text>

                  <TouchableOpacity
                    style={styles.imageButton}
                    onPress={selecionarImagem}
                  >
                    <Ionicons name="image-outline" size={20} color="#4d6cfa" />
                    <Text style={styles.imageButtonText}>
                      {imagem ? "Imagem selecionada" : "Selecionar imagem"}
                    </Text>
                  </TouchableOpacity>

                  {imagem && (
                    <Image
                      source={{ uri: imagem }}
                      style={styles.previewImage}
                    />
                  )}
                </>
              )}

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
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  customHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    paddingTop: Platform.OS === "ios" ? 50 : 20,
    paddingBottom: 16,
    paddingHorizontal: 16,
    elevation: 2,
  },
  headerButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
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
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: "#111827",
  },
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
  },
  statLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 4,
    fontWeight: "500",
  },
  statValue: {
    fontSize: 26,
    fontWeight: "700",
    color: "#4d6cfa",
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
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
  cardInfo: {
    flex: 1,
  },
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
  categoriaText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#4d6cfa",
  },
  idText: {
    fontSize: 12,
    color: "#9CA3AF",
    marginBottom: 2,
  },
  precoText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#4d6cfa",
  },
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
    backgroundColor: "#4d6cfa",
    alignItems: "center",
    justifyContent: "center",
    elevation: 6,
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
    maxHeight: "88%",
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  modalScrollContent: {
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
  categoriasContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  categoriaOption: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",
    borderRadius: 20,
    paddingVertical: 9,
    paddingHorizontal: 14,
  },
  categoriaOptionSelected: {
    backgroundColor: "#4d6cfa",
    borderColor: "#4d6cfa",
  },
  categoriaOptionText: {
    color: "#374151",
    fontWeight: "600",
    fontSize: 13,
  },
  categoriaOptionTextSelected: {
    color: "#FFFFFF",
  },
  imageButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderStyle: "dashed",
    borderRadius: 12,
    padding: 14,
    marginTop: 8,
  },
  imageButtonText: {
    marginLeft: 8,
    color: "#374151",
    fontWeight: "600",
  },
  previewImage: {
    width: "100%",
    height: 180,
    borderRadius: 12,
    marginTop: 10,
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
  textCancelar: {
    color: "#BA1A1A",
    fontWeight: "700",
    fontSize: 15,
  },
  buttonSalvar: {
    flex: 1,
    backgroundColor: "#4d6cfa",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  textSalvar: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 15,
  },
  emptyContainer: {
    marginTop: 100,
    alignItems: "center",
  },
  emptyText: {
    marginTop: 12,
    color: "#6B7280",
    fontSize: 16,
  },
});