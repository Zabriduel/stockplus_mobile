import { StatusBar } from 'expo-status-bar';
import { TextInput, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../../../App';

type NavigationProps = NativeStackNavigationProp<RootStackParamList, 'Home'>;

export default function Login() {
    const navigation = useNavigation<NavigationProps>()
    return (
        <SafeAreaView style={{ flex: 1 }}>
            <View style={styles.container}>

                <View style={styles.inputArea}>

                    <Text style={styles.tituloLogin}> Login </Text>
                    <Text  style={styles.textoInstrucao}> Digite seu e-mail:</Text>
                    <TextInput
                        placeholder='Digite seu email'
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                        autoComplete="email"
                        style={styles.textInput}
                    />
                    <Text  style={styles.textoInstrucao}> Digite sua senha</Text>
                    <TextInput
                        placeholder='Digite sua senha'
                        secureTextEntry={true}
                        style={styles.textInput}
                    />
                    <TouchableOpacity onPress={() => navigation.navigate('Home')} style={styles.button}>
                        <Text style={styles.text}>Login</Text>
                    </TouchableOpacity>

                </View>
            </View>
        </SafeAreaView>

    );
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: "#4D6CFA"
    },
    inputArea: {
        backgroundColor: 'rgb(180, 180, 206)',
        height: "60%",
        borderRadius: 10,
        width: "90%",
        justifyContent: 'center',
        alignItems: 'stretch', // Estica os filhos para usar a largura total disponível
        paddingHorizontal: 20 // Cria uma margem interna nas laterais esquerda e direita
    },
    tituloLogin: {
        marginBottom: 20,
        fontWeight: 'bold',
        fontSize: 25,
        textAlign: 'left' // Alinha o título na esquerda
    },
    textoInstrucao: { // Classe para os textos de orientação
        textAlign: 'left', // Garante o texto na esquerda
        marginBottom: 5,
        fontSize: 14,
        color: '#333'
    },
    textInput: {
        backgroundColor: 'white',
        borderRadius: 10,
        marginBottom: 15,
        paddingHorizontal: 15, // Afasta o texto digitado da borda esquerda do input
        height: 45,
        textAlign: 'left' // Texto digitado começa na esquerda
    },
    button: {
        backgroundColor: '#4D6CFA',
        height: 45,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center', // Mantém o texto "Login" centralizado dentro do botão
        marginTop: 15
    },
    text: {
        color: 'white',
        fontWeight: 'bold'
    }
});
