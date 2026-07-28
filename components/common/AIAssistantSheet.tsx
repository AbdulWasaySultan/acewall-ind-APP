import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Sparkles, Check } from "lucide-react-native";
import AnimatedBottomSheet from "./AnimatedBottomSheet";
import { generateTeacherContent } from "../../services/course";
import Toast from "react-native-simple-toast";

// Parsing ported 1:1 from web's AiContentModal.jsx (parseMCQFromAI /
// parseTrueFalseFromAI) so mobile-generated questions match the same shape.
export const parseMCQFromAI = (content: string) => {
  const lines = content
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  const question = lines[0];
  const options = lines
    .filter((line) => /^[A-D]\./.test(line))
    .map((line) => line.replace(/^[A-D]\.\s*/, ""));
  const answerLine = lines.find((line) => line.toLowerCase().startsWith("answer:"));
  const correctAnswer = answerLine
    ? answerLine.replace(/answer:\s*/i, "").trim()
    : null;
  return { question, options, correctAnswer };
};

export const parseTrueFalseFromAI = (content: string) => {
  const lines = content
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  const question = lines[0];
  const correctAnswer = lines.find((line) => /^true$|^false$/i.test(line));
  return {
    question,
    correctAnswer: correctAnswer ? correctAnswer.toLowerCase() : null,
  };
};

interface AIAssistantSheetProps {
  visible: boolean;
  onClose: () => void;
  usedfor: string;
  showDifficulty?: boolean;
  onAccept: (content: string) => void;
}

const DIFFICULTIES: Array<"easy" | "medium" | "hard"> = ["easy", "medium", "hard"];

const AIAssistantSheet: React.FC<AIAssistantSheetProps> = ({
  visible,
  onClose,
  usedfor,
  showDifficulty = false,
  onAccept,
}) => {
  const [prompt, setPrompt] = useState("");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">(
    "medium"
  );
  const [generating, setGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState("");
  const [showResult, setShowResult] = useState(false);

  const resetState = () => {
    setPrompt("");
    setGeneratedContent("");
    setShowResult(false);
    setGenerating(false);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setGenerating(true);
    try {
      const res = await generateTeacherContent(prompt, usedfor, difficulty);
      setGeneratedContent(res?.content || "");
      setShowResult(true);
    } catch (error: any) {
      Toast.show(
        error?.response?.data?.message || "Generation failed. Please try again.",
        Toast.LONG
      );
    } finally {
      setGenerating(false);
    }
  };

  const handleAccept = () => {
    onAccept(generatedContent);
    resetState();
    onClose();
  };

  return (
    <AnimatedBottomSheet visible={visible} onClose={handleClose}>
      <View style={styles.header}>
        <Sparkles color="#7dd182" size={22} />
        <Text style={styles.headerTitle}>AI Assistant</Text>
      </View>

      {!showResult ? (
        <View style={{ alignItems: "center" }}>
          {generating ? (
            <ActivityIndicator
              size="large"
              color="#6366f1"
              style={{ marginVertical: 24 }}
            />
          ) : (
            <>
              <Text style={styles.subtitle}>
                Start writing to make the magic happen.
              </Text>

              {showDifficulty && (
                <View style={styles.difficultyRow}>
                  {DIFFICULTIES.map((d) => (
                    <TouchableOpacity
                      key={d}
                      onPress={() => setDifficulty(d)}
                      style={[
                        styles.difficultyChip,
                        difficulty === d && styles.difficultyChipSelected,
                      ]}
                    >
                      <Text
                        style={[
                          styles.difficultyChipText,
                          difficulty === d && styles.difficultyChipTextSelected,
                        ]}
                      >
                        {d}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              <TextInput
                style={styles.promptInput}
                placeholder="Describe what you want to create..."
                placeholderTextColor="#999"
                value={prompt}
                onChangeText={setPrompt}
              />

              <TouchableOpacity
                style={[
                  styles.generateButton,
                  !prompt.trim() && { opacity: 0.6 },
                ]}
                onPress={handleGenerate}
                disabled={!prompt.trim()}
              >
                <Sparkles color="#fff" size={16} style={styles.generateButtonIcon} />
                <Text style={styles.generateButtonText}>Generate</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      ) : (
        <View>
          <View style={styles.resultBox}>
            <Text style={styles.resultText}>{generatedContent}</Text>
          </View>

          <View style={styles.resultActions}>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleGenerate}
            >
              <Text style={styles.secondaryButtonText}>Regenerate</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => setShowResult(false)}
            >
              <Text style={styles.secondaryButtonText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.acceptButton}
              onPress={handleAccept}
            >
              <Check color="#fff" size={16} style={styles.generateButtonIcon} />
              <Text style={styles.acceptButtonText}>Go with it</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </AnimatedBottomSheet>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 10,
  },
  headerTitle: { fontSize: 17, fontWeight: "700", color: "#111827" },
  subtitle: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 14,
  },
  difficultyRow: { flexDirection: "row", gap: 10, marginBottom: 16 },
  difficultyChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  difficultyChipSelected: { backgroundColor: "#6366f1", borderColor: "#6366f1" },
  difficultyChipText: { fontSize: 13, color: "#374151", textTransform: "capitalize" },
  difficultyChipTextSelected: { color: "#fff", fontWeight: "600" },
  promptInput: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    marginBottom: 14,
  },
  generateButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#6366f1",
    borderRadius: 8,
    paddingVertical: 13,
    width: "100%",
  },
  generateButtonIcon: { marginRight: 8 },
  generateButtonText: { color: "#fff", fontSize: 15, fontWeight: "700" },
  resultBox: {
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    padding: 14,
    maxHeight: 220,
    marginBottom: 14,
  },
  resultText: { fontSize: 14, color: "#374151", lineHeight: 20 },
  resultActions: { flexDirection: "row", gap: 8 },
  secondaryButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    alignItems: "center",
  },
  secondaryButtonText: { fontSize: 13, fontWeight: "600", color: "#374151" },
  acceptButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "#6366f1",
  },
  acceptButtonText: { color: "#fff", fontSize: 13, fontWeight: "700" },
});

export default AIAssistantSheet;
