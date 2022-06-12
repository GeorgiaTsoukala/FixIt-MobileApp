import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Keyboard,
  Image,
} from "react-native";
import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  updateDoc,
  deleteDoc,
  doc,
  orderBy,
} from "firebase/firestore";
import { datab, auth } from "../firebase";
import { faker } from "@faker-js/faker";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

faker.seed(10);
const DATA = [...Array(30).keys()].map((_, i) => {
  return {
    key: faker.datatype.uuid(),
    image: faker.image.avatar(),
    name: faker.name.findName(),
    jobTitle: faker.name.jobTitle(),
    email: faker.internet.email(),
  };
});

const SPACING = 20;
const AVATAR_SIZE = 70;

const NotificationsScreen = () => {
  const [notifications, setNotifications] = useState([]);

  const navigation = useNavigation();

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      Keyboard.dismiss();
      setNotifications([]);

      //find the notifications from pending/reviewed transactions where the worker is the current user
      const workerRef = doc(datab, "users/" + auth.currentUser.uid);
      const today = new Date();

      const q = query(
        collection(datab, "transactions"),
        where("worker", "==", workerRef),
        where("status", "in", ["pending", "reviewed"]),
        where("date", "<=", today),
        orderBy("date", "desc")
      );

      const querySnapshot = await getDocs(q);
      querySnapshot.forEach(async (doc) => {
        let notificationData = {
          id: doc.id,
          status: doc.data().status,
        };
        try {
          const customer = await (await getDoc(doc.data().customer)).data();
          notificationData = { ...notificationData, customer };
        } catch (err) {
          console.log("Error", err);
        }

        setNotifications((n) => {
          return [...n, notificationData];
        });
      });
    } catch (error) {
      alert(error.message);
    }
  };

  const EmptyList = () => (
    <View>
      <Text style={{ textAlign: "center", fontWeight: "700", fontSize: 15 }}>
        You don't have any messages!
      </Text>
    </View>
  );

  const completedPressed = (item) => async () => {
    try {
      let updatedFields = {
        status: "completed",
      };

      //set the transaction's status as completed
      await updateDoc(doc(datab, "transactions", item.id), updatedFields);

      //get workers's name
      const response = await getDoc(doc(datab, "users", auth.currentUser.uid));
      let worker = "";
      if (response?.data()?.firstName && response?.data()?.lastName) {
        worker = response.data().firstName + " " + response.data().lastName;
      }

      //send a notification to the customer
      await fetch("https://exp.host/--/api/v2/push/send", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: item.customer.expoPushToken,
          sound: "default",
          title: "FixIt",
          body: "You can now leave " + worker + " a review!",
        }),
      });
    } catch (error) {
      alert(error.message);
    }

    loadNotifications();
  };

  const reviewedPressed = (id) => async () => {
    navigation.navigate("TabNavigator", { screen: "Reviews" });
    try {
      //delete the transaction
      await deleteDoc(doc(datab, "transactions", id));
    } catch (error) {
      alert(error.message);
    }
    loadNotifications();
  };

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        ListEmptyComponent={<EmptyList />}
        data={notifications}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: SPACING }}
        renderItem={({ item, index }) => {
          return (
            <View style={styles.info}>
              <Image
                source={{ uri: item.customer.profileImage }}
                style={styles.avatar}
              />
              <View style={{ alignSelf: "center", width: "60%" }}>
                <Text
                  style={{
                    fontSize: 15,
                    fontWeight: "bold",
                  }}
                >
                  {item.customer
                    ? item?.customer?.firstName + " " + item?.customer?.lastName
                    : "No Data"}
                </Text>
                <Text style={{ fontSize: 15, marginTop: 5 }}>
                  {item.status === "pending"
                    ? "hired you!"
                    : "left you a review!"}
                </Text>
              </View>
              <View style={{ alignSelf: "center" }}>
                {item.status === "pending" && (
                  <MaterialCommunityIcons
                    name="clipboard-check-outline"
                    size={40}
                    style={{
                      alignSelf: "flex-end",
                      color: "green",
                    }}
                    onPress={completedPressed(item)}
                  />
                )}
                {item.status === "reviewed" && (
                  <MaterialCommunityIcons
                    name="card-account-details-star-outline"
                    size={40}
                    style={{
                      alignSelf: "flex-end",
                      color: "#ffd700",
                    }}
                    onPress={reviewedPressed(item.id)}
                  />
                )}
              </View>
            </View>
          );
        }}
      />
    </View>
  );
};

export default NotificationsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 20,
    alignItems: "center",
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE,
    marginRight: SPACING,
  },
  info: {
    flexDirection: "row",
    padding: SPACING,
    marginBottom: SPACING,
    borderRadius: 10,
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    elevation: 8,
  },
});
