import React from "react";
import { StyleSheet, LogBox } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import MainStackNavigator from "./StackNavigator";

LogBox.ignoreLogs(["Setting a timer for a long period of time"]);
LogBox.ignoreLogs(["Picker has been extracted"]);

export default function App() {
  return (
    <NavigationContainer>
      <MainStackNavigator />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
