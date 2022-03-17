import React, { useState } from "react";
import { Keyboard } from "react-native";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Image,
  Platform,
  FlatList,
  Modal,
  Picker,
} from "react-native";
import { collection, query, where, getDocs, getDoc } from "firebase/firestore";
import { datab, storage } from "../firebase";
import DateTimePicker from "@react-native-community/datetimepicker";
import { MaterialIcons } from "@expo/vector-icons";
import { ref, getDownloadURL } from "firebase/storage";

const FindRideScreen = () => {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState(new Date());
  const [formatedDate, setFormatedDate] = useState("Select date");
  const [formatedTime, setFormatedTime] = useState("Select time");
  const [mode, setMode] = useState("date");
  const [show, setShow] = useState(false);
  const [routes, setRoutes] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [passengers, setPassengers] = useState(1);
  const [availableSeats, setAvailableSeats] = useState(0);

  const onChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShow(Platform.OS === "ios");
    setDate(currentDate);

    let tempDate = new Date(currentDate);
    if (mode == "date") {
      setFormatedDate(
        tempDate.getDate() +
          "/" +
          (tempDate.getMonth() + 1) +
          "/" +
          tempDate.getFullYear()
      );
    } else {
      setFormatedTime(tempDate.getHours() + ":" + tempDate.getMinutes());
    }
  };

  const showMode = (currentMode) => {
    setShow(true);
    setMode(currentMode);
  };

  const showDatepicker = () => {
    showMode("date");
  };

  const showTimepicker = () => {
    showMode("time");
  };

  const handleSearch = async () => {
    try {
      Keyboard.dismiss();
      setRoutes([]);
      const q = query(
        collection(datab, "routes"),
        where("origin", "==", origin.trim()),
        where("destination", "==", destination.trim()),
        where("passengers", ">=", passengers)
      );

      const querySnapshot = await getDocs(q);
      const items = [];
      querySnapshot.forEach(async (doc) => {
        let rideData = {
          id: doc.id,
          destination: doc.data().destination,
          origin: doc.data().origin,
          date: doc.data().date.toDate(),
          passengers: doc.data().passengers,
        };
        try {
          const driver = await (await getDoc(doc.data().driver)).data();
          rideData = { ...rideData, driver };
        } catch (err) {
          console.log("Error", err);
        }

        setRoutes((r) => {
          return [...r, rideData];
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
        <Text>Driver</Text>
        <Text>
          {value.driver
            ? value?.driver?.firstName + " " + value?.driver?.lastName
            : "No Data"}
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
        <Text>
          {value.date.toDateString() +
            " " +
            value.date.toLocaleTimeString("el-GR")}
        </Text>
        <Text>{value.origin + " - " + value.destination}</Text>
      </View>
    </View>
  );

  const EmptyList = () => (
    <View>
      <Text>No data Available</Text>
    </View>
  );

  const FlatListItemPressed = (data) => {
    //load profile image
    if (data.driver?.profileImage) {
      const refStorage = ref(storage, data.driver.profileImage);
      getDownloadURL(refStorage).then((res) => {
        setProfileImage(res);
      });
    }

    //load available passengers
    if (data?.passengers) {
      setAvailableSeats(data.passengers);
    }
    //open pop-up window
    setModalOpen(true);
  };

  return (
    <View style={styles.container} behavior="padding">
      <Modal transparent visible={modalOpen}>
        <View style={styles.modalContainer}>
          <MaterialIcons
            name="close"
            size={24}
            style={{ alignSelf: "flex-end" }}
            onPress={() => (setModalOpen(false), setProfileImage(null))}
          />
          <Text style={{ marginTop: 5 }}>Driver's info</Text>
          {profileImage && (
            <Image
              source={{ uri: profileImage }}
              style={{ width: 200, height: 200, marginTop: 15 }}
            />
          )}
          <Text>Profile</Text>
          <Text style={{ alignSelf: "flex-start", marginTop: 15 }}>
            Available Seats: {availableSeats}
          </Text>
        </View>
      </Modal>
      <View style={styles.dateContainer}>
        <TouchableOpacity onPress={showDatepicker} style={styles.dateButton}>
          <Text style={styles.buttonText}>{formatedDate}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={showTimepicker} style={styles.dateButton}>
          <Text style={styles.buttonText}>{formatedTime}</Text>
        </TouchableOpacity>
      </View>
      {show && (
        <DateTimePicker
          testID="dateTimePicker"
          value={date}
          mode={mode}
          is24Hour={true}
          minimumDate={new Date()}
          display="default"
          onChange={onChange}
        />
      )}
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
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={passengers}
          onValueChange={(itemValue) => setPassengers(itemValue)}
        >
          <Picker.Item label="1 Passenger" value={1} />
          <Picker.Item label="2 Passengers" value={2} />
          <Picker.Item label="3 Passengers" value={3} />
          <Picker.Item label="4 Passengers" value={4} />
        </Picker>
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          onPress={handleSearch}
          style={[styles.button, styles.buttonOutline]}
        >
          <Text style={styles.buttonOutlineText}>Search</Text>
        </TouchableOpacity>
      </View>
      <View style={{ marginTop: 20 }}>
        <FlatList
          ListEmptyComponent={<EmptyList />}
          data={routes}
          renderItem={({ item }) => (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => FlatListItemPressed(item)}
            >
              <FlatListItem value={item} keyExtractor={(item) => item.id} />
            </TouchableOpacity>
          )}
        />
      </View>
    </View>
  );
};
export default FindRideScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 20,
    alignItems: "center",
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
    marginTop: 35,
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
    marginTop: 90,
    marginBottom: 90,
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
});
