import { StatusBar } from 'expo-status-bar';
import { TextInput, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';


export default function Login() {
    return (
        <View style={styles.inputArea}>
            <View>
            </View>
            <TextInput
                placeholder='Digite seu email'
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
            />
            <TextInput
                placeholder='Digite sua senha'
                secureTextEntry={true}
            />

            <TouchableOpacity>
                <Ionicons name="eye" color="#FFF" size={25} />
            </TouchableOpacity>
        </View>

    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    inputArea: {
        height: "100%",
        justifyContent: 'center',
        alignItems: 'center'
    }
});
