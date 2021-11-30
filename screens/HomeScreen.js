import React from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";

const HomeScreen = () => {
  const navigation = useNavigation();

  const handleSignOut = async () => {
    try {
      await signOut(auth).then(() => {
        navigation.replace("Login");
      });
    } catch (error) {
      alert(error.message);
    }
  };

  const addRide = async () => {
    try {
      navigation.navigate("Add a new route");
    } catch (error) {
      alert(error.message);
    }
  };

  const viewProfile = async () => {
    try {
      navigation.navigate("Profile");
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text>Welcome!!!</Text>
      <TouchableOpacity onPress={viewProfile} style={styles.button}>
        <Text style={styles.buttonText}>My Profile</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={addRide} style={styles.button}>
        <Text style={styles.buttonText}>Add a route</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Find a ride</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={handleSignOut} style={styles.button}>
        <Text style={styles.buttonText}>Sign out</Text>
      </TouchableOpacity>
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
