import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import Constants from "expo-constants";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";

const AddRouteScreen = () => {
  return (
    <View style={styles.container}>
      <GooglePlacesAutocomplete
        placeholder="Search"
        fetchDetails={true}
        query={{
          key: "AIzaSyDxg_ZVkVvJRQxpzjykpNBbExPtamshHEc",
          language: "en", // language of the results
        }}
        onPress={(data, details = null) =>
          console.log(details.geometry.location)
        }
        onFail={(error) => console.error(error)}
      />
    </View>
  );
};

export default AddRouteScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    paddingTop: Constants.statusBarHeight + 10,
    backgroundColor: "#ecf0f1",
  },
});
