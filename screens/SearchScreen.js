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

const SearchScreen = () => {
  const [location, setLocation] = useState("");
  const [date, setDate] = useState(new Date());
  const [formatedDate, setFormatedDate] = useState("Select date");
  const [mode, setMode] = useState("date");
  const [show, setShow] = useState(false);
  const [options, setOptions] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [category, setCategory] = useState("Customer");
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
    }
  };

  const showMode = (currentMode) => {
    setShow(true);
    setMode(currentMode);
  };

  const showDatepicker = () => {
    showMode("date");
  };

  const handleSearch = async () => {
    console.log(category);
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
          //date: doc.data().date.toDate(),
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

  const FlatListItemPressed = (data) => {
    //load profile image
    if (data?.profileImage) {
      const refStorage = ref(storage, data.profileImage);
      getDownloadURL(refStorage).then((res) => {
        setProfileImage(res);
      });
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
          <Text style={{ marginTop: 5 }}>Workers's info</Text>
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
          <Text style={{ alignSelf: "flex-start", marginTop: 15 }}>
            Available Seats: {availableSeats}
          </Text>
        </View>
      </Modal>
      <Text style={{ marginTop: 15, marginBottom: 5, fontSize: 15 }}>
        What are you looking for?
      </Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={category}
          onValueChange={(itemValue) => setCategory(itemValue)}
        >
          <Picker.Item label="Cleaning Services" value={"Cleaning Services"} />
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
      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Where ?"
          value={location}
          onChangeText={(text) => setLocation(text)}
          style={styles.input}
        />
      </View>
      <View style={styles.dateContainer}>
        <TouchableOpacity onPress={showDatepicker} style={styles.dateButton}>
          <Text style={styles.buttonText}>{formatedDate}</Text>
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
          data={options}
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
export default SearchScreen;

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
