import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { useEffect, useState } from "react";

import {
  FlatList,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

import { RootStackParamList } from "../../../App";
import api from "../../api/api";

import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

export type Lote = {
  id: number;
  nomeProduto: string;
  nomeFornecedor: string;
  qtdLote: number;
  dataVencimento: string;
};

export type Mensagem = {
  id: number;
  mensagem: string;
};

const diasVencer = (dataVencimento: string): number => {
  const dataConvertida = new Date(dataVencimento);
  const dataAtual = new Date();
  const diferencaMilissegundos = dataConvertida.getTime() - dataAtual.getTime();
  const diasAVencer = Math.ceil(diferencaMilissegundos / (1000 * 60 * 60 * 24));

  return diasAVencer;
};

type NavigationProps = NativeStackNavigationProp<RootStackParamList, "Home">;

export default function LotesVencimento() {
  useEffect(() => {
    const setup = async () => {
      loadData();
    };
    setup();
  }, []);

  async function loadData(): Promise<void> {
    try {
      const response = await api.get("/relatorios");
      console.log(response.data);
      setLotes(response.data);
      console.log(lotes);
    } catch (error) {
      console.error(error);
    }
  }

  const [lotes, setLotes] = useState<any>([]);
  const [categoriaAtiva, setCategoriaAtiva] = useState("Todos");

  const [filterVisible, setFilterVisible] = useState(false);
  const categorias = ["Todos", "Crítico", "Alerta"];

  const dadosFiltrados = lotes.filter((lote: any) => {
    const diasRestantes = diasVencer(lote.data_vencimento);
    if (categoriaAtiva == "Todos") {
      if (diasRestantes <= 90) {
        return lote;
      }
    } else if (categoriaAtiva == "Alerta") {
      if (diasRestantes > 45 && diasRestantes <= 90) {
        return lote;
      }
    } else if (categoriaAtiva == "Crítico") {
      if (diasRestantes > 0 && diasRestantes <= 45) {
        return lote;
      }
    }
  });

  const titulo = () => {
    if (categoriaAtiva == "Alerta") {
      return "Produtos em vencimento em alerta";
    }

    if (categoriaAtiva == "Crítico") {
      return "Produtos em vencimento crítico";
    } else {
      return "Produtos em vencimento";
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={{ alignSelf: "flex-end", marginTop: 10, marginLeft: 10 }}
        onPress={() => setFilterVisible(true)}
      >
        <MaterialCommunityIcons
          name="filter-outline"
          size={35}
          color="#4D6CFA"
        />
      </TouchableOpacity>

      <FlatList
        data={dadosFiltrados}
        keyExtractor={(item) => String(item.id_lote)}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <MaterialCommunityIcons
              style={{ position: "absolute", top: 10, right: 10 }}
              name="alert-circle-outline"
              size={28}
              color="#4D6CFA"
            />
            <View
              style={[
                styles.sideColor,
                diasVencer(item.data_vencimento) <= 90 &&
                  styles.sideColorAlerta,
                diasVencer(item.data_vencimento) < 45 &&
                  styles.sideColorCritico,
              ]}
            ></View>
            <View style={{ top: 17 }}>
              <View>
                <View>
                  <Text style={styles.textStyleName}>{item.nome_produto}</Text>
                  <Text style={styles.textStyleFornecedor}>
                    CNPJ: {item.cnpj}
                  </Text>
                </View>
              </View>

              <Text style={styles.textStyleQnt}>
                Quantidade disponível: {item.qtd_lote}
              </Text>
              <View style={styles.displayRow}>
                <Text style={styles.textDataVencimento}>
                  {new Date(item.data_vencimento).toLocaleDateString("pt-BR")}
                </Text>
                <Text
                  style={[
                    diasVencer(item.data_vencimento) <= 90 &&
                      styles.textDiasAVencerAlerta,
                    diasVencer(item.data_vencimento) < 45 &&
                      styles.textDiasAVencerCritico,
                  ]}
                >
                  Dias até vencer: {diasVencer(item.data_vencimento)}
                </Text>
              </View>
            </View>
          </View>
        )}
      ></FlatList>

      <Text
        style={{
          position: "absolute",
          top: 0,
          marginTop: 10,
          fontSize: 20,
          alignSelf: "center",
          color: "#4D6CFA",
          fontWeight: "bold",
        }}
      >
        {titulo()}
      </Text>
      {filterVisible && (
        <View style={styles.filtroContainer}>
          <View style={styles.displayRow}>
            <Text style={styles.filtroText}>Filtro</Text>
            <TouchableOpacity onPress={() => setFilterVisible(false)}>
              <MaterialCommunityIcons
                name="filter-off-outline"
                size={24}
                color="#4D6CFA"
              />
            </TouchableOpacity>
          </View>

          {categorias.map((categoria) => (
            <TouchableOpacity
              key={categoria}
              onPress={() => setCategoriaAtiva(categoria)}
              style={styles.filtroButtons}
            >
              <Text style={styles.filtroText}>{categoria}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7f7ff",
    alignItems: "center",
    justifyContent: "center",
  },

  card: {
    display: "flex",
    justifyContent: "center",
    flexDirection: "row",
    height: 150,
    width: 300,
    margin: 20,
    borderRadius: 10,
    backgroundColor: "#fff",
    elevation: 5,
    shadowColor: "#083492",
  },

  displayRow: {
    maxWidth: "100%",
    display: "flex",
    flexDirection: "row",
    gap: 10,
    justifyContent: "center",
  },

  textStyleName: {
    fontSize: 18,
    color: "#4D6CFA",
    fontWeight: "bold",
  },

  textStyleFornecedor: {
    fontSize: 15,
    color: "#4D6CFA",
    marginBottom: 10,
  },

  textStyleQnt: {
    fontSize: 15,
    marginBottom: 10,
    color: "#4D6CFA",
  },
  textStyleVencimento: {
    fontSize: 15,
    marginRight: 15,
  },

  filtroContainer: {
    position: "absolute",
    backgroundColor: "#ffffff",
    elevation: 5,
    top: 0,
    borderRadius: 5,
    padding: 20,
    flex: 2,
    alignSelf: "flex-end",
  },

  filtroButtons: {
    backgroundColor: "#ffffff",
    width: 70,
    alignItems: "center",
    borderRadius: 5,
    elevation: 3,
    shadowColor: "#545454",
    marginTop: 5,
    padding: 2,
  },

  filtroText: {
    color: "#4D6CFA",
    fontSize: 16,
  },

  textDataVencimento: {
    textAlign: "center",
    color: "#2654dd",
    backgroundColor: "#cdf2ff",
    fontWeight: "bold",
    fontSize: 11,
    paddingVertical: 5,
    padding: 10,
    borderRadius: 12,
    overflow: "hidden",
  },

  textDiasAVencerCritico: {
    textAlign: "center",
    color: "#e81e1e",
    backgroundColor: "#ffd6d6",
    fontWeight: "bold",
    fontSize: 11,
    paddingVertical: 5,
    padding: 10,
    borderRadius: 12,
    overflow: "hidden",
  },

  textDiasAVencerAlerta: {
    textAlign: "center",
    color: "#e8a11e",
    backgroundColor: "#fff0d6",
    fontWeight: "bold",
    fontSize: 11,
    paddingVertical: 5,
    padding: 10,
    borderRadius: 12,
    overflow: "hidden",
  },

  sideColor: {
    position: "absolute",
    top: 0,
    left: 0,
    backgroundColor: "#4D6CFA",
    width: 10,
    height: "100%",
    borderBottomLeftRadius: 10,
    borderTopLeftRadius: 10,
  },

  sideColorAlerta: {
    position: "absolute",
    top: 0,
    left: 0,
    backgroundColor: "#fab24d",
    width: 10,
    height: "100%",
    borderBottomLeftRadius: 10,
    borderTopLeftRadius: 10,
  },

  sideColorCritico: {
    position: "absolute",
    top: 0,
    left: 0,
    backgroundColor: "#fa4d4d",
    width: 10,
    height: "100%",
    borderBottomLeftRadius: 10,
    borderTopLeftRadius: 10,
  },
});
