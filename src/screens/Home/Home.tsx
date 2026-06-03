import { Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../../App";

type NavigationProps = NativeStackNavigationProp<RootStackParamList,'LotesVencimento'>

export default function Home() {
    const navigation = useNavigation<NavigationProps>();
  return (
    <SafeAreaView>
        <Text>Página Home</Text>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('LotesVencimento')}>
            <Text style={{fontSize: 18}}>Lotes</Text>
        </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    backgroundColor: '#199ee6',
    color: '#fff'
  }
});
