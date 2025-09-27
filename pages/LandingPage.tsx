import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { searchSchools, School } from "../services/schoolService";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../contexts/AuthContext";
import Toast from "react-native-simple-toast";

const LandingPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<School[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigation = useNavigation();
  const { markLandingSeen } = useAuth();

  const handleSchoolSelect = async (baseUrl: string) => {
    try {
      await AsyncStorage.setItem("selectedBaseUrl", baseUrl);
      await markLandingSeen();
      Toast.show("School selected successfully!", Toast.LONG);
      // Navigate to login page after successfully saving the school URL
      // (navigation as any).navigate('Login');
    } catch (error) {
      console.error("Error saving baseUrl:", error);
      Toast.show("Failed to save school URL", Toast.LONG);
    }
  };

  const handleSearch = async () => {
    const trimmedQuery = searchQuery.trim();
    if (!trimmedQuery) {
      Toast.show("Please enter a school name", Toast.LONG);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const results = await searchSchools(trimmedQuery);
      if (results.length === 0) {
        Toast.show("School not found", Toast.LONG);
        return;
      }
      setSearchResults(results);
      handleSchoolSelect(results[0].baseUrl);
    } catch (error: any) {
      console.error("Search failed:", error);
      let errorMessage = "Failed to search schools. ";

      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        errorMessage += `Server responded with status ${error.response.status}`;
      } else if (error.request) {
        // The request was made but no response was received
        errorMessage +=
          "No response received from server. Please check if the server is running.";
      } else {
        // Something happened in setting up the request that triggered an Error
        errorMessage += error.message || "Unknown error occurred";
      }

      setError(errorMessage);
      Toast.show(errorMessage, Toast.LONG);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            <Image
              source={require("../assets/logo.png")}
              style={styles.logo}
              resizeMode="contain"
            />

            <Text style={styles.title}>School Search</Text>
            <Text style={styles.description}>
              Find the best schools in your area.
            </Text>

            <View style={styles.searchContainer}>
              <TextInput
                style={styles.input}
                placeholder="Enter school name"
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholderTextColor="#666"
              />

              <TouchableOpacity
                style={[
                  styles.searchButton,
                  loading && styles.searchButtonDisabled,
                ]}
                onPress={handleSearch}
                disabled={loading}
              >
                <Text style={styles.buttonText}>
                  {loading ? "Searching..." : "Search"}
                </Text>
              </TouchableOpacity>
            </View>

            {/* {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )} */}

            {/* {searchResults.length > 0 && (
              <View style={styles.resultsContainer}>
                {searchResults.map((school) => (
                  <TouchableOpacity 
                    key={school._id} 
                    style={styles.schoolCard}
                    onPress={() => handleSchoolSelect(school.baseUrl)}
                  >
                    <Text style={styles.schoolName}>{school.schoolName}</Text>
                    <Text style={styles.schoolUrl}>{school.baseUrl}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )} */}
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100%",
  },
  logo: {
    width: "100%",
    height: 100,
    marginTop: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
  },
  description: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
  },
  searchContainer: {
    width: "100%",
    flexDirection: "column",
    alignItems: "center",
    marginBottom: 20,
  },
  input: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 15,
    marginRight: 10,
    fontSize: 16,
    width: "90%",
  },
  searchButton: {
    backgroundColor: "#00c951",
    height: 50,
    paddingHorizontal: 20,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    width: "90%",
    marginTop: 20,
  },
  searchButtonDisabled: {
    backgroundColor: "#99e6b3",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  resultsContainer: {
    width: "100%",
  },
  schoolCard: {
    backgroundColor: "#f8f9fa",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#eee",
  },
  schoolName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 5,
  },
  schoolUrl: {
    fontSize: 14,
    color: "#666",
  },
  errorContainer: {
    width: "100%",
    backgroundColor: "#ffebee",
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#ffcdd2",
  },
  errorText: {
    color: "#c62828",
    fontSize: 14,
  },
});

export default LandingPage;
