import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import Toast from "react-native-simple-toast";
import SimpleIcon from "../components/SimpleIcon";
import { RootStackParamList } from "../navigation/AppNavigator";

type RouteParams = RouteProp<RootStackParamList, "PaymentSuccess">;
type Status = "processing" | "success" | "error";

// Mirrors web's payment-success.jsx: no backend verification call — the
// Stripe webhook already completed the enrollment server-side before this
// redirect happens, so this page is purely a confirmation + auto-navigate.
const PaymentSuccessPage = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteParams>();
  const sessionId = route.params?.sessionId;
  const [status, setStatus] = useState<Status>("processing");

  useEffect(() => {
    if (!sessionId) {
      Toast.show("Missing session ID", Toast.LONG);
      setStatus("error");
      return;
    }

    Toast.show("🎉 Payment confirmed! You are now enrolled.", Toast.LONG);
    setStatus("success");

    const timer = setTimeout(() => {
      navigation.navigate("Main", { screen: "MyCourses" });
    }, 3000);
    return () => clearTimeout(timer);
  }, [sessionId, navigation]);

  return (
    <View style={styles.screen}>
      <View style={styles.card}>
        {status === "processing" && (
          <>
            <ActivityIndicator size="large" color="#ca8a04" />
            <Text style={[styles.title, { color: "#92400e" }]}>
              Processing your payment...
            </Text>
          </>
        )}
        {status === "success" && (
          <>
            <View style={[styles.iconWrap, { backgroundColor: "#dcfce7" }]}>
              <SimpleIcon name="check-circle" size={40} color="#16a34a" />
            </View>
            <Text style={[styles.title, { color: "#166534" }]}>
              You're enrolled! Redirecting...
            </Text>
          </>
        )}
        {status === "error" && (
          <>
            <View style={[styles.iconWrap, { backgroundColor: "#fee2e2" }]}>
              <SimpleIcon name="alert-circle" size={40} color="#dc2626" />
            </View>
            <Text style={[styles.title, { color: "#991b1b" }]}>
              Something went wrong. Please contact support.
            </Text>
          </>
        )}
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
  title: { fontSize: 16, fontWeight: "700", textAlign: "center", marginTop: 12 },
});

export default PaymentSuccessPage;
