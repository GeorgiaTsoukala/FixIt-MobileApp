import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import HomeScreen from "./screens/HomeScreen";
import ProfileScreen from "./screens/ProfileScreen";
import AddRouteScreen from "./screens/AddRouteScreen";
import FindRideScreen from "./screens/FindRideScreen";

const Tab = createBottomTabNavigator();

const Tabs = () => {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
      <Tab.Screen name="Add a new route" component={AddRouteScreen} />
      <Tab.Screen name="Find a ride" component={FindRideScreen} />
    </Tab.Navigator>
  );
};

export default Tabs;
