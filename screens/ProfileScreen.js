import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Image,
  Picker,
  ScrollView,
} from "react-native";
import { auth, datab, storage } from "../firebase";
import { updateDoc, doc, getDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import * as ImagePicker from "expo-image-picker";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";

const ProfileScreen = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState(0);
  const [profileImage, setProfileImage] = useState(
    Image.resolveAssetSource(require("../assets/profile.png")).uri
  );
  const [isProfileNetworkImage, setProfileNetworkImage] = useState(false);
  const [category, setCategory] = useState("Customer");
  const [address, setAddress] = useState("Address");
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);

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

      //load first name/last name/phone/address/category
      if (response?.data()?.firstName) {
        setFirstName(response.data().firstName);
      }
      if (response?.data()?.lastName) {
        setLastName(response.data().lastName);
      }
      if (response?.data()?.phone) {
        setPhone(response.data().phone);
      }
      if (response?.data()?.address) {
        setAddress(response.data().address);
      }
      if (response?.data()?.category) {
        setCategory(response.data().category);
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
        phone: phone,
        address: address,
        location: { Latitude: latitude, Longitude: longitude },
        category: category,
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

  return (
    <ScrollView listViewDisplayed={false} keyboardShouldPersistTaps={"handled"}>
      <View style={styles.container} behavior="padding">
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <TouchableOpacity onPress={pickProfileImage}>
            {profileImage && (
              <Image
                source={{ uri: profileImage }}
                style={{
                  width: 210,
                  height: 210,
                  marginTop: 20,
                  marginBottom: 20,
                  borderRadius: 10,
                }}
              />
            )}
          </TouchableOpacity>
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
          <TextInput
            placeholder="Phone Number"
            value={phone}
            onChangeText={(text) => setPhone(text)}
            style={styles.input}
          />
          <View style={styles.autocompleteContainer}>
            <GooglePlacesAutocomplete
              placeholder={address}
              textInputProps={{
                placeholderTextColor: "black",
              }}
              fetchDetails={true}
              query={{
                key: "AIzaSyDxg_ZVkVvJRQxpzjykpNBbExPtamshHEc",
                language: "en", // language of the results
              }}
              onPress={(data, details = null) => {
                setAddress(details.formatted_address);
                setLatitude(details.geometry.location.lat);
                setLongitude(details.geometry.location.lng);
              }}
              onFail={(error) => console.error(error)}
            />
          </View>
          <Text style={{ marginTop: 20, marginLeft: 5, fontSize: 15 }}>
            Customer or Professional Account ?
          </Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={category}
              onValueChange={(itemValue) => setCategory(itemValue)}
            >
              <Picker.Item label="Customer" value={"Customer"} />
              <Picker.Item
                label="Cleaning Services"
                value={"Cleaning Services"}
              />
              <Picker.Item
                label="Cooling Technician"
                value={"Cooling Technician"}
              />
              <Picker.Item
                label="Disinfecting Services"
                value={"Disinfecting Services"}
              />
              <Picker.Item label="Electrician" value={"Electrician"} />
              <Picker.Item
                label="Lift Maintanance"
                value={"Lift Maintanance"}
              />
              <Picker.Item label="Locksmith" value={"Locksmith"} />
              <Picker.Item label="Painter" value={"Painter"} />
              <Picker.Item label="Plumber" value={"Plumber"} />
              <Picker.Item label="Removals" value={"Removals"} />
            </Picker>
          </View>
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
    </ScrollView>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  autocompleteContainer: {
    width: "100%",
    backgroundColor: "white",
    paddingHorizontal: 5,
    borderRadius: 10,
  },
  container: {
    flex: 1,
    marginTop: 0,
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
    marginTop: 20,
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
  pickerContainer: {
    backgroundColor: "white",
    width: "100%",
    paddingHorizontal: 15,
    borderRadius: 10,
    marginBottom: 5,
  },
});
