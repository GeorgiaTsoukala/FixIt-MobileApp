import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, FlatList, Keyboard } from "react-native";
import {
  collection,
  doc,
  query,
  where,
  getDocs,
  getDoc,
  orderBy,
} from "firebase/firestore";
import { datab, auth } from "../firebase";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const SPACING = 20;

const ReviewsScreen = () => {
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    loadReviews();
  }, []);

  //load the reviews where the current user is the worker or the customer
  const loadReviews = async () => {
    try {
      Keyboard.dismiss();
      setReviews([]);

      //find the reviews where the current user is the customer
      const customerRef = doc(datab, "users/" + auth.currentUser.uid);

      const q1 = query(
        collection(datab, "reviews"),
        where("customer", "==", customerRef),
        orderBy("date", "desc")
      );

      const querySnapshot1 = await getDocs(q1);
      querySnapshot1.forEach(async (doc) => {
        let reviewData = {
          id: doc.id,
          review: doc.data().review,
          stars: doc.data().stars,
          date: doc.data().date.toDate(),
        };
        try {
          const worker = await (await getDoc(doc.data().worker)).data();
          reviewData = { ...reviewData, worker };
          const customer = await (await getDoc(doc.data().customer)).data();
          reviewData = { ...reviewData, customer };
        } catch (err) {
          console.log("Error", err);
        }

        setReviews((r) => {
          return [...r, reviewData];
        });
      });

      //get user's category
      const response = await getDoc(doc(datab, "users", auth.currentUser.uid));
      let category = response?.data()?.category;

      //only for worker accounts
      if (category != "customer") {
        //find the reviews where the current user is the worker
        const workerRef = doc(datab, "users/" + auth.currentUser.uid);

        const q2 = query(
          collection(datab, "reviews"),
          where("worker", "==", workerRef)
        );

        const querySnapshot2 = await getDocs(q2);
        querySnapshot2.forEach(async (doc) => {
          let reviewData = {
            id: doc.id,
            review: doc.data().review,
            stars: doc.data().stars,
            date: doc.data().date.toDate(),
          };
          try {
            const worker = await (await getDoc(doc.data().worker)).data();
            reviewData = { ...reviewData, worker };
            const customer = await (await getDoc(doc.data().customer)).data();
            reviewData = { ...reviewData, customer };
          } catch (err) {
            console.log("Error", err);
          }

          setReviews((r) => {
            return [...r, reviewData];
          });
        });

        //console.log("-----------------------");
        //console.log(orderedData);
      }
    } catch (error) {
      console.log("!!" + error.message);
      alert(error.message);
    }
    //setReviews([]);
    //setReviews(reviews.sort((a, b) => new Date(b.date) - new Date(a.date)));
  };

  const EmptyList = () => (
    <View>
      <Text style={{ textAlign: "center", fontWeight: "700", fontSize: 15 }}>
        There are not available reviews!
      </Text>
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        ListEmptyComponent={<EmptyList />}
        data={reviews}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: SPACING }}
        renderItem={({ item, index }) => {
          return (
            <View style={styles.info}>
              <MaterialCommunityIcons
                name={"numeric-" + item.stars + "-circle"}
                size={45}
                style={{
                  alignSelf: "center",
                  color: "#ffd700",
                  marginRight: 10,
                }}
              />
              <View style={{ alignSelf: "center", width: "85%" }}>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "bold",
                  }}
                >
                  {item.customer && item.worker
                    ? item?.customer?.firstName +
                      " " +
                      item?.customer?.lastName +
                      " for " +
                      item?.worker?.firstName +
                      " " +
                      item?.worker?.lastName
                    : "No Data"}
                </Text>
                <Text style={{ fontSize: 14, marginTop: 5 }}>
                  {item.review}
                </Text>
                <Text style={{ fontSize: 14, marginTop: 5, color: "grey" }}>
                  {item.date.toDateString()}
                </Text>
              </View>
            </View>
          );
        }}
      />
    </View>
  );
};

export default ReviewsScreen;

const styles = StyleSheet.create({
  info: {
    flexDirection: "row",
    padding: 15,
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
