import React from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ImageBackground,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import background from "../assets/background.jpg";

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

  const viewHistory = async () => {
    try {
      navigation.navigate("History");
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
    <ImageBackground source={background} style={styles.bckground}>
      <View style={styles.container}>
        <TouchableOpacity onPress={viewProfile} style={styles.button}>
          <Text style={styles.buttonText}>My Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={addRoute} style={styles.button}>
          <Text style={styles.buttonText}>Add a route</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={findRide} style={styles.button}>
          <Text style={styles.buttonText}>Find a ride</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={viewHistory} style={styles.button}>
          <Text style={styles.buttonText}>View history</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleSignOut}
          style={[styles.button, styles.buttonOutline]}
        >
          <Text style={styles.buttonOutlineText}>Sign out</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  bckground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    height: "100%",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  button: {
    width: 230,
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
  buttonOutline: {
    backgroundColor: "white",
    borderColor: "indianred",
    borderWidth: 2,
  },
  buttonOutlineText: {
    color: "indianred",
    fontWeight: "700",
    fontSize: 15,
  },
});
