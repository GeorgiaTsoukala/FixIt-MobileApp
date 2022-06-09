import React, { useEffect, useState, useRef } from "react";
import { StyleSheet, View, ImageBackground } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { signOut } from "firebase/auth";
import { auth, datab } from "../firebase";
import { updateDoc, doc } from "firebase/firestore";
import { MaterialIcons } from "@expo/vector-icons";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import background from "../assets/background.png";

//determines how your app handles notifications while the app is foregrounded
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: false,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

const HomeScreen = () => {
  const [notification, setNotification] = useState(false);
  const notificationListener = useRef();
  const responseListener = useRef();

  const navigation = useNavigation();

  useEffect(() => {
    registerForPushNotificationsAsync();

    //this listener is fired whenever a notification is received while the app is foregrounded
    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        setNotification(notification);
        console.log(notification.request.content.data); //.request.content.body
      });

    //this listener is fired whenever a user taps on or interacts with a notification
    //(works when app is foregrounded, backgrounded, or killed)
    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log(response.notification.request.content.body);
      });

    return () => {
      Notifications.removeNotificationSubscription(
        notificationListener.current
      );
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  const registerForPushNotificationsAsync = async () => {
    if (Device.isDevice) {
      //make sure the app is running on a physical device
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      //user did not grand permission
      if (finalStatus !== "granted") {
        alert("Enable push notification to use FixIt!");
        return;
      }

      //get the token that uniquely identifies the device
      const token = (await Notifications.getExpoPushTokenAsync()).data;
      try {
        let updatedFields = {
          expoPushToken: token,
        };
        //update the users database with the token
        await updateDoc(
          doc(datab, "users", auth.currentUser.uid),
          updatedFields
        );
      } catch (error) {
        alert(error.message);
      }
    } else {
      alert("Must use physical device for Push Notifications");
    }

    if (Platform.OS === "android") {
      Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
      });
    }
  };

  const handleSignOut = async () => {
    try {
      //redirect to login screen
      await signOut(auth).then(() => {
        navigation.replace("LoginScreen");
      });
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <ImageBackground source={background} style={styles.bckground}>
      <MaterialIcons
        name="logout"
        size={40}
        style={{
          alignSelf: "flex-end",
          marginTop: 25,
          marginRight: 25,
          color: "#267777",
        }}
        onPress={handleSignOut}
      />
      <View style={styles.container}></View>
    </ImageBackground>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  bckground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    height: "100%",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  button: {
    width: 230,
    backgroundColor: "indianred",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 180,
  },
  buttonText: {
    color: "white",
    fontWeight: "700",
    fontSize: 15,
  },
  buttonOutline: {
    backgroundColor: "white",
    borderColor: "indianred",
    borderWidth: 2,
  },
  buttonOutlineText: {
    color: "indianred",
    fontWeight: "700",
    fontSize: 15,
  },
});
