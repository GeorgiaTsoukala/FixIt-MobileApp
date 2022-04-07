import React, { useState } from "react";
import { Keyboard } from "react-native";
import {
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
import { collection, query, where, getDocs, getDoc } from "firebase/firestore";
import { datab, storage } from "../firebase";
import { MaterialIcons } from "@expo/vector-icons";
import { ref, getDownloadURL } from "firebase/storage";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import MapView, { Callout, Marker } from "react-native-maps";

const staticData = [
  { coordinates: { latitude: 37.78383, longitude: -122.405766 }, name: "jj" },
  {
    coordinates: { latitude: 37.78584, longitude: -122.405478 },
    name: "fj",
  },
  {
    coordinates: { latitude: 37.784738, longitude: -122.402839 },
    name: "ff",
  },
];

const SearchScreen = () => {
  const [category, setCategory] = useState("Customer");
  const [address, setAddress] = useState("Enter location...");
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [options, setOptions] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [name, setName] = useState("");
  const [rating, setRating] = useState(0);
  const [phone, setPhone] = useState(0);

  const handleSearch = async () => {
    try {
      Keyboard.dismiss();
      setOptions([]);
      const q = query(
        collection(datab, "users"),
        where("category", "==", category.trim())
      );

      const querySnapshot = await getDocs(q);
      querySnapshot.forEach(async (doc) => {
        let workerData = {
          id: doc.id,
          firstName: doc.data().firstName,
          lastName: doc.data().lastName,
          phone: doc.data().phone,
          category: doc.data().category,
          profileImage: doc.data().profileImage,
          location: {
            latitude: 39.3697823,
            longitude: 22.9373009,
          },
        };

        setOptions((ops) => {
          return [...ops, workerData];
        });
      });
    } catch (error) {
      console.log(error.message);
      alert(error.message);
    }
  };

  const FlatListItem = ({ value }) => (
    <View
      style={{
        backgroundColor: "#ddd",
        borderRadius: 18,
        elevation: 4,
        marginTop: 10,
        paddingHorizontal: 15,
        paddingVertical: 8,
        flexDirection: "row",
      }}
    >
      <View
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Text>Worker</Text>
        <Text>
          {value ? value?.firstName + " " + value?.lastName : "No Data"}
        </Text>
      </View>
      <View
        style={{
          borderRightWidth: 3,
          borderRightColor: "#bbb",
          marginHorizontal: 10,
        }}
      ></View>
      <View style={{ display: "flex", flexDirection: "column" }}>
        <Text>{value.category}</Text>
      </View>
    </View>
  );

  const EmptyList = () => (
    <View>
      <Text>No data Available</Text>
    </View>
  );

  const markerPressed = (data) => {
    //load profile image
    if (data?.profileImage) {
      const refStorage = ref(storage, data.profileImage);
      getDownloadURL(refStorage).then((res) => {
        setProfileImage(res);
      });
    }

    // load name/phone
    if (data?.firstName && data?.lastName) {
      setName(data.firstName);
    }
    if (data?.phone) {
      setPhone(data.phone);
    }
    firstName;
    //open pop-up window
    setModalOpen(true);
  };

  return (
    <ScrollView>
      <View style={styles.container} behavior="padding">
        <Modal transparent visible={modalOpen}>
          <View style={styles.modalContainer}>
            <MaterialIcons
              name="close"
              size={24}
              style={{ alignSelf: "flex-end" }}
              onPress={() => (setModalOpen(false), setProfileImage(null))}
            />
            <Text style={{ marginTop: 5 }}>Workers's info</Text>
            {profileImage && (
              <Image
                source={{ uri: profileImage }}
                style={{
                  width: 200,
                  height: 200,
                  marginTop: 25,
                  borderRadius: 10,
                }}
              />
            )}
            <Text style={{ alignSelf: "flex-start", marginTop: 25 }}>
              Name: {name}
            </Text>
            <Text style={{ alignSelf: "flex-start", marginTop: 5 }}>
              Address: {}
            </Text>
            <Text style={{ alignSelf: "flex-start", marginTop: 5 }}>
              Phone: {phone}
            </Text>
            <Text style={{ alignSelf: "flex-start", marginTop: 5 }}>
              Rating: {}
            </Text>
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
              placeholderTextColor: "grey",
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
                <Text>
                  {item.firstName}
                  {item.lastName}
                </Text>
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
  },
  dateContainer: {
    width: "40%",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    marginBottom: 10,
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
  dateButton: {
    width: "80%",
    backgroundColor: "indianred",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginRight: 5,
    marginLeft: 5,
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
  modalContainer: {
    flex: 1,
    marginTop: 160,
    marginBottom: 160,
    alignItems: "center",
    width: "80%",
    alignSelf: "center",
    backgroundColor: "white",
    paddingHorizontal: 20,
    paddingVertical: 30,
    borderRadius: 20,
    elevation: 20,
  },
  pickerContainer: {
    backgroundColor: "white",
    width: "80%",
    paddingHorizontal: 15,
    borderRadius: 10,
    marginBottom: 5,
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
