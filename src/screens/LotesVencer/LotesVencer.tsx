import { FlatList, View, Text } from "react-native";
import {useNavigation} from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../../App";

 export type Lote = {
    id: number,
    nomeProduto: string,
    nomeFornecedor: string,
    qtdLote: number,
    dataVencimento: string
}

const diasVencer = (dataVencimento: string): string => {
    const dataConvertida = new Date(dataVencimento);
    const dataAtual = new Date();
    const diasAVencer = dataAtual.getDate() - dataConvertida.getDate();
    if (diasAVencer <= 90) {
        return (
            "Vence em 90 Dias!!"
        )
    } else {
        return (
            "Fora do prazo de vencimento"
        )
    }
}
type NavigationProps = NativeStackNavigationProp<RootStackParamList>;


export default function LotesVencimento() {
const lotes: Lote[] = [
    {
        id: 1,
        nomeProduto: "Caderno",
        nomeFornecedor: "Apple",
        qtdLote: 123,
        dataVencimento: "2024/02/20"
    }
];

const navigation = useNavigation<NavigationProps>();
    return (
        <View>
             <FlatList data={lotes} keyExtractor={(item) => item.id.toString()} renderItem={({ item }) => (
                <View>
                    <Text>{item.id}</Text>
                    <Text>{item.nomeProduto}</Text>
                    <Text>{item.nomeFornecedor}</Text>
                    <Text>{item.qtdLote}</Text>
                    <Text>{item.dataVencimento}</Text>
                    <Text>diasVencer({item.dataVencimento});</Text>
                </View>
            )}
            />
       </View>
    )
}