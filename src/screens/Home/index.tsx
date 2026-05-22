import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../../../App';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';

type NavigationProps = NativeStackNavigationProp<RootStackParamList, 'Home'>;

export default function Login() {
    const navigation = useNavigation<NavigationProps>()
    return (
        <SafeAreaView style={styles.container}>
            <TouchableOpacity style={styles.cards}>
                <FontAwesome5 name="hourglass-half" size={24} color="black" style={styles.icons} />
                <Text style={styles.info}>Vencimento próximo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cards}>
                <FontAwesome5 name="dolly-flatbed" size={24} color="black" style={styles.icons} />
                <Text style={styles.info}>Movimentações</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cards}>
                <FontAwesome5 name="exclamation-triangle" size={24} color="black" style={styles.icons} />
                <Text style={styles.info}>Estoque mínimo</Text>
            </TouchableOpacity>
        </SafeAreaView>

    );
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#4D6CFA',
        height: '100%',
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',

    },
    cards: {
        backgroundColor: '#838383',
        margin: 10,
        height: '20%',
        width: '45%',
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',

    },
    icons: {
        // color: "white",
        fontSize: 60,
        marginBottom: 10,
    },
    info: {
        // color: 'white'
        fontSize: 15,
    }
});
