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
import background from "../assets/background.png";

const HomeScreen = () => {
  const navigation = useNavigation();

  const handleSignOut = async () => {
    try {
      await signOut(auth).then(() => {
        navigation.replace("LoginScreen");
      });
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <ImageBackground source={background} style={styles.bckground}>
      <View style={styles.container}>
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
    marginTop: 180,
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
