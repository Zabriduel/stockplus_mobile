import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import Login from "./src/screens/Login";
import Home from "./src/screens/Home";
import EstoqueMin from "./src/screens/EstoqueMin/EstoqueMin";
import MovimentacaoScreen from "./src/screens/registroMovimentacoes";

import React from "react";
import Produtos from "./src/screens/Produtos";
import LotesVencimento from "./src/screens/LotesVencer";

export type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  Produtos: undefined;
  LotesVencimento: undefined;
  MovimentacaoScreen: undefined;
  EstoqueMin: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Login"
          component={Login}
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="Home"
          component={Home}
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="MovimentacaoScreen"
          component={MovimentacaoScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="EstoqueMin"
          component={EstoqueMin}
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="LotesVencimento"
          component={LotesVencimento}
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="Produtos"
          component={Produtos}
          options={{
            headerShown: false,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
