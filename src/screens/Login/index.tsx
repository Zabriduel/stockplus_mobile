import { StatusBar } from 'expo-status-bar';
import { TextInput, StyleSheet, Text, View, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../../../App';
import { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../../api/api';

type NavigationProps = NativeStackNavigationProp<RootStackParamList, 'Home'>;

export default function Login() {
    const navigation = useNavigation<NavigationProps>();

    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async () => {
        if (!email || !senha) {
            Alert.alert('Aviso', 'Por favor, preencha o e-mail e a senha.');
            return;
        }

        setIsLoading(true);

        try {
            const response = await api.post('/login', {
                email: email,
                senha: senha
            });
            
            const token = response.data.token;

            await AsyncStorage.setItem('@token', token);

            Alert.alert('Sucesso', 'Login realizado!');
            navigation.replace('Home');

        } catch (error: any) {
            console.error(error);

            if (error.response && error.response.data) {
                Alert.alert('Erro no Login', error.response.data.error || 'Credenciais inválidas.');
            } else {
                Alert.alert('Erro de Conexão', 'Não foi possível conectar ao servidor. Verifique se a API está rodando e se o IP está correto.');
            }
        } finally {
            setIsLoading(false); 
        }
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#F4F7FC' }}>
            <StatusBar style="dark" />
            <View style={styles.container}>
                <View style={styles.inputArea}>
                    <Text style={styles.tituloLogin}>Login</Text>

                    <Text style={styles.textoInstrucao}>Digite seu e-mail:</Text>
                    <TextInput
                        placeholder='exemplo@email.com'
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                        autoComplete="email"
                        style={styles.textInput}
                        placeholderTextColor="#999"
                        value={email}
                        onChangeText={setEmail}
                    />

                    <Text style={styles.textoInstrucao}>Digite sua senha:</Text>
                    <TextInput
                        placeholder='Sua senha'
                        secureTextEntry={true}
                        style={styles.textInput}
                        placeholderTextColor="#999"
                        value={senha}
                        onChangeText={setSenha}
                    />

                    <TouchableOpacity
                        onPress={handleLogin}
                        style={styles.button}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="#FFF" />
                        ) : (
                            <Text style={styles.text}>Entrar</Text>
                        )}
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
        backgroundColor: "#F4F7FC"
    },
    inputArea: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        width: "90%",
        padding: 25,
        justifyContent: 'center',
        alignItems: 'stretch',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    tituloLogin: {
        marginBottom: 25,
        fontWeight: 'bold',
        fontSize: 28,
        textAlign: 'left',
        color: '#1A1A1A'
    },
    textoInstrucao: {
        textAlign: 'left',
        marginBottom: 8,
        fontSize: 14,
        fontWeight: '500',
        color: '#555'
    },
    textInput: {
        backgroundColor: '#F9F9FB',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 10,
        marginBottom: 20,
        paddingHorizontal: 15,
        height: 50,
        fontSize: 15,
        color: '#333'
    },
    button: {
        backgroundColor: '#4D6CFA',
        height: 50,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10
    },
    text: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16
    }
});