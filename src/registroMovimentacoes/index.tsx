import { MovimentacaoRepository } from '../repositories/movimentacoes.repository';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, ScrollView, View, ActivityIndicator, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

interface Movimentacao {
  id_movimentacoes: number;
  fk_id_lote: number;
  fk_id_tipo_mov: number;
  tipo_movimentacao?: string;
  qnt_movimentada: number;
  data_movimentacao: string;
}

export default function MovimentacaoScreen() {

  const [movimentacoes, setMovimentacoes] = useState<Movimentacao[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [selecionada, setSelecionada] = useState<Movimentacao | null>(null);
  const [quantidade, setQuantidade] = useState('');
  const [lote, setLote] = useState('');
  const [tipoMov, setTipoMov] = useState('');
  const [dataMov, setDataMov] = useState('');
  const [menuAberto, setMenuAberto] = useState(false);
  const [loteFiltro, setLoteFiltro] = useState('');
  const [mostrarFiltro, setMostrarFiltro] = useState(false);

  async function buscarMovimentacoes() {
    try {
      setCarregando(true);
      setErro('');

      const repository = new MovimentacaoRepository();
      const dados = await repository.findAll();

      const lista = dados.movimentacoes || dados.resultado || dados.data || dados;

      if (Array.isArray(lista)) {
        setMovimentacoes(lista);
      } else {
        setMovimentacoes([]);
      }

    } catch (error: any) {
      console.error(error);
      setErro('Erro ao buscar movimentações');
    } finally {
      setCarregando(false);
    }
  }

  async function buscarPorLote() {
    try {
      const repository = new MovimentacaoRepository();

      const dados = await repository.findByLote(Number(loteFiltro));

      const lista = dados.movimentacoes || dados.resultado || dados.data || dados;

      if (Array.isArray(lista)) {
        setMovimentacoes(lista);
      }

    } catch (error) {
      console.error(error);
    }
  }

  function abrirCriar() {
    setSelecionada(null);
    setLote('');
    setTipoMov('');
    setQuantidade('');
    setDataMov('');
    setModalVisible(true);
  }

  function abrirEditar(item: Movimentacao) {
    setSelecionada(item);
    setLote(String(item.fk_id_lote));
    setTipoMov(item.fk_id_tipo_mov === 4 ? 'Entrada' : 'Saída');
    setQuantidade(String(item.qnt_movimentada));
    setDataMov(new Date(item.data_movimentacao).toLocaleDateString('pt-BR'));
    setModalVisible(true);
  }

  async function salvarMovimentacao() {
    try {
      const tipoId =
        tipoMov.toLowerCase() === 'entrada'
          ? 4
          : tipoMov.toLowerCase() === 'saída' || tipoMov.toLowerCase() === 'saida'
            ? 5
            : 4;

      const repository = new MovimentacaoRepository();

      const dataBanco = formatarDataParaBanco(dataMov);
      const ano = Number(dataBanco.substring(0, 4));

      if (ano < 2000 || ano > 2035) {
        alert('Digite uma data válida. Exemplo: 03/06/2026');
        return;
      }

      const dados = {
        idLote: Number(lote),
        idTipoMov: tipoId,
        qntMovimentada: Number(quantidade),
        dataMovimentacao: dataBanco
      };

      if (selecionada) {
        await repository.update(selecionada.id_movimentacoes, dados);
      } else {
        await repository.create(dados);
      }

      setModalVisible(false);
      setSelecionada(null);
      setLote('');
      setTipoMov('');
      setQuantidade('');
      setDataMov('');

      buscarMovimentacoes();

    } catch (error: any) {
      console.error('ERRO API:', error.response?.data || error.message);
    }
  }

  async function excluirMovimentacao() {
    if (!selecionada) return;

    Alert.alert(
      'Excluir movimentação',
      'Tem certeza que deseja excluir esta movimentação?',
      [
        {
          text: 'Cancelar',
          style: 'cancel'
        },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              const repository = new MovimentacaoRepository();

              await repository.delete(selecionada.id_movimentacoes);

              setModalVisible(false);
              setSelecionada(null);

              buscarMovimentacoes();

            } catch (error) {
              console.error(error);
            }
          }
        }
      ]
    );
  }

  function formatarDataDigitada(texto: string) {
    const numeros = texto.replace(/\D/g, '');

    if (numeros.length <= 2) {
      return numeros;
    }

    if (numeros.length <= 4) {
      return `${numeros.slice(0, 2)}/${numeros.slice(2)}`;
    }

    return `${numeros.slice(0, 2)}/${numeros.slice(2, 4)}/${numeros.slice(4, 8)}`;
  }

  function formatarDataParaBanco(data: string) {
    if (data.includes('/')) {
      const partes = data.split('/');

      if (partes[0].length !== 2 || partes[1].length !== 2 || partes[2].length !== 4) {
        throw new Error('Data inválida. Use o formato DD/MM/AAAA.');
      }

      return `${partes[2]}-${partes[1]}-${partes[0]}`;
    }

    return data;
  }

  useEffect(() => {
    buscarMovimentacoes();
  }, []);

  function formatarData(data: string) {
    return new Date(data).toLocaleDateString('pt-BR');
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        <StatusBar style="dark" />

        <View style={styles.topoLinha}>
          <View>
            <Text style={styles.title}>Movimentações</Text>

            <Text style={styles.descricao}>
              Controle de entradas e saídas realizadas no estoque.
            </Text>
          </View>

          <TouchableOpacity
            style={styles.menuBotao}
            onPress={abrirCriar}
          >
            <Text style={styles.menuTexto}>+</Text>
          </TouchableOpacity>
        </View>



        <View style={styles.filtroContainer}>
          <TextInput
            value={loteFiltro}
            onChangeText={setLoteFiltro}
            placeholder="Filtrar por lote"
            keyboardType="numeric"
            style={styles.inputFiltro}
          />

          <TouchableOpacity
            style={styles.iconeFiltro}
            onPress={() => {
              if (loteFiltro) {
                buscarPorLote();
              } else {
                buscarMovimentacoes();
              }
            }}
          >
            <Ionicons
              name="search"
              size={20}
              color="#4D6CFA"
            />
          </TouchableOpacity>

          {loteFiltro !== '' && (
            <TouchableOpacity
              style={styles.iconeLimpar}
              onPress={() => {
                setLoteFiltro('');
                buscarMovimentacoes();
              }}
            >
              <Ionicons
                name="close"
                size={18}
                color="#6B7280"
              />
            </TouchableOpacity>
          )}
        </View>

        {carregando && (
          <ActivityIndicator
            size="large"
            color="#4D6CFA"
          />
        )}

        {erro !== '' && (
          <Text style={styles.erro}>
            {erro}
          </Text>
        )}

        {!carregando && erro === '' && (

          <View style={styles.tabela}>

            <View style={styles.linhaTexto}>
              <Text style={[styles.headerText, styles.coluna]}>ID</Text>
              <Text style={[styles.headerText, styles.coluna]}>Lote</Text>
              <Text style={[styles.headerText, styles.coluna]}>Tipo</Text>
              <Text style={[styles.headerText, styles.coluna]}>Qtd</Text>
              <Text style={[styles.headerText, styles.coluna]}>Data</Text>
            </View>

            {movimentacoes.map((item) => (
              <TouchableOpacity
                style={styles.linha}
                key={item.id_movimentacoes}
                onPress={() => abrirEditar(item)}
              >

                <Text style={[styles.text, styles.coluna]}>
                  {item.id_movimentacoes}
                </Text>

                <Text style={[styles.text, styles.coluna]}>
                  {item.fk_id_lote}
                </Text>

                <Text
                  style={[
                    item.fk_id_tipo_mov === 4
                      ? styles.entrada
                      : styles.saida,
                    styles.coluna
                  ]}
                >
                  {item.fk_id_tipo_mov === 4 ? 'Entrada' : 'Saída'}
                </Text>

                <Text style={[styles.text, styles.coluna]}>
                  {item.qnt_movimentada}
                </Text>

                <Text style={[styles.text, styles.coluna]}>
                  {formatarData(item.data_movimentacao)}
                </Text>

              </TouchableOpacity>
            ))}

            {movimentacoes.length === 0 && (

              <View style={styles.semDados}>

                <Text style={styles.textoSemDados}>
                  Nenhuma movimentação encontrada.
                </Text>

              </View>

            )}

          </View>

        )}

        <Modal
          visible={modalVisible}
          transparent
          animationType="slide"
        >
          <View style={styles.modalOverlay}>

            <View style={styles.modalContainer}>

              <Text style={styles.modalTitle}>
                {selecionada ? 'Editar Movimentação' : 'Nova Movimentação'}
              </Text>

              <Text style={styles.label}>Lote</Text>
              <TextInput value={lote} onChangeText={setLote} keyboardType="numeric" placeholder="ID do lote" style={styles.input} />

              <Text style={styles.label}>Tipo de movimentação</Text>
              <TextInput value={tipoMov} onChangeText={setTipoMov} placeholder="Entrada ou Saída" style={styles.input} />

              <Text style={styles.label}>Quantidade</Text>
              <TextInput value={quantidade} onChangeText={setQuantidade} keyboardType="numeric" placeholder="Quantidade movimentada" style={styles.input} />

              <Text style={styles.label}>Data</Text>
              <TextInput value={dataMov} onChangeText={(texto) => setDataMov(formatarDataDigitada(texto))} keyboardType="numeric" placeholder="Ex: 03/06/2026" maxLength={10} style={styles.input} />

              <TouchableOpacity
                style={styles.botaoSalvar}
                onPress={salvarMovimentacao}
              >
                <Text style={styles.textoSalvar}>
                  Salvar
                </Text>
              </TouchableOpacity>

              {selecionada && (
                <TouchableOpacity
                  style={styles.botaoExcluir}
                  onPress={excluirMovimentacao}
                >
                  <Text style={styles.textoExcluir}>Excluir Movimentação</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.textoCancelar}>Cancelar</Text>
              </TouchableOpacity>

            </View>

          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#F4F7FC',
    paddingHorizontal: 20,
    paddingBottom: 100,
    paddingTop: 40
  },

  topo: {
    marginBottom: 22,
    paddingHorizontal: 4,
    alignItems: 'center'
  },

  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4D6CFA',
    marginBottom: 6,
    textAlign: 'center'
  },

  descricao: {
    color: '#6B7280',
    fontSize: 14,
    lineHeight: 20
  },

  tabela: {
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    elevation: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },

  linhaTexto: {
    flexDirection: 'row',
    backgroundColor: '#4D6CFA',
    paddingVertical: 14,
    paddingHorizontal: 4
  },

  headerText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 11
  },

  linha: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF2F7',
    backgroundColor: '#FFFFFF'
  },

  text: {
    textAlign: 'center',
    color: '#374151',
    fontSize: 12
  },

  entrada: {
    textAlign: 'center',
    color: '#15803D',
    backgroundColor: '#DCFCE7',
    fontWeight: 'bold',
    fontSize: 11,
    paddingVertical: 5,
    borderRadius: 12,
    overflow: 'hidden'
  },

  saida: {
    textAlign: 'center',
    color: '#B91C1C',
    backgroundColor: '#FEE2E2',
    fontWeight: 'bold',
    fontSize: 11,
    paddingVertical: 5,
    borderRadius: 12,
    overflow: 'hidden'
  },

  coluna: {
    flex: 1,
    textAlign: 'center',
    paddingHorizontal: 2
  },

  erro: {
    textAlign: 'center',
    color: '#DC2626',
    fontWeight: 'bold',
    marginTop: 20
  },

  semDados: {
    padding: 20,
    alignItems: 'center'
  },

  textoSemDados: {
    color: '#6B7280',
    fontSize: 14
  },

  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)'
  },

  modalContainer: {
    backgroundColor: '#FFFFFF',
    width: '85%',
    padding: 20,
    borderRadius: 16
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#4D6CFA'
  },

  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    padding: 10,
    marginBottom: 15
  },

  botaoSalvar: {
    backgroundColor: '#4D6CFA',
    padding: 12,
    borderRadius: 10,
    marginBottom: 10
  },

  textoSalvar: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: 'bold'
  },

  textoCancelar: {
    textAlign: 'center',
    color: '#EF4444',
    fontWeight: 'bold'
  },

  label: {
    color: '#374151',
    fontWeight: 'bold',
    fontSize: 13,
    marginBottom: 6
  },

  botaoExcluir: {
    backgroundColor: '#DC2626',
    padding: 12,
    borderRadius: 10,
    marginBottom: 10
  },

  textoExcluir: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: 'bold'
  },

  topoLinha: {
    alignItems: 'center',
    marginBottom: 16
  },

  menuBotao: {
    position: 'absolute',
    right: 0,
    top: -25,
    backgroundColor: '#4D6CFA',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center'
  },

  menuTexto: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold'
  },

  opcaoMenu: {
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 3
  },

  opcaoMenuTexto: {
    color: '#4D6CFA',
    fontWeight: 'bold',
    textAlign: 'center'
  },

  menuSuspenso: {
    position: 'absolute',
    top: 50,
    right: 18,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 8,
    width: 130,
    elevation: 8,
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8
  },

  itemMenu: {
    color: '#374151',
    fontWeight: '600',
    fontSize: 14,
    paddingVertical: 12,
    paddingHorizontal: 16
  },

  filtroContainer: {
    position: 'relative',
    marginBottom: 16
  },

  inputFiltro: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingVertical: 10,
    paddingLeft: 12,
    paddingRight: 42,
    backgroundColor: '#FFFFFF'
  },

  iconeFiltro: {
    position: 'absolute',
    right: 12,
    top: 10
  },

  iconeLimpar: {
    position: 'absolute',
    right: 42,
    top: 11
  }

});