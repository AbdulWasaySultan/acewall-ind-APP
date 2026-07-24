import React, { useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import Toast from "react-native-simple-toast";
import SimpleIcon from "../components/SimpleIcon";
import { RootStackParamList } from "../navigation/AppNavigator";

type RouteParams = RouteProp<RootStackParamList, "PaymentCancel">;

// Mirrors web's PaymentCancelled.jsx (static card, no auto-navigation). The
// "Back to My Courses" button is an intentional, justified deviation from
// web — mobile has no back-button-in-URL-bar affordance to fall back on.
const PaymentCancelPage = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteParams>();
  const sessionId = route.params?.sessionId;

  useEffect(() => {
    Toast.show("Payment not successful!", Toast.LONG);
  }, [sessionId]);

  return (
    <View style={styles.screen}>
      <View style={styles.card}>
        <View style={[styles.iconWrap, { backgroundColor: "#fee2e2" }]}>
          <SimpleIcon name="close-circle" size={40} color="#dc2626" />
        </View>
        <Text style={styles.title}>Payment Cancelled</Text>
        <Text style={styles.body}>
          Your payment has been cancelled. Please try again or contact support
          if you need assistance.
        </Text>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate("Main", { screen: "MyCourses" })}
        >
          <Text style={styles.buttonText}>Back to My Courses</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 32,
    alignItems: "center",
    width: "100%",
    maxWidth: 360,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  title: { fontSize: 18, fontWeight: "700", color: "#991b1b", marginBottom: 8 },
  body: { fontSize: 14, color: "#6b7280", textAlign: "center", lineHeight: 20 },
  button: {
    marginTop: 24,
    backgroundColor: "#10B144",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: { color: "#fff", fontWeight: "700" },
});

export default PaymentCancelPage;
