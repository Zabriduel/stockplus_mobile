import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../../../App';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';

type NavigationProps = NativeStackNavigationProp<RootStackParamList, 'Home'>;

export default function Home() {
    const navigation = useNavigation<NavigationProps>();

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="dark" />


            <View style={styles.header}>
                <Text style={styles.headerTitle}>Home</Text>

                <TouchableOpacity
                    style={styles.logoutButton}
                    onPress={() => navigation.replace('Login')}
                >
                    <Text style={styles.logoutText}>Sair</Text>
                    <FontAwesome5 name="sign-out-alt" size={18} color="#4D6CFA" />
                </TouchableOpacity>
            </View>


            <View style={styles.cardsContainer}>
                <TouchableOpacity style={styles.cards}>
                    <FontAwesome5 name="hourglass-half" size={45} color="#4D6CFA" style={styles.icons} />
                    <Text style={styles.info}>Vencimento próximo</Text>
                </TouchableOpacity>


                <TouchableOpacity style={styles.cards}>
                    <FontAwesome5 name="dolly-flatbed" size={45} color="#4D6CFA" style={styles.icons} />
                    <Text style={styles.info}>Movimentações</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.cards}>
                    <FontAwesome5 name="exclamation-triangle" size={45} color="#4D6CFA" style={styles.icons} />
                    <Text style={styles.info}>Estoque mínimo</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.cards}  onPress={() => navigation.navigate('Produtos')}>
                    <FontAwesome5 name="hourglass-half" size={45} color="#4D6CFA" style={styles.icons} />
                    <Text style={styles.info}>Produtos</Text>
                </TouchableOpacity>

               
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F4F7FC',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: '#F4F7FC',
    },
    headerTitle: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#1A1A1A',
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 5,
    },
    logoutText: {
        color: '#4D6CFA',
        fontWeight: 'bold',
        fontSize: 16,
        marginRight: 8,
    },
    cardsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 15,
        paddingTop: 10,
        justifyContent: 'space-between',
    },
    cards: {
        backgroundColor: '#FFFFFF',
        width: '47%',
        height: 140,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
        padding: 10,
        // Sombras
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 4,
    },
    icons: {
        marginBottom: 12,
    },
    info: {
        color: '#333333',
        fontSize: 15,
        fontWeight: '600',
        textAlign: 'center',
    }
});