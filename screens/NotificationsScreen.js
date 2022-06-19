import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Keyboard,
  TouchableOpacity,
  TextInput,
  Image,
  Modal,
} from "react-native";
import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  increment,
  doc,
  orderBy,
} from "firebase/firestore";
import {
  MaterialCommunityIcons,
  FontAwesome5,
  MaterialIcons,
} from "@expo/vector-icons";
import { datab, auth, storage } from "../firebase";
import { ref, getDownloadURL } from "firebase/storage";
import { AirbnbRating } from "react-native-ratings";
import { useNavigation } from "@react-navigation/native";

const SPACING = 20;
const AVATAR_SIZE = 50;

const NotificationsScreen = () => {
  const [notifications, setNotifications] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [review, setReview] = useState("");
  const [stars, setStars] = useState(0);
  const [workerToken, setWorkerToken] = useState("");
  const [workerId, setWorkerId] = useState("");
  const [transactionID, setTransactionID] = useState("");
  const [profileImage, setProfileImage] = useState(
    Image.resolveAssetSource(require("../assets/profile.png")).uri
  );

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
          date: doc.data().date.toDate(),
        };
        try {
          const worker = await (await getDoc(doc.data().worker)).data();
          let wID = doc.data().worker.id;
          notificationData = { ...notificationData, wID };
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
            date: doc.data().date.toDate(),
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
  const completedPressed = (item) => {
    setTransactionID(item.id);
    setWorkerId(item.wID);
    setWorkerToken(item.worker.expoPushToken);
    setModalOpen(true);
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

  const handleSubmit = async () => {
    try {
      //update the users database by adding the stars and incrementing the reviews
      await updateDoc(doc(datab, "users", workerId), {
        stars: increment(stars),
        reviews: increment(1),
      });

      let updatedFields = {
        customer: doc(datab, "users", auth.currentUser.uid),
        worker: doc(datab, "users", workerId),
        date: new Date(),
        review: review,
        stars: stars,
      };

      //add the review to the "reviews" database
      await addDoc(collection(datab, "reviews"), updatedFields);
    } catch (error) {
      alert(error.message);
    }

    try {
      let updatedFields = {
        status: "reviewed",
        date: new Date(),
      };

      //set the transaction's status as reviewed
      await updateDoc(doc(datab, "transactions", transactionID), updatedFields);

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
          to: workerToken,
          sound: "default",
          title: "FixIt",
          body: customer + " left you a review!",
        }),
      });
    } catch (error) {
      alert(error.message);
    }

    loadNotifications();
    setModalOpen(false);
    setReview("");
    setStars(0);
  };

  const loadImage = (item) => {
    if (item?.customer?.profileImage) {
      const refStorage = ref(storage, item.customer.profileImage);
      getDownloadURL(refStorage).then((res) => {
        return res;
      });
    }
    if (item?.worker?.profileImage) {
      const refStorage = ref(storage, item.worker.profileImage);
      getDownloadURL(refStorage).then((res) => {
        return res;
      });
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <Modal
        transparent
        visible={modalOpen}
        animationType="slide"
        statusBarTranslucent={true}
      >
        <View style={styles.modalContainer}>
          <MaterialIcons
            name="close"
            size={24}
            style={{ alignSelf: "flex-end" }}
            onPress={() => setModalOpen(false)}
          />
          <View style={styles.inputContainer}>
            <TextInput
              placeholder="Leave a review"
              value={review}
              onChangeText={(text) => setReview(text)}
              style={styles.input}
            />
          </View>
          <AirbnbRating
            count={5}
            selectedColor="#ffcc33"
            reviewColor="#ffcc33"
            defaultRating={0}
            size={40}
            showRating={false}
            onFinishRating={(rating) => setStars(rating)}
          />
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              onPress={handleSubmit}
              style={[styles.button, styles.buttonOutline]}
            >
              <Text style={styles.buttonOutlineText}>Submit</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <FlatList
        ListEmptyComponent={<EmptyList />}
        data={notifications}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: SPACING }}
        renderItem={({ item, index }) => {
          return (
            <View style={styles.info}>
              <Image
                source={{ uri: profileImage }} //loadImage(item)
                style={styles.avatar}
              />
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
                    name="star-half-alt"
                    size={35}
                    style={{
                      alignSelf: "flex-end",
                      color: "gold",
                    }}
                    onPress={() => completedPressed(item)}
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
    alignSelf: "center",
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
  modalContainer: {
    flex: 1,
    marginTop: "65%",
    marginBottom: "65%",
    alignItems: "center",
    width: "80%",
    alignSelf: "center",
    backgroundColor: "#c7e2e2",
    paddingHorizontal: 20,
    paddingVertical: 30,
    borderRadius: 20,
    elevation: 20,
  },
  inputContainer: {
    width: "100%",
  },
  input: {
    backgroundColor: "white",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 10,
    marginBottom: 20,
    marginTop: 20,
  },
  buttonContainer: {
    width: "60%",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 40,
    marginBottom: 10,
  },
  button: {
    width: "100%",
    backgroundColor: "#267777",
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
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
    borderColor: "#267777",
    borderWidth: 2,
  },
  buttonOutlineText: {
    color: "#267777",
    fontWeight: "700",
    fontSize: 15,
  },
});
