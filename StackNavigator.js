import React from "react";
import { Image } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "./screens/LoginScreen";
import HomeScreen from "./screens/HomeScreen";
import ProfileScreen from "./screens/ProfileScreen";
import AddRouteScreen from "./screens/AddRouteScreen";
import FindRideScreen from "./screens/FindRideScreen";
import BottomTabNavigator from "./TabNavigator";

const Stack = createNativeStackNavigator();

const HomeStackNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ headerLeft: (props) => null }}
      />
    </Stack.Navigator>
  );
};

const ProfileStackNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="ProfileScreen"
        component={ProfileScreen}
        options={{ headerLeft: (props) => null }}
      />
    </Stack.Navigator>
  );
};

const AddRouteStackNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="AddRouteScreen"
        component={AddRouteScreen}
        options={{ headerLeft: (props) => null }}
      />
    </Stack.Navigator>
  );
};

const FindRideStackNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="FindRideScreen"
        component={FindRideScreen}
        options={{ headerLeft: (props) => null }}
      />
    </Stack.Navigator>
  );
};

export default MainStackNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="LoginScreen" component={LoginScreen} />
      <Stack.Screen name="TabNavigator" component={BottomTabNavigator} />
    </Stack.Navigator>
  );
};

export {
  HomeStackNavigator,
  ProfileStackNavigator,
  AddRouteStackNavigator,
  FindRideStackNavigator,
};
