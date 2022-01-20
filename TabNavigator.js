import React from "react";
import { Image } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import {
  HomeStackNavigator,
  ProfileStackNavigator,
  AddRouteStackNavigator,
  FindRideStackNavigator,
} from "./StackNavigator";

const Tab = createBottomTabNavigator();

const BottomTabNavigator = () => {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Home" component={HomeStackNavigator} />
      <Tab.Screen name="ProfileScreen" component={ProfileStackNavigator} />
      <Tab.Screen name="AddRouteScreen" component={AddRouteStackNavigator} />
      <Tab.Screen name="FindRideScreen" component={FindRideStackNavigator} />
    </Tab.Navigator>
  );
};

export default BottomTabNavigator;
