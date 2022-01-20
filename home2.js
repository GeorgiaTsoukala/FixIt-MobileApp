import React from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { useNavigation, NavigationContainer } from "@react-navigation/native";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import Tabs from "../tabs";

const HomeScreen = () => {
  const navigation = useNavigation();

  const viewProfile = async () => {
    try {
      navigation.navigate("Profile");
    } catch (error) {
      alert(error.message);
    }
  };

  const addRoute = async () => {
    try {
      navigation.navigate("Add a new route");
    } catch (error) {
      alert(error.message);
    }
  };

  const findRide = async () => {
    try {
      navigation.navigate("Find a ride");
    } catch (error) {
      alert(error.message);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth).then(() => {
        navigation.replace("Login");
      });
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <View>
      <Text>This is the home screen</Text>
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  button: {
    width: "60%",
    backgroundColor: "indianred",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 40,
  },
  buttonText: {
    color: "white",
    fontWeight: "700",
    fontSize: 15,
  },
});
