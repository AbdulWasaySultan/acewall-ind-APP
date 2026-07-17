import React from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Switch,
  Platform,
} from "react-native";
import SimpleIcon from "../SimpleIcon";

interface GradingPeriodsModalProps {
  visible: boolean;
  onClose: () => void;
  insets: any;
  loadingGradingPeriods: boolean;
  gradingPeriods: any[];
  handleToggleSemesterArchive: (semester: any) => void;
  handleToggleQuarterArchive: (quarter: any) => void;
  openNewQuarterModal: (semester: any) => void;
  openEditSemesterModal: (semester: any) => void;
  openEditQuarterModal: (quarter: any) => void;
  setSemesterTitle: (title: string) => void;
  setSemesterStartDate: (date: string) => void;
  setSemesterEndDate: (date: string) => void;
  setShowNewSemesterModal: (show: boolean) => void;
  setShowGradingPeriodsModal: (show: boolean) => void;
  formatDateForInput: (date: string) => string;
  styles: any;
}

const GradingPeriodsModal: React.FC<GradingPeriodsModalProps> = ({
  visible,
  onClose,
  insets,
  loadingGradingPeriods,
  gradingPeriods,
  handleToggleSemesterArchive,
  handleToggleQuarterArchive,
  openNewQuarterModal,
  openEditSemesterModal,
  openEditQuarterModal,
  setSemesterTitle,
  setSemesterStartDate,
  setSemesterEndDate,
  setShowNewSemesterModal,
  setShowGradingPeriodsModal,
  formatDateForInput,
  styles,
}) => {

const handleCreateNewSemester = () => {
  setSemesterTitle("")
  setSemesterStartDate("");
  setSemesterEndDate("");
  setShowNewSemesterModal(true);
  setShowGradingPeriodsModal(false);
  }

  
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.gradingPeriodsModalOverlay}>
        <View
          style={[
            styles.gradingPeriodsModalContent,
            { paddingTop: insets.top },
          ]}
        >
          <TouchableOpacity
            onPress={onClose}
            style={styles.gradingPeriodsBackButton}
          >
            <SimpleIcon name="arrow-back" size={20} color="#000" />
            <Text style={styles.gradingPeriodsBackText}>Back</Text>
          </TouchableOpacity>
          <View style={styles.gradingPeriodsHeader}>
            <View style={styles.gradingPeriodsTitleContainer}>
              <SimpleIcon name="calendar" size={24} color="#10B144" />
              <Text style={styles.gradingPeriodsTitle}>Grading Periods</Text>
            </View>
            <TouchableOpacity
              onPress={handleCreateNewSemester}
              style={styles.gradingPeriodsCreateButton}
            >
              <SimpleIcon name="add" size={20} color="#fff" />
              <Text style={styles.gradingPeriodsCreateText}>
                Create Semester
              </Text>
            </TouchableOpacity>
          </View>

          {loadingGradingPeriods ? (
            <View style={styles.gradingPeriodsLoadingContainer}>
              <ActivityIndicator size="large" color="#10B144" />
            </View>
          ) : (
            <ScrollView style={styles.gradingPeriodsList}>
              {gradingPeriods.length === 0 ? (
                <Text style={styles.gradingPeriodsEmptyText}>
                  No semesters found. Create your first semester.
                </Text>
              ) : (
                gradingPeriods.map((semester: any) => {
                  const isSemesterArchived = semester.isArchived;
                  return (
                    <View
                      key={semester._id}
                      style={[
                        styles.gradingPeriodItem,
                        isSemesterArchived &&
                          styles.gradingPeriodItemDisabled,
                      ]}
                    >
                      <View style={styles.gradingPeriodRow}>
                        <View style={styles.gradingPeriodInfo}>
                          <Text
                            style={[
                              styles.gradingPeriodTitleText,
                              isSemesterArchived &&
                                styles.gradingPeriodTextDisabled,
                            ]}
                          >
                            {semester.title}
                          </Text>
                        </View>
                        <View style={styles.gradingPeriodActions}>
                          <View style={styles.gradingPeriodSwitchContainer}>
                            <Switch
                              value={isSemesterArchived}
                              onValueChange={() =>
                                handleToggleSemesterArchive(semester)
                              }
                              trackColor={{
                                false: "#d1d5db",
                                true: "#10B144",
                              }}
                              thumbColor={
                                isSemesterArchived ? "#fff" : "#fff"
                              }
                              style={{
                                transform: [
                                  { scale: Platform.OS === "ios" ? 0.6 : 1 },
                                ],
                              }}
                            />
                            <Text
                              style={[
                                styles.gradingPeriodSwitchLabel,
                                isSemesterArchived &&
                                  styles.gradingPeriodTextDisabled,
                              ]}
                            >
                              {isSemesterArchived ? "Archived" : "Unarchived"}
                            </Text>
                          </View>
                          <TouchableOpacity
                            style={[
                              styles.gradingPeriodAddButton,
                              isSemesterArchived &&
                                styles.gradingPeriodButtonDisabled,
                            ]}
                            onPress={() => openNewQuarterModal(semester)}
                            disabled={isSemesterArchived}
                          >
                            <SimpleIcon
                              name="add"
                              size={16}
                              color={
                                isSemesterArchived ? "#9ca3af" : "#10B144"
                              }
                            />
                            <Text
                              style={[
                                styles.gradingPeriodAddButtonText,
                                isSemesterArchived &&
                                  styles.gradingPeriodTextDisabled,
                              ]}
                            >
                              Quarter
                            </Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[
                              styles.gradingPeriodEditButton,
                              isSemesterArchived &&
                                styles.gradingPeriodButtonDisabled,
                            ]}
                            onPress={() => openEditSemesterModal(semester)}
                            disabled={isSemesterArchived}
                          >
                            <SimpleIcon
                              name="edit"
                              size={18}
                              color={"#fff"}
                            />
                          </TouchableOpacity>
                        </View>
                      </View>
                      <Text
                        style={[
                          styles.gradingPeriodDates,
                          isSemesterArchived &&
                            styles.gradingPeriodTextDisabled,
                        ]}
                      >
                        {formatDateForInput(semester.startDate)} -{" "}
                        {formatDateForInput(semester.endDate)}
                      </Text>
                      {semester.quarters && semester.quarters.length > 0 && (
                        <View style={styles.gradingPeriodQuarters}>
                          {semester.quarters.map((quarter: any) => {
                            const isQuarterArchived = quarter.isArchived;
                            const isDisabled =
                              isSemesterArchived || isQuarterArchived;
                            return (
                              <View
                                key={quarter._id}
                                style={[
                                  styles.gradingPeriodQuarterItem,
                                  isDisabled &&
                                    styles.gradingPeriodItemDisabled,
                                ]}
                              >
                                <View style={styles.gradingPeriodRow}>
                                  <View style={styles.gradingPeriodInfo}>
                                    <Text
                                      style={[
                                        styles.gradingPeriodQuarterTitle,
                                        isDisabled &&
                                          styles.gradingPeriodTextDisabled,
                                      ]}
                                    >
                                      {quarter.title}
                                    </Text>
                                  </View>
                                  <View style={styles.gradingPeriodActions}>
                                    <View
                                      style={
                                        styles.gradingPeriodSwitchContainer
                                      }
                                    >
                                      <Switch
                                        value={isQuarterArchived}
                                        onValueChange={() =>
                                          handleToggleQuarterArchive(quarter)
                                        }
                                        trackColor={{
                                          false: "#d1d5db",
                                          true: "#10B144",
                                        }}
                                        thumbColor={
                                          isQuarterArchived ? "#fff" : "#fff"
                                        }
                                        disabled={isSemesterArchived}
                                        style={{
                                          transform: [
                                            {
                                              scale:
                                                Platform.OS === "ios"
                                                  ? 0.6
                                                  : 1,
                                            },
                                          ],
                                        }}
                                      />
                                      <Text
                                        style={[
                                          styles.gradingPeriodSwitchLabel,
                                          isDisabled &&
                                            styles.gradingPeriodTextDisabled,
                                        ]}
                                      >
                                        {isQuarterArchived
                                          ? "Archived"
                                          : "Unarchived"}
                                      </Text>
                                    </View>
                                    <TouchableOpacity
                                      style={[styles.gradingPeriodEditButton]}
                                      onPress={() =>
                                        openEditQuarterModal(quarter)
                                      }
                                      disabled={isDisabled}
                                    >
                                      <SimpleIcon
                                        name="edit"
                                        size={18}
                                        color={"#fff"}
                                      />
                                    </TouchableOpacity>
                                  </View>
                                </View>
                                <Text
                                  style={[
                                    styles.gradingPeriodDates,
                                    { marginLeft: 10 },
                                    isDisabled &&
                                      styles.gradingPeriodTextDisabled,
                                  ]}
                                >
                                  {formatDateForInput(quarter.startDate)} -{" "}
                                  {formatDateForInput(quarter.endDate)}
                                </Text>
                              </View>
                            );
                          })}
                        </View>
                      )}
                    </View>
                  );
                })
              )}
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
};

export default GradingPeriodsModal;
