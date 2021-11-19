import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Image,
  Button,
} from "react-native";
import { auth, datab, storage } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { updateDoc, doc } from "firebase/firestore";
import { ref, uploadBytes } from "firebase/storage";
import * as ImagePicker from "expo-image-picker";

const ProfileScreen = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [currentEmail, setCurrentEmail] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [carImage, setCarImage] = useState(null);

  const handleSave = async () => {
    try {
      onAuthStateChanged(auth, (user) => {
        if (user) {
          setCurrentEmail(user.email);
        }
      });

      //save images to storage
      //let filename = profileImage.substring(profileImage.lastIndexOf("/") + 1);
      //const storageRef = ref(storage, filename);

      //await uploadBytes(storageRef, profileImage);

      //update the info of current user
      const updatedFields = {
        firstName: firstName,
        lastName: lastName,
      };

      await updateDoc(doc(datab, "users", currentEmail), updatedFields);
    } catch (error) {
      alert(error.message);
      console.log("at save");
    }
  };

  const pickProfileImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
    });

    if (!result.cancelled) {
      setProfileImage(result.uri);
      console.log(result.uri);
    }
  };

  const pickCarImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
    });

    if (!result.cancelled) {
      setCarImage(result.uri);
    }
  };

  return (
    <View style={styles.container} behavior="padding">
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Button title="Pick a Profile image" onPress={pickProfileImage} />
        {profileImage && (
          <Image
            source={{ uri: profileImage }}
            style={{ width: 200, height: 200 }}
          />
        )}
      </View>
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Button title="Pick an Image of your car" onPress={pickCarImage} />
        {carImage && (
          <Image
            source={{ uri: carImage }}
            style={{ width: 200, height: 200 }}
          />
        )}
      </View>
      <View style={styles.inputContainer}>
        <TextInput
          placeholder="First Name"
          value={firstName}
          onChangeText={(text) => setFirstName(text)}
          style={styles.input}
        />
        <TextInput
          placeholder="Last Name"
          value={lastName}
          onChangeText={(text) => setLastName(text)}
          style={styles.input}
        />
        <Text style={styles.input}>Stars: 5</Text>
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

export default ProfileScreen;

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
