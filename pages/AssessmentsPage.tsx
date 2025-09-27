import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, ActivityIndicator, Modal, TouchableOpacity, FlatList } from 'react-native';
// You will need to install react-native-dropdown-picker: npm install react-native-dropdown-picker or yarn add react-native-dropdown-picker
import DropDownPicker from 'react-native-dropdown-picker';
import { getAllAssessmentsByTeacher, getCategories, getAllCourses, getAssessmentSubmissionsForTeacher, getSubmissionDetails } from '../services/course';
import SimpleIcon from '../components/SimpleIcon';

const AssessmentsPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [rawAssessments, setRawAssessments] = useState([]); // Store the original fetched assessments
  const [filteredAssessments, setFilteredAssessments] = useState([]); // Store filtered assessments
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for Category Dropdown
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [categoryValue, setCategoryValue] = useState<string | null>(null);
  const [categoryItems, setCategoryItems] = useState<{ label: string; value: string; }[]>([]);

  // State for Course Dropdown
  const [courseOpen, setCourseOpen] = useState(false);
  const [courseValue, setCourseValue] = useState<string | null>(null);
  const [courseItems, setCourseItems] = useState<{ label: string; value: string; }[]>([]);

  // State for Dates Dropdown
  const [datesOpen, setDatesOpen] = useState(false);
  const [datesValue, setDatesValue] = useState<string | null>(null);
  const [datesItems, setDatesItems] = useState([
    { label: 'All Dates', value: 'all' },
  ]);

  // Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState<any>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);
  const [submissionsError, setSubmissionsError] = useState<string | null>(null);
  const [statusValue, setStatusValue] = useState<string>('all');
  const statusItems = [
    { label: 'All Statuses', value: 'all' },
    { label: 'After Due Date', value: 'after_due' },
    { label: 'Before Due Date', value: 'before_due' },
  ];
  const [modalStatusOpen, setModalStatusOpen] = useState(false);
  const [gradingValue, setGradingValue] = useState<string | null>(null);
  const gradingItems = [
    { label: 'All Grading', value: 'all' },
    { label: 'Graded', value: 'graded' },
    { label: 'Not Graded', value: 'not_graded' },
  ];
  const [modalGradingOpen, setModalGradingOpen] = useState(false);

  // Detailed submission modal state
  const [detailedModalVisible, setDetailedModalVisible] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [submissionDetails, setSubmissionDetails] = useState<any>(null);
  const [submissionDetailsLoading, setSubmissionDetailsLoading] = useState(false);
  const [submissionDetailsError, setSubmissionDetailsError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'needs_grading' | 'graded'>('all');

  // Effect to ensure only one dropdown is open at a time
  useEffect(() => {
    if (categoryOpen) {
      setCourseOpen(false);
      setDatesOpen(false);
    }
  }, [categoryOpen]);

  useEffect(() => {
    if (courseOpen) {
      setCategoryOpen(false);
      setDatesOpen(false);
    }
  }, [courseOpen]);

  useEffect(() => {
    if (datesOpen) {
      setCategoryOpen(false);
      setCourseOpen(false);
    }
  }, [datesOpen]);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch assessments
        const assessmentsData = await getAllAssessmentsByTeacher();
        setRawAssessments(assessmentsData); // Store raw data

        // Extract unique categories from assessments
        const uniqueCategories = Array.from(
          new Map(
            assessmentsData.map((a: any) => [a.category._id, { label: a.category.name, value: a.category._id }])
          ).values()
        ) as { label: string; value: string }[];
        
        // Add "no data available" if no categories
        if (uniqueCategories.length === 0) {
          setCategoryItems([{ label: 'No data available', value: 'no_data' }]);
        } else {
          setCategoryItems(uniqueCategories);
        }

        // Extract unique courses from assessments
        const uniqueCourses = Array.from(
          new Map(
            assessmentsData.map((a: any) => [a.course._id, { label: a.course.courseTitle, value: a.course._id }])
          ).values()
        ) as { label: string; value: string }[];
        
        // Add "no data available" if no courses
        if (uniqueCourses.length === 0) {
          setCourseItems([{ label: 'No data available', value: 'no_data' }]);
        } else {
          setCourseItems(uniqueCourses);
        }

        // Extract unique created dates from assessments (createdAt)
        const uniqueCreatedDates = Array.from(
          new Set(
            assessmentsData.map((a: any) => a.createdAt)
          )
        ).filter(Boolean) as string[];
        
        // Format dates and remove duplicates based on formatted date string
        const formattedCreatedDates = Array.from(
          new Map(
            uniqueCreatedDates.map((date) => {
              const formatted = formatDate(date);
              return [formatted, { label: formatted, value: date }];
            })
          ).values()
        ).sort((a, b) => new Date(b.value).getTime() - new Date(a.value).getTime());
        
        // Add "no data available" if no dates
        if (formattedCreatedDates.length === 0) {
          setDatesItems([
            { label: 'All Dates', value: 'all' },
            // { label: 'No data available', value: 'no_data' }
          ]);
        } else {
          setDatesItems([
            { label: 'All Dates', value: 'all' },
            ...formattedCreatedDates,
          ]);
        }
      } catch (err: any) {
        console.error("Failed to fetch initial data:", err);
        setError(err.message || "Failed to load data.");
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  useEffect(() => {
    // Filter assessments based on current criteria
    let currentFilteredAssessments = rawAssessments.filter((assessment: any) => {
      // Search by title
      const matchesSearch = assessment.title.toLowerCase().includes(searchQuery.toLowerCase());

      // Filter by category
      const matchesCategory = categoryValue && categoryValue !== 'no_data' ? assessment.category._id === categoryValue : true;

      // Filter by course
      const matchesCourse = courseValue && courseValue !== 'no_data' ? assessment.course._id === courseValue : true;

      // Filter by date (using createdAt now)
      const assessmentDate = new Date(assessment.createdAt);
      let matchesDate = true;

      if (datesValue && datesValue !== 'all' && datesValue !== 'no_data') {
        matchesDate = assessment.createdAt === datesValue;
      }

      return matchesSearch && matchesCategory && matchesCourse && matchesDate;
    });

    setFilteredAssessments(currentFilteredAssessments);
  }, [searchQuery, categoryValue, courseValue, datesValue, rawAssessments]); // Re-run when filters or raw data changes

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const formatDateTime = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  // Open modal and fetch submissions
  const handleAssessmentPress = async (assessment: any) => {
    setSelectedAssessment(assessment);
    setModalVisible(true);
    setSubmissions([]);
    setSubmissionsLoading(true);
    setSubmissionsError(null);
    setStatusValue('all');
    setGradingValue('all');
    try {
      const res = await getAssessmentSubmissionsForTeacher(assessment._id);
      if (res && Array.isArray(res.submissions)) {
        setSubmissions(res.submissions);
      } else {
        setSubmissions([]);
      }
    } catch (err: any) {
      setSubmissionsError('Failed to load submissions');
      setSubmissions([]);
    } finally {
      setSubmissionsLoading(false);
    }
  };

  // Filtered submissions
  const filteredSubmissions = submissions.filter((sub: any) => {
    let matchesStatus = true;
    if (statusValue === 'after_due' && selectedAssessment) {
      const dueDate = new Date(selectedAssessment.dueDate?.date);
      const submissionDate = new Date(sub.submissionDate || sub.createdAt);
      matchesStatus = submissionDate > dueDate;
    } else if (statusValue === 'before_due' && selectedAssessment) {
      const dueDate = new Date(selectedAssessment.dueDate?.date);
      const submissionDate = new Date(sub.submissionDate || sub.createdAt);
      matchesStatus = submissionDate <= dueDate;
    }
    let matchesGrading = true;
    if (gradingValue === 'graded') matchesGrading = sub.graded === true;
    else if (gradingValue === 'not_graded') matchesGrading = sub.graded === false;
    return matchesStatus && matchesGrading;
  });

  // Handle submission click to open detailed view
  const handleSubmissionPress = async (submission: any) => {
    // Close the first modal
    setModalVisible(false);
    
    // Open detailed modal
    setSelectedSubmission(submission);
    setDetailedModalVisible(true);
    setSubmissionDetails(null);
    setSubmissionDetailsLoading(true);
    setSubmissionDetailsError(null);
    setActiveTab('all');
    
    try {
      const details = await getSubmissionDetails(submission._id);
      setSubmissionDetails(details.submission);
    } catch (err: any) {
      setSubmissionDetailsError('Failed to load submission details');
      console.error('Error fetching submission details:', err);
    } finally {
      setSubmissionDetailsLoading(false);
    }
  };

  // Filter questions based on active tab
  const getFilteredQuestions = () => {
    if (!submissionDetails?.answers) return [];
    
    switch (activeTab) {
      case 'needs_grading':
        return submissionDetails.answers.filter((answer: any) => answer.requiresManualCheck);
      case 'graded':
        return submissionDetails.answers.filter((answer: any) => !answer.requiresManualCheck);
      default:
        return submissionDetails.answers;
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.dropdownContainer}>
        <View style={styles.dropdownWrapper}>
          <DropDownPicker
            open={categoryOpen}
            value={categoryValue}
            items={categoryItems}
            setOpen={setCategoryOpen}
            setValue={setCategoryValue}
            setItems={setCategoryItems}
            placeholder={categoryItems.length === 0 ? "No categories available" : "Select Category"}
            style={styles.dropdownPicker}
            containerStyle={styles.dropdownContainerStyle}
            zIndex={3000}
            zIndexInverse={1000}
            disabled={categoryItems.length === 0}
          />
        </View>
        <View style={styles.dropdownWrapper}>
          <DropDownPicker
            open={courseOpen}
            value={courseValue}
            items={courseItems}
            setOpen={setCourseOpen}
            setValue={setCourseValue}
            setItems={setCourseItems}
            placeholder={courseItems.length === 0 ? "No courses available" : "Select Course"}
            style={styles.dropdownPicker}
            containerStyle={styles.dropdownContainerStyle}
            zIndex={2000}
            zIndexInverse={1000}
            disabled={courseItems.length === 0}
          />
        </View>
        <View style={styles.dropdownWrapper}>
          <DropDownPicker
            open={datesOpen}
            value={datesValue}
            items={datesItems}
            setOpen={setDatesOpen}
            setValue={setDatesValue}
            setItems={setDatesItems}
            placeholder="All Dates"
            style={styles.dropdownPicker}
            containerStyle={styles.dropdownContainerStyle}
            zIndex={1000}
            zIndexInverse={0}
          />
        </View>
      </View>

      <View style={styles.noAssessmentsContainer}>
        {loading ? (
          <ActivityIndicator size="large" color="#007bff" style={styles.loadingIndicator} />
        ) : error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : filteredAssessments.length === 0 ? (
          <Text style={styles.noAssessmentsText}>No assessments available.</Text>
        ) : (
          filteredAssessments.map((assessment: any) => (
            <TouchableOpacity style={styles.maincardwidth} key={assessment._id} onPress={() => handleAssessmentPress(assessment)}>
              <View style={styles.assessmentCard}>
                <Text style={styles.assessmentTitle}>{assessment.title}</Text>
                <View style={styles.tagContainer}>
                  <Text style={styles.tag}>{assessment.category.name}</Text>
                </View>
                <View style={styles.courseInfo}>
                  <View style={styles.plusCircle}>
                    <Text style={styles.plusSign}>+</Text>
                  </View>
                  <Text style={styles.courseTitle}>{assessment.course.courseTitle}</Text>
                </View>
                <Text style={styles.assessmentDescription}>{assessment.description}</Text>
                <Text style={styles.assessmentDate}>Due: {formatDate(assessment.dueDate?.date)}</Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          {/* Header: Assessment Title, Due Date and Close Icon */}
          <View style={styles.modalHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.modalAssessmentTitle}>
                {selectedAssessment ? selectedAssessment.title : ''}
              </Text>
              <Text style={styles.modalDueDate}>
                Due: {selectedAssessment ? formatDate(selectedAssessment.dueDate?.date) : ''}
              </Text>
            </View>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <SimpleIcon name="close" size={32} color="#333" />
            </TouchableOpacity>
          </View>
          {/* Dropdowns */}
          <View style={styles.modalDropdownsRow}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <DropDownPicker
                open={modalStatusOpen}
                value={statusValue}
                items={statusItems}
                setOpen={setModalStatusOpen}
                setValue={setStatusValue}
                setItems={() => {}}
                placeholder="All Statuses"
                style={styles.dropdownPicker}
                containerStyle={styles.dropdownContainerStyle}
                zIndex={5000}
                zIndexInverse={4000}
                listMode="SCROLLVIEW"
              />
            </View>
            <View style={{ flex: 1, marginLeft: 8 }}>
              <DropDownPicker
                open={modalGradingOpen}
                value={gradingValue}
                items={gradingItems}
                setOpen={setModalGradingOpen}
                setValue={setGradingValue}
                setItems={() => {}}
                placeholder="All Grading"
                style={styles.dropdownPicker}
                containerStyle={styles.dropdownContainerStyle}
                zIndex={4000}
                zIndexInverse={3000}
                listMode="SCROLLVIEW"
              />
            </View>
          </View>
          {/* Submissions List or Empty State */}
          <View style={styles.modalContent}>
            {submissionsLoading ? (
              <ActivityIndicator size="large" color="#007bff" style={styles.loadingIndicator} />
            ) : submissionsError ? (
              <Text style={styles.errorText}>{submissionsError}</Text>
            ) : filteredSubmissions.length === 0 ? (
              <Text style={styles.noAssessmentsText}>No submissions found</Text>
            ) : (
              <FlatList
                style={{ width: '100%' }}
                data={filteredSubmissions}
                keyExtractor={(item) => item._id}
                renderItem={({ item }) => (
                  <TouchableOpacity 
                    style={styles.submissionCard}
                    onPress={() => handleSubmissionPress(item)}
                  >
                    {/* Student Information */}
                    <View style={styles.studentInfo}>
                      <View style={styles.avatarContainer}>
                        <Text style={styles.avatarText}>
                          {item.studentId?.firstName?.charAt(0) || 'U'}
                        </Text>
                      </View>
                      <View style={styles.studentDetails}>
                        <Text style={styles.studentName}>
                          {item.studentId?.firstName} {item.studentId?.lastName}
                        </Text>
                        <Text style={styles.studentEmail}>
                          {item.studentId?.email}
                        </Text>
                      </View>
                    </View>

                    {/* Status */}
                    <View style={styles.statusContainer}>
                      <Text style={styles.statusLabel}>Status:</Text>
                      <Text style={[
                        styles.statusValue,
                        { color: item.status === 'before due date' ? '#10B144' : '#FF6B6B' }
                      ]}>
                        {item.status}
                      </Text>
                    </View>

                    {/* Grading */}
                    <View style={styles.gradingContainer}>
                      <Text style={styles.gradingLabel}>Grading:</Text>
                      <Text style={[
                        styles.gradingValue,
                        { color: item.graded ? '#10B144' : '#FF6B6B' }
                      ]}>
                        {item.graded ? 'Graded' : 'Not Graded'}
                      </Text>
                    </View>

                    {/* Submission Time */}
                    <View style={styles.submissionTimeContainer}>
                      <Text style={styles.submissionTimeLabel}>Submitted At:</Text>
                      <Text style={styles.submissionTimeValue}>
                        {formatDateTime(item.submittedAt || item.createdAt)}
                      </Text>
                    </View>

                    {/* Score if graded */}
                    {item.graded && (
                      <View style={styles.scoreContainer}>
                        <Text style={styles.scoreLabel}>Score:</Text>
                        <Text style={styles.scoreValue}>
                          {item.totalScore} points
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                )}
              />
            )}
          </View>
        </View>
      </Modal>

      {/* Detailed Submission Modal */}
      <Modal
        visible={detailedModalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setDetailedModalVisible(false)}
      >
        <View style={styles.detailedModalContainer}>
          {/* Header */}
          <View style={styles.detailedModalHeader}>
            <Text style={styles.detailedModalTitle}>Submission Details</Text>
            <TouchableOpacity 
              style={styles.detailedModalCloseButton}
              onPress={() => setDetailedModalVisible(false)}
            >
              <SimpleIcon name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          {submissionDetailsLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#007bff" />
            </View>
          ) : submissionDetailsError ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{submissionDetailsError}</Text>
            </View>
          ) : submissionDetails ? (
            <ScrollView style={styles.detailedModalContent}>
              {/* Student and Submission Overview */}
              <View style={styles.submissionOverview}>
                <View style={styles.avatarContainer}>
                  <Text style={styles.avatarText}>
                    {submissionDetails.studentId?.firstName?.charAt(0) || 'U'}
                  </Text>
                </View>
                <View style={styles.studentOverviewDetails}>
                  <View style={styles.studentNameRow}>
                    <Text style={styles.studentOverviewName}>
                      {submissionDetails.studentId?.firstName} {submissionDetails.studentId?.lastName}
                    </Text>
                    <View style={styles.statusTags}>
                      <View style={[styles.statusTag, { backgroundColor: '#E5E7EB' }]}>
                        <Text style={styles.statusTagText}>{submissionDetails.status}</Text>
                      </View>
                      <View style={[styles.statusTag, { backgroundColor: '#E5E7EB' }]}>
                        <Text style={styles.statusTagText}>
                          {submissionDetails.graded ? 'Graded' : 'Not Graded'}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <Text style={styles.studentOverviewEmail}>
                    {submissionDetails.studentId?.email}
                  </Text>
                  <Text style={styles.submissionTime}>
                    Submitted on: {formatDateTime(submissionDetails.submittedAt || submissionDetails.createdAt)}
                  </Text>
                </View>
              </View>

              {/* Assessment Summary */}
              <View style={styles.assessmentSummary}>
                <Text style={styles.assessmentSummaryTitle}>Assessment Summary</Text>
                <View style={styles.assessmentSummaryCard}>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Assessment ID</Text>
                    <Text style={styles.summaryValue}>{submissionDetails.assessment}</Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Total Points</Text>
                    <Text style={styles.summaryValue}>{submissionDetails.totalScore} points</Text>
                  </View>
                </View>
              </View>

              {/* Question Tabs */}
              <View style={styles.questionTabs}>
                <TouchableOpacity
                  style={[styles.tab, activeTab === 'all' && styles.activeTab]}
                  onPress={() => setActiveTab('all')}
                >
                  <Text style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}>
                    All Questions ({submissionDetails.answers?.length || 0})
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.tab, activeTab === 'needs_grading' && styles.activeTab]}
                  onPress={() => setActiveTab('needs_grading')}
                >
                  <Text style={[styles.tabText, activeTab === 'needs_grading' && styles.activeTabText]}>
                    Needs Grading ({submissionDetails.answers?.filter((a: any) => a.requiresManualCheck).length || 0})
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.tab, activeTab === 'graded' && styles.activeTab]}
                  onPress={() => setActiveTab('graded')}
                >
                  <Text style={[styles.tabText, activeTab === 'graded' && styles.activeTabText]}>
                    Graded ({submissionDetails.answers?.filter((a: any) => !a.requiresManualCheck).length || 0})
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Questions List */}
              <View style={styles.questionsContainer}>
                {getFilteredQuestions().map((answer: any, index: number) => (
                  <View key={answer._id} style={styles.questionCard}>
                    <View style={styles.questionHeader}>
                      <Text style={styles.questionNumber}>Question {index + 1}</Text>
                      <Text style={styles.questionType}>{answer.questionDetails?.type == "truefalse" ? "True/False":answer.questionDetails?.type}</Text>
                      <View style={styles.questionTags}>
                        <View style={[styles.questionTag, { backgroundColor: answer.isCorrect ? '#D1FAE5' : '#FEE2E2' }]}>
                          <Text style={[styles.questionTagText, { color: answer.isCorrect ? '#065F46' : '#991B1B' }]}>
                            {answer.isCorrect ? '✓ Correct' : '✗ Incorrect'}
                          </Text>
                        </View>
                        <View style={[styles.questionTag, { backgroundColor: '#F3F4F6' }]}>
                          <Text style={[styles.questionTagText, { color: '#374151' }]}>
                            {answer.pointsAwarded}/{answer.questionDetails?.points} pts
                          </Text>
                        </View>
                      </View>
                    </View>
                    
                    <View style={styles.questionContent}>
                      <Text style={styles.questionLabel}>Question:</Text>
                      <View style={styles.questionTextContainer}>
                        <Text style={styles.questionText}>
                          {answer.questionDetails?.question?.replace(/<[^>]*>/g, '') || 'No question text'}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.answerContent}>
                      <Text style={styles.answerLabel}>Student's Answer:</Text>
                      <View style={styles.answerTextContainer}>
                        <Text style={styles.answerText}>
                          {answer.selectedAnswer || 'No answer provided'}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>

              {/* Submit Grades Button */}
              <TouchableOpacity style={styles.submitGradesButton}>
                <Text style={styles.submitGradesButtonText}>Submit Grades</Text>
              </TouchableOpacity>
            </ScrollView>
          ) : null}
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  dropdownContainer: {
    marginBottom: 16,
  },
  dropdownWrapper: {
    marginBottom: 10,
  },
  dropdownPicker: {
    backgroundColor: '#fff',
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 10,
  },
  dropdownContainerStyle: {
    height: 50,
    marginBottom: 10,
  },
  header: {
    marginBottom: 16,
  },
  searchInput: {
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  loadingIndicator: {
    marginTop: 50,
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
    marginTop: 50,
  },
  noAssessmentsText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 50,
  },
  assessmentCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    width: '100%',
  },
  assessmentTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  tagContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  tag: {
    backgroundColor: '#e6ffe6',
    color: '#00a000',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
    fontSize: 12,
    fontWeight: 'bold',
  },
  courseInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  plusCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#e6ffe6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  plusSign: {
    color: '#00a000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  courseTitle: {
    fontSize: 16,
    color: '#555',
    fontWeight: '600',
  },
  assessmentDescription: {
    fontSize: 16,
    color: '#444',
    marginBottom: 10,
  },
  assessmentDate: {
    fontSize: 13,
    color: '#777',
    fontStyle: 'italic',
  },
  assessmentHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    marginBottom: 12,
  },
  assessmentHeaderText: {
    fontWeight: 'bold',
    color: '#555',
    fontSize: 14,
    textAlign: 'center',
  },
  assessmentNameColumn: {
    flex: 2,
    textAlign: 'left',
  },
  courseColumn: {
    flex: 1.5,
  },
  dueDateColumn: {
    flex: 1.5,
  },
  statusColumn: {
    flex: 1,
  },
  typeColumn: {
    flex: 1,
  },
  noAssessmentsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  maincardwidth:{
    width:"100%"
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 24,
    justifyContent: 'flex-start',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalDueDate: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalDropdownsRow: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  modalContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submissionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  studentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6B7280',
  },
  studentDetails: {
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 2,
  },
  studentEmail: {
    fontSize: 14,
    color: '#6B7280',
  },
  statusContainer: {
    marginBottom: 12,
  },
  statusLabel: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 4,
  },
  statusValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  gradingContainer: {
    marginBottom: 12,
  },
  gradingLabel: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 4,
  },
  gradingValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  submissionTimeContainer: {
    marginBottom: 12,
  },
  submissionTimeLabel: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 4,
  },
  submissionTimeValue: {
    fontSize: 14,
    color: '#111827',
  },
  scoreContainer: {
    marginBottom: 8,
  },
  scoreLabel: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 4,
  },
  scoreValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#10B144',
  },
  modalAssessmentTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 4,
  },
  // Detailed Modal Styles
  detailedModalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  detailedModalHeader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    position: 'relative',
  },
  detailedModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  detailedModalCloseButton: {
    position: 'absolute',
    right: 20,
    top: 16,
    bottom: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailedModalContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  // Submission Overview Styles
  submissionOverview: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  studentOverviewDetails: {
    marginLeft: 12,
    flex: 1,
  },
  studentNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  studentOverviewName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    flex: 1,
  },
  studentOverviewEmail: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  statusTags: {
    flexDirection: 'row',
    marginLeft: 12,
  },
  statusTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginLeft: 8,
  },
  statusTagText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
  },
  submissionTime: {
    fontSize: 12,
    color: '#6B7280',
  },
  // Assessment Summary Styles
  assessmentSummary: {
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  assessmentSummaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  assessmentSummaryCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  // Question Tabs Styles
  questionTabs: {
    flexDirection: 'row',
    marginVertical: 20,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#111827',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
    textAlign: 'center',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  // Questions Container Styles
  questionsContainer: {
    marginBottom: 20,
  },
  questionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  questionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  questionNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginRight: 12,
  },
  questionType: {
    fontSize: 14,
    color: '#6B7280',
    marginRight: 12,
  },
  questionTags: {
    flexDirection: 'row',
    marginLeft: 'auto',
  },
  questionTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  questionTagText: {
    fontSize: 12,
    fontWeight: '500',
  },
  questionContent: {
    marginBottom: 16,
  },
  questionLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  questionTextContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
  },
  questionText: {
    fontSize: 14,
    color: '#111827',
  },
  answerContent: {
    marginBottom: 8,
  },
  answerLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  answerTextContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
  },
  answerText: {
    fontSize: 14,
    color: '#111827',
  },
  // Submit Button Styles
  submitGradesButton: {
    backgroundColor: '#10B981',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginBottom: 20,
  },
  submitGradesButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default AssessmentsPage; 