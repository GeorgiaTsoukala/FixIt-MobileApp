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
import { MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons";
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

      //find the completed transactions where the customer is the current user
      const customerRef = doc(datab, "users/" + auth.currentUser.uid);

      const q1 = query(
        collection(datab, "transactions"),
        where("customer", "==", customerRef),
        where("status", "==", "completed"),
        orderBy("date", "desc")
      );

      const querySnapshot1 = await getDocs(q1);
      querySnapshot1.forEach(async (doc) => {
        let notificationData = {
          id: doc.id,
          status: doc.data().status,
        };
        try {
          const worker = await (await getDoc(doc.data().worker)).data();
          notificationData = { ...notificationData, worker };
        } catch (err) {
          console.log("Error", err);
        }

        setNotifications((n) => {
          return [...n, notificationData];
        });
      });

      //get user's category
      const response = await getDoc(doc(datab, "users", auth.currentUser.uid));
      let category = response?.data()?.category;

      //only for worker accounts
      if (category != "customer") {
        //find the pending/reviewed transactions where the worker is the current user
        const workerRef = doc(datab, "users/" + auth.currentUser.uid);

        const q2 = query(
          collection(datab, "transactions"),
          where("worker", "==", workerRef),
          where("status", "in", ["pending", "reviewed"])
        );

        const querySnapshot2 = await getDocs(q2);
        querySnapshot2.forEach(async (doc) => {
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
      }
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

  //function to mark a job as "done"
  const pendingPressed = (item) => async () => {
    try {
      let updatedFields = {
        status: "completed",
        date: new Date(),
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

  //function to rate/review a worker
  const completedPressed = (item) => async () => {
    try {
      let updatedFields = {
        status: "reviewed",
        date: new Date(),
      };

      //set the transaction's status as reviewed
      await updateDoc(doc(datab, "transactions", item.id), updatedFields);

      //get customer's name
      const response = await getDoc(doc(datab, "users", auth.currentUser.uid));
      let customer = "";
      if (response?.data()?.firstName && response?.data()?.lastName) {
        customer = response.data().firstName + " " + response.data().lastName;
      }

      //send a notification to the worker
      await fetch("https://exp.host/--/api/v2/push/send", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: item.worker.expoPushToken,
          sound: "default",
          title: "FixIt",
          body: customer + " left you a review!",
        }),
      });
    } catch (error) {
      alert(error.message);
    }

    loadNotifications();
  };

  //function to view a rate/review
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
              <View style={{ alignSelf: "center", width: "60%" }}>
                <Text
                  style={{
                    fontSize: 15,
                    fontWeight: "bold",
                  }}
                >
                  {item.status === "completed"
                    ? item?.worker?.firstName + " " + item?.worker?.lastName
                    : item?.customer?.firstName +
                      " " +
                      item?.customer?.lastName}
                </Text>
                {item.status === "pending" && (
                  <Text style={{ fontSize: 15, marginTop: 5 }}>hired you!</Text>
                )}
                {item.status === "completed" && (
                  <Text style={{ fontSize: 15, marginTop: 5 }}>
                    Job completed! You can now leave a review.
                  </Text>
                )}
                {item.status === "reviewed" && (
                  <Text style={{ fontSize: 15, marginTop: 5 }}>
                    left you a review!
                  </Text>
                )}
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
                    onPress={pendingPressed(item)}
                  />
                )}
                {item.status === "completed" && (
                  <FontAwesome5
                    name="star-half-alt" // rate-review
                    size={35}
                    style={{
                      alignSelf: "flex-end",
                      color: "gold",
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
                      color: "indianred",
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
