import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Button,
  Platform,
  Picker,
} from "react-native";
import { addDoc, collection, doc } from "firebase/firestore";
import { datab, auth } from "../firebase";
import DateTimePicker from "@react-native-community/datetimepicker";

const AddRouteScreen = () => {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [passengers, setPassengers] = useState(1);
  const [date, setDate] = useState(new Date());
  const [formatedDate, setFormatedDate] = useState("Select date");
  const [formatedTime, setFormatedTime] = useState("Select time");
  const [mode, setMode] = useState("date");
  const [show, setShow] = useState(false);

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

  const handleSubmit = async () => {
    try {
      let updatedFields = {
        origin: origin.trim(),
        destination: destination.trim(),
        driver: doc(datab, "users", auth.currentUser.uid),
        date: date,
        passengers: passengers,
      };

      //add to the routes database
      await addDoc(collection(datab, "routes"), updatedFields);
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <View style={styles.container} behavior="padding">
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
          onPress={handleSubmit}
          style={[styles.button, styles.buttonOutline]}
        >
          <Text style={styles.buttonOutlineText}>Submit</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default AddRouteScreen;

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
    width: "80%",
    paddingHorizontal: 15,
    borderRadius: 10,
    marginBottom: 5,
  },
});
