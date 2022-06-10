import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  Keyboard,
  Image,
  Dimensions,
} from "react-native";
import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
  orderBy,
} from "firebase/firestore";
import { datab, auth } from "../firebase";
import { faker } from "@faker-js/faker";

const { width, height } = Dimensions.get("screen");

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

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      Keyboard.dismiss();
      setNotifications([]);

      //find the notifications from pending transactions where the worker is the current user
      const workerRef = doc(datab, "users/" + auth.currentUser.uid);
      const today = new Date();

      const q = query(
        collection(datab, "transactions"),
        where("worker", "==", workerRef),
        where("status", "==", "pending"),
        where("date", "<", today),
        orderBy("date", "desc")
      );

      const querySnapshot = await getDocs(q);
      querySnapshot.forEach(async (doc) => {
        let notificationData = {
          id: doc.id,
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
      console.log(error.message);
    }
  };

  const EmptyList = () => (
    <View>
      <Text style={{ textAlign: "center", fontWeight: "700", fontSize: 15 }}>
        You don't have any messages!
      </Text>
    </View>
  );

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
              <View>
                <Text>
                  {item.customer
                    ? item?.customer?.firstName + " " + item?.customer?.lastName
                    : "No Data"}
                </Text>
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
