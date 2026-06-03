import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { StyleSheet, Text, View } from 'react-native';
import LotesVencimento from "./src/screens/LotesVencer";
import Home from "./src/screens/Home/Home";
export type RootStackParamList = {
  Home: undefined,
  LotesVencimento: undefined
}

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{headerShown: true}}>
        <Stack.Screen name='Home' component={Home}></Stack.Screen>
        <Stack.Screen name='LotesVencimento' component={LotesVencimento}></Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>

   
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
