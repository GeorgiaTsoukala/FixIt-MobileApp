import React from "react";
import { StyleSheet, Text, View, TouchableOpacity, Image } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MaterialIcons } from "@expo/vector-icons";
import HomeScreen from "./screens/HomeScreen";
import ProfileScreen from "./screens/ProfileScreen";
import ReviewsScreen from "./screens/ReviewsScreen";
import SearchScreen from "./screens/SearchScreen";
import HistoryScreen from "./screens/HistoryScreen";

const Tab = createBottomTabNavigator();

const CustomTabBarButton = ({ children, onPress }) => (
  <TouchableOpacity
    style={{
      top: -10,
      justifyContent: "center",
      alignItems: "center",
      ...styles.shadow,
    }}
    onPress={onPress}
  >
    <View
      style={{
        width: 65,
        height: 65,
        alignItems: "center",
        borderRadius: 32.5,
        backgroundColor: "#267777",
      }}
    >
      {children}
    </View>
  </TouchableOpacity>
);

const BottomTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarHideOnKeyboard: true,
        tabBarShowLabel: false,
        tabBarStyle: {
          marginBottom: 10,
          marginLeft: 10,
          marginRight: 10,
          elevation: 0,
          borderRadius: 15,
          backgroundColor: "gainsboro",
          height: 60,
          ...styles.shadow,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          headerStyle: {
            backgroundColor: "#267777", //"#206464"
          },
          headerTitleStyle: {
            color: "white",
          },
          tabBarIcon: ({ focused }) => (
            <View>
              <MaterialIcons
                name="home"
                size={24}
                style={{
                  alignSelf: "center",
                  color: focused ? "#267777" : "black",
                }}
              />
              <Text
                style={{
                  alignSelf: "center",
                  color: focused ? "#267777" : "black",
                }}
              >
                Home
              </Text>
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Reviews"
        component={ReviewsScreen}
        options={{
          headerStyle: {
            backgroundColor: "#267777",
          },
          headerTitleStyle: {
            color: "white",
          },
          tabBarIcon: ({ focused }) => (
            <View>
              <MaterialIcons
                name="stars"
                size={24}
                style={{
                  alignSelf: "center",
                  color: focused ? "#267777" : "black",
                }}
              />
              <Text
                style={{
                  alignSelf: "center",
                  color: focused ? "#267777" : "black",
                }}
              >
                Reviews
              </Text>
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Search for a handyman"
        component={SearchScreen}
        options={{
          headerStyle: {
            backgroundColor: "#267777",
          },
          headerTitleStyle: {
            color: "white",
          },
          tabBarIcon: ({ focused }) => (
            <View>
              <MaterialIcons
                name="search"
                size={35}
                style={{
                  alignSelf: "center",
                  color: focused ? "white" : "gainsboro",
                }}
              />
            </View>
          ),
          tabBarButton: (props) => <CustomTabBarButton {...props} />,
        }}
      />
      <Tab.Screen
        name="History"
        component={HistoryScreen}
        options={{
          headerStyle: {
            backgroundColor: "#267777",
          },
          headerTitleStyle: {
            color: "white",
          },
          tabBarIcon: ({ focused }) => (
            <View>
              <MaterialIcons
                name="history"
                size={24}
                style={{
                  alignSelf: "center",
                  color: focused ? "#267777" : "black",
                }}
              />
              <Text
                style={{
                  alignSelf: "center",
                  color: focused ? "#267777" : "black",
                }}
              >
                History
              </Text>
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          headerStyle: {
            backgroundColor: "#267777",
          },
          headerTitleStyle: {
            color: "white",
          },
          tabBarIcon: ({ focused }) => (
            <View>
              <MaterialIcons
                name="person"
                size={24}
                style={{
                  alignSelf: "center",
                  color: focused ? "#267777" : "black",
                }}
              />
              <Text
                style={{
                  alignSelf: "center",
                  color: focused ? "#267777" : "black",
                }}
              >
                Profile
              </Text>
            </View>
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default BottomTabNavigator;

const styles = StyleSheet.create({
  shadow: {
    shadowColor: "#7F5DF0",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.5,
    elevation: 5,
  },
});
