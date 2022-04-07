import React from "react";
import MapView, { Marker } from "react-native-maps";
import { StyleSheet, Text, View, Dimensions } from "react-native";

const staticData = [
  { coordinates: { latitude: 37.78383, longitude: -122.405766 }, name: "jj" },
  {
    coordinates: { latitude: 37.78584, longitude: -122.405478 },
    name: "fj",
  },
  {
    coordinates: { latitude: 37.784738, longitude: -122.402839 },
    name: "ff",
  },
];

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
          latitude: 37.78383,
          longitude: -122.405766,
          latitudeDelta: 0.04,
          longitudeDelta: 0.01,
        }}
      >
        {staticData.map((item, index) => (
          <Marker key={index} title={item.name} coordinate={item.coordinates} />
        ))}
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
    height: Dimensions.get("window").height / 2,
  },
});
