import { StatusBar } from 'expo-status-bar';

import {
  StyleSheet,
  Text,
  ScrollView,
  View,
  TextInput,
  TouchableOpacity
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

export default function Movimentacao() {

  return (

    <SafeAreaView style={{ flex: 1 }}>

      <ScrollView contentContainerStyle={styles.container}>
        <StatusBar style="light" />

        <Text style={styles.title}>
          Registro de Movimentações
        </Text>

        <View style={styles.form}>

          <Text style={styles.label}>ID do lote</Text>
          <TextInput
            style={styles.input}
            placeholder="Digite o ID do lote"
            placeholderTextColor="#999"
          />

          <Text style={styles.label}>Tipo de movimentação</Text>
          <TextInput
            style={styles.input}
            placeholder="Entrada ou Saída"
            placeholderTextColor="#999"
          />

          <Text style={styles.label}>Quantidade movimentada</Text>
          <TextInput
            style={styles.input}
            placeholder="Digite a quantidade"
            placeholderTextColor="#999"
            keyboardType="numeric"
          />

          <Text style={styles.label}>Data da movimentação</Text>
          <TextInput
            style={styles.input}
            placeholder="YYYY-MM-DD"
            placeholderTextColor="#999"
          />

          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>
              Registrar
            </Text>
          </TouchableOpacity>

        </View>

        <Text style={styles.subtitle}>
          Movimentações realizadas
        </Text>

        {/* <View style={styles.table}>

          <View style={styles.rowHeader}>
            <Text style={styles.headerText}>Data</Text>
            <Text style={styles.headerText}>Lote</Text>
            <Text style={styles.headerText}>Tipo</Text>
            <Text style={styles.headerText}>Qtd</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.text}>2026-05-15</Text>
            <Text style={styles.text}>1</Text>
            <Text style={styles.text}>Entrada</Text>
            <Text style={styles.text}>50</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.text}>2026-05-16</Text>
            <Text style={styles.text}>2</Text>
            <Text style={styles.text}>Saída</Text>
            <Text style={styles.text}>5</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.text}>2026-05-17</Text>
            <Text style={styles.text}>1</Text>
            <Text style={styles.text}>Saída</Text>
            <Text style={styles.text}>2</Text>
          </View>

        </View> */}

      </ScrollView>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({

  container: {
    flexGrow: 1,
    backgroundColor: '#ffffff',
    padding: 20
  },

  

});