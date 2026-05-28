import { MovimentacaoRepository } from '../repositories/movimentacoes.repository';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, ScrollView, View, ActivityIndicator } from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

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

  async function buscarMovimentacoes() {
    try {
      setCarregando(true);
      setErro('');

      const repository = new MovimentacaoRepository();
      const dados = await repository.findAll();

      console.log('DADOS DA API:', dados);

      const lista = dados.movimentacoes || dados.resultado || dados.data || dados;

      if (Array.isArray(lista)) {
        setMovimentacoes(lista);
      } else {
        setMovimentacoes([]);
        console.log('O retorno não é array:', lista);
      }

    } catch (error: any) {
      console.error(error);
      setErro('Erro ao buscar movimentações');
    } finally {
      setCarregando(false);
    }
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

        <View style={styles.topo}>
          <Text style={styles.title}>Movimentações</Text>

          <Text style={styles.descricao}>
            Controle de entradas e saídas realizadas no estoque.
          </Text>
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

              <Text style={[styles.headerText, styles.coluna]}>
                ID
              </Text>

              <Text style={[styles.headerText, styles.coluna]}>
                Lote
              </Text>

              <Text style={[styles.headerText, styles.coluna]}>
                Tipo
              </Text>

              <Text style={[styles.headerText, styles.coluna]}>
                Qtd
              </Text>

              <Text style={[styles.headerText, styles.coluna]}>
                Data
              </Text>

            </View>

            {movimentacoes.map((item) => (

              <View
                style={styles.linha}
                key={item.id_movimentacoes}
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

              </View>

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

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({

  container: {
    flexGrow: 1,
    backgroundColor: '#F3F6FB',
    padding: 20
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
  }

});