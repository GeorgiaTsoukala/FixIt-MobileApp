import React, { useState, useEffect } from "react";
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
import { updateDoc, doc, getDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import * as ImagePicker from "expo-image-picker";

const ProfileScreen = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [profileImage, setProfileImage] = useState(
    Image.resolveAssetSource(require("../assets/profile.png")).uri
  );
  const [isProfileNetworkImage, setProfileNetworkImage] = useState(false);
  const [carImage, setCarImage] = useState(
    Image.resolveAssetSource(require("../assets/car.png")).uri
  );
  const [isCarNetworkImage, setCarNetworkImage] = useState(false);

  useEffect(() => {
    updateScreen();
  }, []);

  const updateScreen = async () => {
    const response = await getDoc(doc(datab, "users", auth.currentUser.uid));
    if (response?.data()) {
      //load profile image
      if (response?.data()?.profileImage) {
        const refStorage = ref(storage, response.data().profileImage);
        getDownloadURL(refStorage).then((res) => {
          setProfileImage(res);
          setProfileNetworkImage(true);
        });
      }
      //load car image
      if (response?.data()?.carImage) {
        const refStorage = ref(storage, response.data().carImage);
        getDownloadURL(refStorage).then((res) => {
          setCarImage(res);
          setCarNetworkImage(true);
        });
      }
      //load first name/last name
      if (response?.data()?.firstName) {
        setFirstName(response.data().firstName);
      }
      if (response?.data()?.lastName) {
        setLastName(response.data().lastName);
      }
    }
  };

  const getImageBlob = (uri) => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onload = function () {
        resolve(xhr.response);
      };
      xhr.onerror = function (e) {
        console.log(e);
        reject(new TypeError("Network request failed"));
      };
      xhr.responseType = "blob";
      xhr.open("GET", uri, true);
      xhr.send(null);
    });
  };

  const saveImage = async (fullImagePath, filename) => {
    const storageRef = ref(storage, filename);
    const blob = await getImageBlob(fullImagePath);
    await uploadBytes(storageRef, blob);
  };

  const handleSave = async () => {
    try {
      let updatedFields = {
        firstName: firstName,
        lastName: lastName,
      };

      //save profile image to storage
      if (profileImage && !isProfileNetworkImage) {
        let filename = profileImage.substring(
          profileImage.lastIndexOf("/") + 1
        );
        await saveImage(profileImage, filename);
        updatedFields = {
          ...updatedFields,
          profileImage: filename,
        };
      }
      //save car image to storage
      if (carImage && !isCarNetworkImage) {
        let filename = carImage.substring(carImage.lastIndexOf("/") + 1);
        await saveImage(carImage, filename);
        updatedFields = {
          ...updatedFields,
          carImage: filename,
        };
      }

      //update the users database
      await updateDoc(doc(datab, "users", auth.currentUser.uid), updatedFields);
    } catch (error) {
      alert(error.message);
    }
  };

  const pickProfileImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
    });

    if (!result.cancelled) {
      setProfileImage(result.uri);
      setProfileNetworkImage(false);
    }
  };

  const pickCarImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
    });

    if (!result.cancelled) {
      setCarImage(result.uri);
      setCarNetworkImage(false);
    }
  };

  return (
    <View style={styles.container} behavior="padding">
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <TouchableOpacity onPress={pickProfileImage} style={styles.button}>
          <Text style={styles.buttonText}>Pick a Profile image</Text>
        </TouchableOpacity>
        {profileImage && (
          <Image
            source={{ uri: profileImage }}
            style={{ width: 200, height: 200 }}
          />
        )}
      </View>
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <TouchableOpacity onPress={pickCarImage} style={styles.button}>
          <Text style={styles.buttonText}>Pick an image of your car</Text>
        </TouchableOpacity>
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
    marginTop: 20,
    marginBottom: 10,
  },
  button: {
    width: "100%",
    backgroundColor: "indianred",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "700",
    fontSize: 15,
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
