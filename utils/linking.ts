import { Linking, Alert } from "react-native";

export const openZoomMeeting = async (url: string) => {
  try {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      Alert.alert("Error", "Cannot open Zoom URL on this device.");
    }
  } catch (error) {
    console.error("Error while opening Zoom url", error);
    Alert.alert("Error", "An unexpected error occurred while launching Zoom.");
  }
};
