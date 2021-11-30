import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { addDoc, collection, doc } from "firebase/firestore";
import { datab, auth } from "../firebase";

const addRouteScreen = () => {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");

  const handleSave = async () => {
    try {
      let updatedFields = {
        origin: origin,
        destination: destination,
        driver: doc(datab, "users", auth.currentUser.uid),
      };

      //add to the routes database
      await addDoc(collection(datab, "routes"), updatedFields);
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <View style={styles.container} behavior="padding">
      <View style={styles.inputContainer}>
        <TextInput
          placeholder="From"
          value={origin}
          onChangeText={(text) => setOrigin(text)}
          style={styles.input}
        />
        <TextInput
          placeholder="To"
          value={destination}
          onChangeText={(text) => setDestination(text)}
          style={styles.input}
        />
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          onPress={handleSave}
          style={[styles.button, styles.buttonOutline]}
        >
          <Text style={styles.buttonOutlineText}>Save</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default addRouteScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 20,
    alignItems: "center",
  },
  inputContainer: {
    width: "80%",
  },
  input: {
    backgroundColor: "white",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 10,
    marginBottom: 5,
  },
  buttonContainer: {
    width: "60%",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 35,
  },
  button: {
    width: "100%",
    backgroundColor: "indianred",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonOutline: {
    backgroundColor: "white",
    marginTop: 5,
    borderColor: "indianred",
    borderWidth: 2,
  },
  buttonOutlineText: {
    color: "indianred",
    fontWeight: "700",
    fontSize: 15,
  },
});
