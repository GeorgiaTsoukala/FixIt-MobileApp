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
import { useNavigation, useRoute } from "@react-navigation/native";

const SPACING = 20;

const RatingsScreen = () => {
  const [reviews, setReviews] = useState([]);

  const navigation = useNavigation();
  const route = useRoute();

  useEffect(() => {
    loadReviews();
  }, []);

  const goBack = async () => {
    navigation.goBack();
  };

  const loadReviews = async () => {
    try {
      Keyboard.dismiss();
      setReviews([]);

      //find the reviews of the selected worker
      const workerRef = doc(datab, "users/" + route.params.workerId);

      const q = query(
        collection(datab, "reviews"),
        where("worker", "==", workerRef),
        orderBy("date", "desc")
      );

      const querySnapshot = await getDocs(q);
      querySnapshot.forEach(async (doc) => {
        let reviewData = {
          id: doc.id,
          review: doc.data().review,
          stars: doc.data().stars,
          date: doc.data().date.toDate(),
        };
        try {
          const customer = await (await getDoc(doc.data().customer)).data();
          reviewData = { ...reviewData, customer };
        } catch (err) {
          console.log("Error", err);
        }

        setReviews((r) => {
          return [...r, reviewData];
        });
      });
    } catch (error) {
      alert(error.message);
    }
  };

  const EmptyList = () => (
    <View>
      <Text style={{ textAlign: "center", fontWeight: "700", fontSize: 15 }}>
        There are no reviews available!
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
                  {item.customer
                    ? "From " +
                      item?.customer?.firstName +
                      " " +
                      item?.customer?.lastName
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

export default RatingsScreen;

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
