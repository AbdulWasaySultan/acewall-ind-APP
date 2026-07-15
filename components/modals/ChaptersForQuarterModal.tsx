import React from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import SimpleIcon from "../SimpleIcon";

const styles = StyleSheet.create({
  chaptersModalContainer: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
  },
  chaptersModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  chaptersModalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#222",
  },
  chaptersContent: {
    flex: 1,
  },
  chaptersHeaderButton: {
    backgroundColor: "#f5f5f5",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  chaptersHeaderButtonText: {
    color: "#666",
    fontSize: 14,
    textAlign: "center",
  },
  createChapterButton: {
    backgroundColor: "#10B144",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 16,
  },
  createChapterButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  chapterCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chapterCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  chapterNumberChip: {
    backgroundColor: "#10B144",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  chapterNumberText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  chapterDeleteButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: "#f5f5f5",
  },
  chapterCardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 8,
  },
  chapterCardDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 16,
  },
  chapterCardStats: {
    flexDirection: "row",
    marginBottom: 16,
    gap: 16,
  },
  chapterStatItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  chapterStatText: {
    fontSize: 14,
    color: "#666",
  },
  chapterViewButton: {
    backgroundColor: "#10B144",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  chapterViewButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

interface ChaptersForQuarterModalProps {
  visible: boolean;
  onClose: () => void;
  onBackToQuarters: () => void;
  onCreateChapter: () => void;
  loadingChaptersForQuarter: boolean;
  chaptersForQuarter: any[];
  chaptersMessage: string;
  onViewChapterDetails: (chapterId: string) => void;
  onDeleteChapter: (chapter: any) => void;
}

const ChaptersForQuarterModal: React.FC<ChaptersForQuarterModalProps> = ({
  visible,
  onClose,
  onBackToQuarters,
  onCreateChapter,
  loadingChaptersForQuarter,
  chaptersForQuarter,
  chaptersMessage,
  onViewChapterDetails,
  onDeleteChapter,
}) => {
  return (
    <Modal
      visible={visible}
      transparent={false}
      animationType="slide"
      onRequestClose={() => {
        onClose();
        onBackToQuarters();
      }}
    >
      <View style={styles.chaptersModalContainer}>
        <View style={styles.chaptersModalHeader}>
          <Text style={styles.chaptersModalTitle}>Chapters</Text>
          <TouchableOpacity
            onPress={() => {
              onClose();
              onBackToQuarters();
            }}
          >
            <SimpleIcon name="close" size={32} color="#333" />
          </TouchableOpacity>
        </View>

        <View style={styles.chaptersContent}>
          <TouchableOpacity style={styles.chaptersHeaderButton}>
            <Text style={styles.chaptersHeaderButtonText}>
              Manage your chapters and course content
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.createChapterButton}
            onPress={onCreateChapter}
          >
            <Text style={styles.createChapterButtonText}>
              Create New Chapter
            </Text>
          </TouchableOpacity>

          {loadingChaptersForQuarter ? (
            <ActivityIndicator
              style={{ marginTop: 20 }}
              size="large"
              color="#10B144"
            />
          ) : chaptersForQuarter.length > 0 ? (
            <ScrollView>
              {chaptersForQuarter.map((chapter, index) => {
                return (
                  <View key={chapter._id} style={styles.chapterCard}>
                    <View style={styles.chapterCardHeader}>
                      <View style={styles.chapterNumberChip}>
                        <Text style={styles.chapterNumberText}>
                          Chapter {index + 1}
                        </Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => onDeleteChapter(chapter)}
                        style={styles.chapterDeleteButton}
                      >
                        <SimpleIcon name="trash" size={20} color="#ef4444" />
                      </TouchableOpacity>
                    </View>

                    <Text style={styles.chapterCardTitle}>
                      {chapter.title}
                    </Text>
                    <Text style={styles.chapterCardDescription}>
                      {chapter.description}
                    </Text>

                    <View style={styles.chapterCardStats}>
                      <View style={styles.chapterStatItem}>
                        <SimpleIcon name="menu-book" size={16} color="#666" />
                        <Text style={styles.chapterStatText}>
                          {chapter.lessons ? chapter.lessons.length : 0}{" "}
                          Lessons
                        </Text>
                      </View>
                      <View style={styles.chapterStatItem}>
                        <SimpleIcon name="star" size={16} color="#666" />
                        <Text style={styles.chapterStatText}>
                          {chapter.chapter_assessments
                            ? chapter.chapter_assessments.length
                            : 0}{" "}
                          Assessments
                        </Text>
                      </View>
                    </View>

                    <TouchableOpacity
                      style={styles.chapterViewButton}
                      onPress={() => onViewChapterDetails(chapter._id)}
                    >
                      <Text style={styles.chapterViewButtonText}>
                        View Details
                      </Text>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </ScrollView>
          ) : (
            <Text
              style={{ textAlign: "center", marginTop: 20, fontSize: 16 }}
            >
              {chaptersMessage}
            </Text>
          )}
        </View>
      </View>
    </Modal>
  );
};

export default ChaptersForQuarterModal;
