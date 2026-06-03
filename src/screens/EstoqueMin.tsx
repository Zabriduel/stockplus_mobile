import { useEffect, useMemo, useState } from "react";
import { FlatList, View, Text, StyleSheet, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import AntDesign from "@expo/vector-icons/AntDesign";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import api from "../api/api";

type Produto = {
    id: number;
    nomeProduto: string;
    qtdAtual: number;
    estoqueMinimo: number;
    categoria: string;
};

type ProdutoApi = {
    id_produto: number;
    nome_produto: string;
    valor_produto: number;
    data_cadastro?: string;
    nome_categoria: string;
};

type LoteApi = {
    id_lote: number;
    fk_id_produto: number;
    fk_id_fornecedor: number;
    lote: string;
    qtd_lote: number;
    data_vencimento: string;
};

type Filtro = "todos" | "abaixo" | "proximo";
type Ordenacao = "alfabetica" | "porcentagemCrescente" | "porcentagemDecrescente";

function calcularPorcentagem(produto: Produto) {
    return Math.round((produto.qtdAtual / produto.estoqueMinimo) * 100);
}

function verificarStatus(produto: Produto) {
    const porcentagem = calcularPorcentagem(produto);

    if (produto.qtdAtual < produto.estoqueMinimo) {
        return "abaixo";
    }

    if (porcentagem <= 150) {
        return "proximo";
    }

    return "estavel";
}

export default function EstoqueMin() {
    const [produtos, setProdutos] = useState<Produto[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");

    const [filtro, setFiltro] = useState<Filtro>("todos");
    const [ordenacao, setOrdenacao] = useState<Ordenacao>("alfabetica");

    useEffect(() => {
        async function buscarProdutos() {
            try {
                setCarregando(true);
                setErro("");

                const produtosResponse = await api.get("/produtos");
                const lotesResponse = await api.get("/lotes");

                console.log("PRODUTOS DA API:", produtosResponse.data);
                console.log("LOTES DA API:", lotesResponse.data);

                const produtosApi: ProdutoApi[] =
                    produtosResponse.data.produtos ||
                    produtosResponse.data.resultado ||
                    produtosResponse.data.data ||
                    produtosResponse.data;

                const lotesApi: LoteApi[] =
                    lotesResponse.data.lotes ||
                    lotesResponse.data.resultado ||
                    lotesResponse.data.data ||
                    lotesResponse.data;

                if (!Array.isArray(produtosApi)) {
                    console.log("Produtos não vieram como array:", produtosApi);
                    setProdutos([]);
                    return;
                }

                if (!Array.isArray(lotesApi)) {
                    console.log("Lotes não vieram como array:", lotesApi);
                    setProdutos([]);
                    return;
                }

                const produtosFormatados: Produto[] = produtosApi.map((produto) => {
                    const lotesDoProduto = lotesApi.filter(
                        (lote) => lote.fk_id_produto === produto.id_produto
                    );

                    const qtdAtual = lotesDoProduto.reduce(
                        (total, lote) => total + Number(lote.qtd_lote),
                        0
                    );

                    return {
                        id: produto.id_produto,
                        nomeProduto: produto.nome_produto,
                        categoria: produto.nome_categoria,
                        qtdAtual: qtdAtual,
                        estoqueMinimo: 200,
                    };
                });

                setProdutos(produtosFormatados);
            } catch (error) {
                console.error(error);
                setErro("Erro ao buscar produtos do estoque.");
            } finally {
                setCarregando(false);
            }
        }

        buscarProdutos();
    }, []);

    const produtosFiltrados = useMemo(() => {
        let lista = [...produtos];

        if (filtro !== "todos") {
            lista = lista.filter((produto) => verificarStatus(produto) === filtro);
        }

        if (ordenacao === "alfabetica") {
            lista.sort((a, b) => a.nomeProduto.localeCompare(b.nomeProduto));
        }

        if (ordenacao === "porcentagemCrescente") {
            lista.sort((a, b) => calcularPorcentagem(a) - calcularPorcentagem(b));
        }

        if (ordenacao === "porcentagemDecrescente") {
            lista.sort((a, b) => calcularPorcentagem(b) - calcularPorcentagem(a));
        }

        return lista;
    }, [produtos, filtro, ordenacao]);

    function renderTag(produto: Produto) {
        const status = verificarStatus(produto);

        if (status === "abaixo") {
            return (
                <View style={[styles.tag, styles.tagAbaixo]}>
                    <AntDesign name="alert" size={15} color="#D93636" />
                    <Text style={styles.tagAbaixoText}>Abaixo do mínimo</Text>
                </View>
            );
        }

        if (status === "proximo") {
            return (
                <View style={[styles.tag, styles.tagProximo]}>
                    <AntDesign name="warning" size={14} color="#705000" />
                    <Text style={styles.tagProximoText}>Próximo do mínimo</Text>
                </View>
            );
        }

        return (
            <View style={[styles.tag, styles.tagEstavel]}>
                <Ionicons name="checkmark-circle-outline" size={15} color="#03702A" />
                <Text style={styles.tagEstavelText}>Estável</Text>
            </View>
        );
    }

    function renderCard({ item }: { item: Produto }) {
        const porcentagem = calcularPorcentagem(item);
        const status = verificarStatus(item);

        return (
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <View style={styles.infoProduto}>
                        <Text style={styles.nomeProd}>{item.nomeProduto}</Text>
                        <Text style={styles.idItem}>ID Produto: {item.id}</Text>
                    </View>

                    {renderTag(item)}
                </View>

                <View style={styles.estoqueLinha}>
                    <Text style={styles.estoqueTexto}>
                        Estoque:{" "}
                        <Text
                            style={
                                status === "abaixo"
                                    ? styles.valorAbaixo
                                    : status === "proximo"
                                        ? styles.valorProximo
                                        : styles.valorEstavel
                            }
                        >
                            {item.qtdAtual}
                        </Text>
                        {" "} / Mínimo: {item.estoqueMinimo}
                    </Text>

                    <Text style={styles.porcentagem}>{porcentagem}%</Text>
                </View>

                <View style={styles.barraFundo}>
                    <View
                        style={[
                            styles.barraProgresso,
                            {
                                width: `${Math.min(porcentagem, 100)}%`,
                            },
                            status === "abaixo"
                                ? styles.barraAbaixo
                                : status === "proximo"
                                    ? styles.barraProximo
                                    : styles.barraEstavel,
                        ]}
                    />
                </View>
            </View>
        );
    }

    if (carregando) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <Text style={styles.title}>Controle de Estoque</Text>
                    <Text style={styles.subtitle}>Carregando produtos...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>

            <View style={styles.header}>
                <Text style={styles.title}>Controle de Estoque</Text>
                <Text style={styles.subtitle}>
                    Monitoramento de níveis críticos em tempo real.
                </Text>
            </View>

            <View style={styles.abasContainer}>
                <Pressable
                    style={[styles.aba, filtro === "todos" && styles.abaAtiva]}
                    onPress={() => setFiltro("todos")}
                >
                    <Text style={[styles.abaTexto, filtro === "todos" && styles.abaTextoAtiva]}>
                        Todos
                    </Text>
                </Pressable>

                <Pressable
                    style={[styles.aba, filtro === "abaixo" && styles.abaAtiva]}
                    onPress={() => setFiltro("abaixo")}
                >
                    <Text style={[styles.abaTexto, filtro === "abaixo" && styles.abaTextoAtiva]}>
                        Abaixo
                    </Text>
                </Pressable>

                <Pressable
                    style={[styles.aba, filtro === "proximo" && styles.abaAtiva]}
                    onPress={() => setFiltro("proximo")}
                >
                    <Text style={[styles.abaTexto, filtro === "proximo" && styles.abaTextoAtiva]}>
                        Próximo
                    </Text>
                </Pressable>
            </View>

            <View style={styles.ordenacaoContainer}>
                <Pressable
                    style={[styles.botaoOrdenacao, ordenacao === "alfabetica" && styles.botaoOrdenacaoAtivo]}
                    onPress={() => setOrdenacao("alfabetica")}
                >
                    <Text style={styles.botaoOrdenacaoTexto}>A-Z</Text>
                </Pressable>

                <Pressable
                    style={[styles.botaoOrdenacao, ordenacao === "porcentagemCrescente" && styles.botaoOrdenacaoAtivo]}
                    onPress={() => setOrdenacao("porcentagemCrescente")}
                >
                    <Text style={styles.botaoOrdenacaoTexto}>% Cresc.</Text>
                </Pressable>

                <Pressable
                    style={[styles.botaoOrdenacao, ordenacao === "porcentagemDecrescente" && styles.botaoOrdenacaoAtivo]}
                    onPress={() => setOrdenacao("porcentagemDecrescente")}
                >
                    <Text style={styles.botaoOrdenacaoTexto}>% Decresc.</Text>
                </Pressable>
            </View>

            {erro !== "" && (
                <Text style={styles.erro}>{erro}</Text>
            )}

            <FlatList
                data={produtosFiltrados}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderCard}
                contentContainerStyle={styles.lista}
                ListFooterComponent={
                    <View style={styles.footer}>
                        <MaterialIcons name="assignment-turned-in" size={56} color="#9BA4B0" />
                        <Text style={styles.footerText}>Fim da lista de estoque crítico</Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F4F7FC",
    },

    header: {
        paddingHorizontal: 20,
        paddingBottom: 18,
    },

    title: {
        color: "#4d6cfa",
        fontWeight: "bold",
        fontSize: 26,
        marginBottom: 8,
    },

    subtitle: {
        color: "#031875",
        fontSize: 15,
    },

    abasContainer: {
        flexDirection: "row",
        paddingHorizontal: 20,
        gap: 10,
        marginBottom: 14,
    },

    aba: {
        backgroundColor: "#E6EEFF",
        paddingVertical: 12,
        paddingHorizontal: 18,
        borderRadius: 14,
    },

    abaAtiva: {
        backgroundColor: "#4d6cfa",
    },

    abaTexto: {
        color: "#031875",
        fontWeight: "600",
    },

    abaTextoAtiva: {
        color: "#FFFFFF",
    },

    ordenacaoContainer: {
        flexDirection: "row",
        paddingHorizontal: 20,
        gap: 8,
        marginBottom: 10,
    },

    botaoOrdenacao: {
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: "#D5DCCB",
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 12,
    },

    botaoOrdenacaoAtivo: {
        backgroundColor: "#DCE8FF",
        borderColor: "#4D6CFA",
    },

    botaoOrdenacaoTexto: {
        color: "#071127",
        fontWeight: "600",
        fontSize: 12,
    },

    lista: {
        paddingBottom: 30,
    },

    card: {
        width: "92%",
        alignSelf: "center",
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        padding: 20,
        marginTop: 12,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: "#D5DCCB",
        shadowColor: "#000",
        shadowOpacity: 0.12,
        shadowRadius: 8,
        elevation: 3,
    },

    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: 12,
    },

    infoProduto: {
        flex: 1,
    },

    nomeProd: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#071127",
        marginBottom: 8,
    },

    idItem: {
        fontSize: 13,
        color: "#2C332C",
        letterSpacing: 1,
    },

    tag: {
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 14,
        maxWidth: 150,
    },

    tagAbaixo: {
        backgroundColor: "#FFE5E5",
    },

    tagProximo: {
        backgroundColor: "#FCFF97",
    },

    tagEstavel: {
        backgroundColor: "#C9F7C9",
    },

    tagAbaixoText: {
        color: "#D93636",
        fontWeight: "bold",
        fontSize: 12,
    },

    tagProximoText: {
        color: "#242A00",
        fontWeight: "bold",
        fontSize: 12,
    },

    tagEstavelText: {
        color: "#03702A",
        fontWeight: "bold",
        fontSize: 12,
    },

    estoqueLinha: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 28,
        marginBottom: 8,
    },

    estoqueTexto: {
        color: "#2C332C",
        fontSize: 15,
    },

    valorAbaixo: {
        color: "#D93636",
        fontWeight: "bold",
        fontSize: 17,
    },

    valorProximo: {
        color: "#8A6400",
        fontWeight: "bold",
        fontSize: 17,
    },

    valorEstavel: {
        color: "#03702A",
        fontWeight: "bold",
        fontSize: 17,
    },

    porcentagem: {
        color: "#2C332C",
        fontWeight: "600",
        fontSize: 14,
    },

    barraFundo: {
        width: "100%",
        height: 9,
        backgroundColor: "#E5EBF3",
        borderRadius: 20,
        overflow: "hidden",
    },

    barraProgresso: {
        height: "100%",
        borderRadius: 20,
    },

    barraAbaixo: {
        backgroundColor: "#D93636",
    },

    barraProximo: {
        backgroundColor: "#e5e21f",
    },

    barraEstavel: {
        backgroundColor: "#03702A",
    },

    footer: {
        alignItems: "center",
        marginTop: 50,
        marginBottom: 20,
    },

    footerText: {
        marginTop: 10,
        color: "#9BA4B0",
        fontSize: 15,
    },

    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },

    erro: {
        color: "#D93636",
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: 10,
    },
});