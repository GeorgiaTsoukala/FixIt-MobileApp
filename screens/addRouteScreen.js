import React from "react";
import MapView from "react-native-maps";
import { StyleSheet, Text, View, Dimensions } from "react-native";
import { Marker } from "react-native-maps";

const tokyoRegion = {
  latitude: 39.3697823,
  longitude: 22.9373009,
  latitudeDelta: 0.01,
  longitudeDelta: 0.01,
};

const AddRouteScreen = () => {
  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: 37.939648,
          longitude: 23.7477808,
          latitudeDelta: 0.04,
          longitudeDelta: 0.01,
        }}
      >
        <Marker coordinate={tokyoRegion} />
      </MapView>
    </View>
  );
};

export default AddRouteScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  map: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
  },
});
