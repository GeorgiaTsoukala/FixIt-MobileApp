import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Button,
  Platform,
} from "react-native";
import { collection, query, where, getDocs } from "firebase/firestore";
import { datab, auth } from "../firebase";
import DateTimePicker from "@react-native-community/datetimepicker";

const FindRideScreen = () => {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState(new Date());
  const [formatedDate, setFormatedDate] = useState("Date");
  const [formatedTime, setFormatedTime] = useState("Time");
  const [mode, setMode] = useState("date");
  const [show, setShow] = useState(false);
  const [routes, setRoutes] = useState([]);

  const onChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShow(Platform.OS === "ios");
    setDate(currentDate);

    let tempDate = new Date(currentDate);
    if (mode == "date") {
      setFormatedDate(
        tempDate.getMonth() +
          1 +
          "/" +
          tempDate.getDate() +
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

  const showRoutes = () => {
    console.log("showRoutes");
    routes.map((route) => {
      console.log(route.date);
    });
  };

  const handleSearch = async () => {
    try {
      const q = query(
        collection(datab, "routes"),
        where("origin", "==", origin.trim()),
        where("destination", "==", destination.trim())
      );
      console.log(origin);
      console.log(destination);

      const querySnapshot = await getDocs(q);
      const items = [];
      querySnapshot.forEach((doc) => {
        items.push(doc.data());
        console.log("found");
      });

      setRoutes(items);
      showRoutes();
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <View style={styles.container} behavior="padding">
      <View>
        <Button onPress={showDatepicker} title={formatedDate} />
      </View>
      <View>
        <Button onPress={showTimepicker} title={formatedTime} />
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
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          onPress={handleSearch}
          style={[styles.button, styles.buttonOutline]}
        >
          <Text style={styles.buttonOutlineText}>Search</Text>
        </TouchableOpacity>
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
