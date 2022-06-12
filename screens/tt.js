import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  Keyboard,
  Modal,
  Image,
} from "react-native";
import { AirbnbRating } from "react-native-ratings";
import {
  addDoc,
  collection,
  doc,
  query,
  where,
  getDocs,
  getDoc,
  orderBy,
} from "firebase/firestore";
import { datab, auth, storage } from "../firebase";
import { ref, getDownloadURL } from "firebase/storage";
import { MaterialIcons } from "@expo/vector-icons";

const ReviewsScreen = () => {
  const [pastReviews, setPastReviews] = useState([]);
  const [stars, setStars] = useState(0);
  const [review, setReview] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState(0);

  const ratingCompleted = (rating) => {
    setStars(rating);
  };

  const handleSubmit = async () => {
    try {
      let updatedFields = {
        customer: doc(datab, "users", auth.currentUser.uid),
        date: new Date(),
        review: review,
        stars: stars,
      };

      //add to the "reviews" database
      await addDoc(collection(datab, "reviews"), updatedFields);
    } catch (error) {
      alert(error.message);
    }
  };

  const FlatListItemPressed = (data) => {
    //load profile image
    if (data.worker?.profileImage) {
      const refStorage = ref(storage, data.worker.profileImage);
      getDownloadURL(refStorage).then((res) => {
        setProfileImage(res);
      });
    }

    // load name/phone
    if (data.worker?.firstName && data.worker?.lastName) {
      setName(data.worker.firstName + " " + data.worker.lastName);
    }
    if (data.worker?.phone) {
      setPhone(data.worker.phone);
    }

    //open pop-up window
    setModalOpen(true);
  };

  const handleSearch = async () => {
    try {
      Keyboard.dismiss();
      setPastReviews([]);

      //find the past reviews where the customer is the current User
      let customerRef = doc(datab, "users/" + auth.currentUser.uid);

      const q = query(
        collection(datab, "reviews"),
        where("customer", "==", customerRef),
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
          const worker = await (await getDoc(doc.data().worker)).data();
          reviewData = { ...reviewData, worker };
        } catch (err) {
          console.log("Error", err);
        }

        setPastReviews((r) => {
          return [...r, reviewData];
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
          {value.worker
            ? value?.worker?.firstName + " " + value?.worker?.lastName
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
          {"Rating : " + value.stars + "    -    " + value.date.toDateString()}
        </Text>
        <Text>{value.review}</Text>
      </View>
    </View>
  );

  const EmptyList = () => (
    <View>
      <Text>No data Available</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Modal transparent visible={modalOpen}>
        <View style={styles.modalContainer}>
          <MaterialIcons
            name="close"
            size={24}
            style={{ alignSelf: "flex-end" }}
            onPress={() => (setModalOpen(false), setProfileImage(null))}
          />
          <Text style={{ marginTop: 5, fontWeight: "bold" }}>
            Workers's info
          </Text>
          {profileImage && (
            <Image
              source={{ uri: profileImage }}
              style={{
                width: 200,
                height: 200,
                marginTop: 25,
                borderRadius: 10,
              }}
            />
          )}
          <Text style={{ alignSelf: "flex-start", marginTop: 25 }}>
            Name: {name}
          </Text>
          <Text style={{ alignSelf: "flex-start", marginTop: 5 }}>
            Address: {}
          </Text>
          <Text style={{ alignSelf: "flex-start", marginTop: 5 }}>
            Phone: {phone}
          </Text>
          <Text style={{ alignSelf: "flex-start", marginTop: 5 }}>
            Rating: {}
          </Text>
        </View>
      </Modal>
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
        onFinishRating={ratingCompleted}
      />
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          onPress={handleSubmit}
          style={[styles.button, styles.buttonOutline]}
        >
          <Text style={styles.buttonOutlineText}>Submit</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          onPress={handleSearch}
          style={[styles.button, styles.buttonOutline]}
        >
          <Text style={styles.buttonOutlineText}>Show past reviews</Text>
        </TouchableOpacity>
      </View>
      <View style={{ marginTop: 20 }}>
        <FlatList
          ListEmptyComponent={<EmptyList />}
          data={pastReviews}
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

export default ReviewsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 50,
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
    marginBottom: 20,
  },
  buttonContainer: {
    width: "60%",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
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
  pickerContainer: {
    backgroundColor: "white",
    width: "100%",
    paddingHorizontal: 15,
    borderRadius: 10,
    marginBottom: 5,
  },
  modalContainer: {
    flex: 1,
    marginTop: 160,
    marginBottom: 160,
    alignItems: "center",
    width: "80%",
    alignSelf: "center",
    backgroundColor: "#c7e2e2",
    paddingHorizontal: 20,
    paddingVertical: 30,
    borderRadius: 20,
    elevation: 20,
  },
});
