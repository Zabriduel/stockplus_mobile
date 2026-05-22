import { FlatList, View, Text, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackParamList } from "../../App";

import { StatusBar } from 'expo-status-bar';

// import { ScrollView, TextInput, TouchableOpacity } from 'react-native';

type Produto = {
    id: number;
    nomeProduto: string;
    qtdAtual: number;
};

const ESTOQUE_MINIMO = 20;

const produtos: Produto[] = [
    {
        id: 1,
        nomeProduto: "Caderno",
        qtdAtual: 3
    },
    {
        id: 2,
        nomeProduto: "Caneta",
        qtdAtual: 19
    },
    {
        id: 3,
        nomeProduto: "Caderno",
        qtdAtual: 3
    },
    {
        id: 4,
        nomeProduto: "Caneta",
        qtdAtual: 19
    },
];

const produtosBaixoEstoque = produtos.filter(
    (produto) => produto.qtdAtual < ESTOQUE_MINIMO
);

type NavigationProps = NativeStackNavigationProp<RootStackParamList>;

export default function EstoqueMin() {

    const navigation = useNavigation<NavigationProps>();

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.title}>
                Produtos abaixo do estoque mínimo
            </Text>

            <FlatList
                data={produtosBaixoEstoque}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        <Text style={styles.nomeProd}>{item.nomeProduto}</Text>

                        <Text>
                            Estoque atual: {item.qtdAtual}
                        </Text>

                        <Text>
                            Estoque mínimo: {ESTOQUE_MINIMO}
                        </Text>
                    </View>
                )}
            />
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({

    container: {
        flex: 1,
        backgroundColor: '#dde3ff',
    },

    title: {
        color: '#4D6CFA',
        fontWeight: 'bold',
        fontSize: 22,
        marginBottom: 3,
        alignSelf: 'center'
    },

    nomeProd: {
        fontSize: 20,
        fontWeight: 'bold'
    },

    card: {
        width: '80%',
        marginHorizontal: 20,
        marginTop: 30,
        padding: 20,
        backgroundColor: '#fff',
        borderRadius: 10,
        alignSelf: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 5,
    },

    /* 
    titulo: {
        fontSize: 25,
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#d86868'
    },

    img_logo: {
        position: 'absolute',
        top: 13,
        left: 15,
        width: 100,
        height: 100,
        zIndex: 2,
        resizeMode: 'contain'
    },

    linha: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 20
    },

    texto: {
        fontSize: 23,
        marginTop: 5
    },

    img_fundo: {
        position: 'absolute',
        bottom: 90,
        right: 0,
        width: 200,
        height: 350,
        resizeMode: 'contain',
        opacity: 0.9
    }
    */

});