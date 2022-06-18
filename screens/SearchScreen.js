import React, { useState, useRef } from "react";
import {
  Keyboard,
  StyleSheet,
  Text,
  View,
  Dimensions,
  TouchableOpacity,
  Image,
  ScrollView,
  Modal,
  Picker,
} from "react-native";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  addDoc,
} from "firebase/firestore";
import { auth, datab, storage } from "../firebase";
import { MaterialIcons } from "@expo/vector-icons";
import { ref, getDownloadURL } from "firebase/storage";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import MapView, { Callout, Marker } from "react-native-maps";
import { useNavigation } from "@react-navigation/native";

const SearchScreen = () => {
  const [category, setCategory] = useState("");
  const [address, setAddress] = useState("Enter location...");
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [options, setOptions] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [name, setName] = useState("");
  const [uid, setUid] = useState("");
  const [rating, setRating] = useState(0);
  const [phone, setPhone] = useState(0);
  const [businessAddress, setBusinessAddress] = useState("");
  const [expoPushToken, setExpoPushToken] = useState("");

  const navigation = useNavigation();

  const mapRef = useRef(null);
  const targetRegion = {
    latitude: latitude,
    longitude: longitude,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  };

  const handleHire = async () => {
    try {
      let updatedFields = {
        customer: doc(datab, "users", auth.currentUser.uid),
        worker: doc(datab, "users", uid),
        status: "pending",
        date: new Date(),
      };

      //add to the "transactions" database
      await addDoc(collection(datab, "transactions"), updatedFields);

      //get client's name
      const response = await getDoc(doc(datab, "users", auth.currentUser.uid));
      let customer = "";
      if (response?.data()?.firstName && response?.data()?.lastName) {
        customer = response.data().firstName + " " + response.data().lastName;
      }

      //send a notification to the selected worker
      await fetch("https://exp.host/--/api/v2/push/send", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: expoPushToken,
          sound: "default",
          title: "FixIt",
          body: customer + " hired you!",
        }),
      });
    } catch (error) {
      alert(error.message);
    }
  };

  const showReviews = async () => {
    navigation.navigate("RatingsScreen", { workerId: uid });
    setModalOpen(false);
  };

  const goToTarget = () => {
    //Animate the user to new region. Complete this animation in 2 seconds
    mapRef.current.animateToRegion(targetRegion, 2 * 1000);
  };

  const handleSearch = async () => {
    try {
      Keyboard.dismiss();
      setOptions([]);
      const q = query(
        collection(datab, "users"),
        where("category", "==", category.trim())
      );

      //get info from all the documents that match the search criteria
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach(async (doc) => {
        let workerData = {
          id: doc.id,
          firstName: doc.data().firstName,
          lastName: doc.data().lastName,
          phone: doc.data().phone,
          address: doc.data().address,
          category: doc.data().category,
          profileImage: doc.data().profileImage,
          expoPushToken: doc.data().expoPushToken,
          stars: doc.data().stars,
          reviews: doc.data().reviews,
          location: {
            latitude: doc.data().location.Latitude,
            longitude: doc.data().location.Longitude,
          },
        };

        setOptions((ops) => {
          return [...ops, workerData];
        });
      });

      //animate map to search coordinates
      goToTarget();
    } catch (error) {
      console.log(error.message);
      alert(error.message);
    }
  };

  const markerPressed = (data) => {
    //load profile image
    if (data?.profileImage) {
      const refStorage = ref(storage, data.profileImage);
      getDownloadURL(refStorage).then((res) => {
        setProfileImage(res);
      });
    }

    // load name/phone/address/rating
    if (data?.firstName && data?.lastName) {
      setName(data.firstName + " " + data.lastName);
    }
    if (data?.phone) {
      setPhone(data.phone);
    }
    if (data?.address) {
      setBusinessAddress(data.address);
    }
    if (data?.stars && data?.reviews) {
      setRating((data.stars / data.reviews).toFixed(1));
    }

    //load expoPushToken/uid
    if (data?.expoPushToken) {
      setExpoPushToken(data.expoPushToken);
    }
    if (data?.id) {
      setUid(data.id);
    }

    //open pop-up window
    setModalOpen(true);
  };

  return (
    <ScrollView listViewDisplayed={false} keyboardShouldPersistTaps={"handled"}>
      <View style={styles.container} behavior="padding">
        <Modal transparent visible={modalOpen} animationType="slide">
          <View style={styles.modalContainer}>
            <MaterialIcons
              name="close"
              size={24}
              style={{ alignSelf: "flex-end" }}
              onPress={() => (setModalOpen(false), setProfileImage(null))}
            />
            {profileImage && (
              <Image
                source={{ uri: profileImage }}
                style={{
                  width: 200,
                  height: 200,
                  marginTop: 15,
                  borderRadius: 10,
                }}
              />
            )}
            <Text
              style={{
                alignSelf: "center",
                marginTop: 25,
                fontSize: 18,
                fontWeight: "bold",
              }}
            >
              {name}
            </Text>
            <Text style={{ alignSelf: "center", marginTop: 25, fontSize: 15 }}>
              {businessAddress}
            </Text>
            <Text style={{ alignSelf: "center", marginTop: 10, fontSize: 15 }}>
              {phone}
            </Text>
            <Text style={{ alignSelf: "center", marginTop: 10, fontSize: 15 }}>
              Rating: {rating}
            </Text>
            <View style={{ flexDirection: "row" }}>
              <View style={styles.smallButtonContainer}>
                <TouchableOpacity
                  onPress={showReviews}
                  style={[styles.button, styles.buttonOutline]}
                >
                  <Text style={styles.buttonOutlineText}>Reviews</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.smallButtonContainer}>
                <TouchableOpacity
                  onPress={handleHire}
                  style={[styles.button, styles.buttonOutlineReverse]}
                >
                  <Text style={styles.buttonOutlineTextReverse}>Hire</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
        <Text style={{ marginTop: 15, marginBottom: 5, fontSize: 15 }}>
          What are you looking for?
        </Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={category}
            placeholderTextColor={"grey"}
            onValueChange={(itemValue) => setCategory(itemValue)}
          >
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
            <Picker.Item label="Lift Maintanance" value={"Lift Maintanance"} />
            <Picker.Item label="Locksmith" value={"Locksmith"} />
            <Picker.Item label="Painter" value={"Painter"} />
            <Picker.Item label="Plumber" value={"Plumber"} />
            <Picker.Item label="Removals" value={"Removals"} />
          </Picker>
        </View>
        <Text style={{ marginTop: 15, marginBottom: 5, fontSize: 15 }}>
          Where?
        </Text>
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
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            onPress={handleSearch}
            style={[styles.button, styles.buttonOutline]}
          >
            <Text style={styles.buttonOutlineText}>Search</Text>
          </TouchableOpacity>
        </View>
        <MapView
          style={styles.map}
          ref={mapRef} //assign ref to this MapView
          initialRegion={{
            latitude: 38.2671,
            longitude: 24.0156,
            latitudeDelta: 7,
            longitudeDelta: 7,
          }}
        >
          {options.map((item, index) => (
            <Marker key={index} coordinate={item.location}>
              <Callout onPress={() => markerPressed(item)}>
                <Text>{item.firstName + " " + item.lastName}</Text>
              </Callout>
            </Marker>
          ))}
        </MapView>
      </View>
    </ScrollView>
  );
};
export default SearchScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 20,
    alignItems: "center",
  },
  autocompleteContainer: {
    width: "80%",
    backgroundColor: "white",
    paddingHorizontal: 5,
    borderRadius: 10,
    elevation: 3,
  },
  inputContainer: {
    width: "80%",
  },
  input: {
    backgroundColor: "white",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  buttonContainer: {
    width: "60%",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 25,
    marginBottom: 10,
  },
  smallButtonContainer: {
    width: "40%",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 10,
    marginLeft: 15,
    marginRight: 15,
  },
  button: {
    width: "100%",
    backgroundColor: "#267777",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonOutline: {
    backgroundColor: "white",
    marginTop: 5,
    borderColor: "#267777",
    borderWidth: 2,
  },
  buttonOutlineText: {
    color: "#267777",
    fontWeight: "700",
    fontSize: 15,
  },
  buttonOutlineReverse: {
    backgroundColor: "#267777",
    marginTop: 5,
    borderColor: "white",
    borderWidth: 2,
  },
  buttonOutlineTextReverse: {
    color: "white",
    fontWeight: "700",
    fontSize: 15,
  },
  modalContainer: {
    flex: 1,
    marginTop: 150,
    marginBottom: 150,
    alignItems: "center",
    width: "80%",
    alignSelf: "center",
    backgroundColor: "#c7e2e2",
    paddingHorizontal: 20,
    paddingVertical: 30,
    borderRadius: 20,
    elevation: 20,
  },
  reviewsModalContainer: {
    flex: 1,
    alignItems: "center",
    alignSelf: "center",
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  pickerContainer: {
    backgroundColor: "white",
    width: "80%",
    paddingHorizontal: 15,
    borderRadius: 10,
    marginBottom: 5,
    elevation: 3,
  },
  buttonText: {
    color: "white",
    fontWeight: "700",
    fontSize: 15,
  },
  map: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height * 0.49,
  },
});
