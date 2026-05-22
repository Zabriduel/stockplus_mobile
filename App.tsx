import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import Login from "./src/screens/Login";
import Home from "./src/screens/Home";

import React from "react";

export type RootStackParamList = {
  Login: undefined,
  Home: undefined,
}

const Stack = createNativeStackNavigator<RootStackParamList>();
export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name='Login'
          component={Login}
          options={{
            headerShown: false
          }}
        />

        <Stack.Screen
          name="Home"
          component={Home} />

      </Stack.Navigator>
    </NavigationContainer>
  );
}

