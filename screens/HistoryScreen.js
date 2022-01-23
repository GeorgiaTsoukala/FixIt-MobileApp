import React, { useState } from "react";
import { Keyboard } from "react-native";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
} from "react-native";
import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
} from "firebase/firestore";
import { datab, auth } from "../firebase";

const HistoryScreen = () => {
  const [routes, setRoutes] = useState([]);

  const pastRoutesPressed = async () => {
    try {
      Keyboard.dismiss();
      setRoutes([]);

      //find the routes where the driver is the current User
      driverRef = doc(datab, "users/" + auth.currentUser.uid);

      where("driver", "==", driverRef);
      const q = query(
        collection(datab, "routes"),
        where("driver", "==", driverRef)
      );

      const querySnapshot = await getDocs(q);
      const items = [];
      querySnapshot.forEach(async (doc) => {
        let rideData = {
          id: doc.id,
          destination: doc.data().destination,
          origin: doc.data().origin,
          date: doc.data().date.toDate(),
        };
        try {
          const driver = await (await getDoc(doc.data().driver)).data();
          rideData = { ...rideData, driver };
        } catch (err) {
          console.log("Error", err);
        }
        console.log("Found");
        setRoutes((r) => {
          return [...r, rideData];
        });
      });
    } catch (error) {
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

  return (
    <View style={styles.container} behavior="padding">
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          onPress={pastRoutesPressed}
          style={[styles.button, styles.buttonOutline]}
        >
          <Text style={styles.buttonOutlineText}>Show past routes</Text>
        </TouchableOpacity>
      </View>
      <View style={{ marginTop: 20 }}>
        <FlatList
          ListEmptyComponent={<EmptyList />}
          data={routes}
          renderItem={({ item }) => (
            <FlatListItem value={item} keyExtractor={(item) => item.id} />
          )}
        />
      </View>
    </View>
  );
};

export default HistoryScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 20,
    alignItems: "center",
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
