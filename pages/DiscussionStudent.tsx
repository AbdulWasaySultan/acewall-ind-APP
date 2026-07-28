"use client";

import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  TextInput,
  Linking,
  Image,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import {
  useRoute,
  useNavigation,
  type RouteProp,
} from "@react-navigation/native";
import DateTimePicker from "@react-native-community/datetimepicker";
import Toast from "react-native-simple-toast";
import SimpleIcon from "../components/SimpleIcon";
import AnimatedBottomSheet from "../components/common/AnimatedBottomSheet";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../contexts/AuthContext";
import {
  getStudentDiscussion,
  getCommentForDiscussionStudent,
  sendComment,
  isCommentedInDiscussion,
  getReplyCount,
  sendReply,
  getReplies,
  gradeDiscussionComment,
  getStudentsOfCourse,
  editDiscussion,
  toggleDiscussionResubmission,
  setDiscussionDueDateForStudents,
  getAssessmentCategories,
} from "../services/course";

interface DiscussionDetailParams {
  discussionId: string;
}

interface Discussion {
  _id: string;
  dueDate: {
    date: string;
    time: string;
  };
  course: {
    _id: string;
    courseTitle: string;
    thumbnail: {
      url: string;
      publicId: string;
      filename: string;
    };
  };
  totalMarks: number;
  topic: string;
  description: string;
  files: DiscussionFile[];
  category: string;
  semester: string;
  quarter: string;
  allowResubmission?: boolean;
  studentDueDateOverrides?: {
    _id: string;
    student: {
      _id: string;
      firstName: string;
      middleName?: string;
      lastName: string;
      email: string;
    };
    newDueDate: { date: string; time: string };
  }[];
  chapter: {
    _id: string;
    title: string;
  };
  type: string;
  createdby: {
    _id: string;
    firstName: string;
    middleName: string;
    lastName: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface DiscussionFile {
  _id: string;
  url: string;
  type: string;
  filename: string;
  publicId: string;
}

interface Comment {
  _id: string;
  text: string;
  discussion: string;
  role: string;
  createdby: {
    _id: string;
    firstName: string;
    middleName?: string;
    lastName: string;
    role: string;
  };
  marksObtained: number;
  isGraded: boolean;
  createdAt: string;
  updatedAt: string;
  replyCount?: number;
  showReplies?: boolean;
  replies?: Reply[];
  repliesLoading?: boolean;
  showReplyInput?: boolean;
  replyText?: string;
  sendingReply?: boolean;
}

interface Reply {
  _id: string;
  text: string;
  role: string;
  comment: string;
  createdby: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface CommentsResponse {
  discussionComments: Comment[];
  totalPages: number;
  currentPage: number;
}

const DiscussionStudent = () => {
  const route =
    useRoute<RouteProp<Record<string, DiscussionDetailParams>, string>>();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { discussionId } = route.params;
  const { userRole } = useAuth();
  const isTeacher = userRole === "teacher";

  const [discussion, setDiscussion] = useState<Discussion | null>(null);
  const [gradingComment, setGradingComment] = useState<Comment | null>(null);
  const [marksInput, setMarksInput] = useState("");
  const [gradingLoading, setGradingLoading] = useState(false);
  const [gradingError, setGradingError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [commentText, setCommentText] = useState("");
  const [sendingComment, setSendingComment] = useState(false);
  const [hasCommented, setHasCommented] = useState(false);
  const [checkingCommented, setCheckingCommented] = useState(false);

  // ── Settings sheet (teacher): resubmission + due date extensions ──
  const [showSettingsSheet, setShowSettingsSheet] = useState(false);
  const [savingResubmission, setSavingResubmission] = useState(false);
  const [courseStudents, setCourseStudents] = useState<any[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [studentSearch, setStudentSearch] = useState("");
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [overrideDate, setOverrideDate] = useState<Date | null>(null);
  const [tempOverrideDate, setTempOverrideDate] = useState<Date | null>(null);
  const [showOverrideDatePicker, setShowOverrideDatePicker] = useState(false);
  const [showOverrideTimePicker, setShowOverrideTimePicker] = useState(false);
  const [savingOverride, setSavingOverride] = useState(false);

  // ── Edit sheet (teacher): topic / description / category / due date ──
  const [showEditSheet, setShowEditSheet] = useState(false);
  const [editTopic, setEditTopic] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editCategories, setEditCategories] = useState<any[]>([]);
  const [editCategoryId, setEditCategoryId] = useState("");
  const [showEditCategorySheet, setShowEditCategorySheet] = useState(false);
  const [editDueDate, setEditDueDate] = useState<Date | null>(null);
  const [tempEditDate, setTempEditDate] = useState<Date | null>(null);
  const [showEditDatePicker, setShowEditDatePicker] = useState(false);
  const [showEditTimePicker, setShowEditTimePicker] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);

  useEffect(() => {
    fetchDiscussionDetails();
    fetchComments(1);
    checkIfCommented();
  }, [discussionId, navigation]);

  const fetchDiscussionDetails = async () => {
    setLoading(true);
    try {
      const response = await getStudentDiscussion(discussionId);
      console.log("Discussion:", JSON.stringify(response.discussion, null, 2));
      console.log(response.discussion.files);
      if (response?.discussion) {
        setDiscussion(response.discussion);
      }
    } catch (error) {
      console.error("Error fetching discussion:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async (page: number) => {
    setCommentsLoading(true);
    try {
      const response: CommentsResponse = await getCommentForDiscussionStudent(
        discussionId,
        page,
        5
      );
      if (response?.discussionComments) {
        const commentsWithReplyCounts = await Promise.all(
          response.discussionComments.map(async (comment) => {
            try {
              const replyCountResponse = await getReplyCount(comment._id);
              return {
                ...comment,
                replyCount: replyCountResponse?.replyCount || 0,
                showReplies: false,
                replies: [],
                repliesLoading: false,
                showReplyInput: false,
                replyText: "",
                sendingReply: false,
              };
            } catch (error) {
              return {
                ...comment,
                replyCount: 0,
                showReplies: false,
                replies: [],
                repliesLoading: false,
                showReplyInput: false,
                replyText: "",
                sendingReply: false,
              };
            }
          })
        );

        if (page === 1) {
          setComments(commentsWithReplyCounts);
        } else {
          setComments((prev) => [...prev, ...commentsWithReplyCounts]);
        }
        setTotalPages(response.totalPages);
        setCurrentPage(response.currentPage);
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setCommentsLoading(false);
    }
  };

  const handleLoadMoreComments = () => {
    if (currentPage < totalPages && !commentsLoading) {
      fetchComments(currentPage + 1);
    }
  };

  const handleSendComment = async () => {
    if (!commentText.trim()) return;

    setSendingComment(true);
    try {
      await sendComment(discussionId, commentText);
      setCommentText("");
      fetchComments(1);
      checkIfCommented();
    } catch (error) {
      console.error("Error sending comment:", error);
    } finally {
      setSendingComment(false);
    }
  };

  const checkIfCommented = async () => {
    setCheckingCommented(true);
    try {
      const response = await isCommentedInDiscussion(discussionId);
      setHasCommented(response?.commented || false);
    } catch (error) {
      console.error("Error checking if commented:", error);
    } finally {
      setCheckingCommented(false);
    }
  };

  // ── Settings sheet (teacher) ────────────────────────────────────────────
  const openSettingsSheet = async () => {
    if (!discussion?.course?._id) return;
    setShowSettingsSheet(true);
    setStudentSearch("");
    setSelectedStudentIds([]);
    setOverrideDate(null);
    setTempOverrideDate(null);
    setLoadingStudents(true);
    try {
      const students = await getStudentsOfCourse(discussion.course._id);
      setCourseStudents(students);
    } catch (error) {
      Toast.show("Failed to load students.", Toast.LONG);
    } finally {
      setLoadingStudents(false);
    }
  };

  const handleToggleResubmission = async () => {
    if (!discussion?._id) return;
    const newValue = !discussion.allowResubmission;
    setDiscussion((prev) =>
      prev ? { ...prev, allowResubmission: newValue } : prev
    );
    setSavingResubmission(true);
    try {
      const res = await toggleDiscussionResubmission(discussion._id, newValue);
      setDiscussion((prev) =>
        prev ? { ...prev, allowResubmission: res.allowResubmission } : prev
      );
    } catch (error) {
      setDiscussion((prev) =>
        prev ? { ...prev, allowResubmission: !newValue } : prev
      );
      Toast.show("Failed to update resubmission setting.", Toast.LONG);
    } finally {
      setSavingResubmission(false);
    }
  };

  const toggleStudentSelection = (studentId: string) => {
    setSelectedStudentIds((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleSaveExtension = async () => {
    if (!discussion?._id) return;
    if (selectedStudentIds.length === 0) {
      Toast.show("Select at least one student.", Toast.LONG);
      return;
    }
    if (!overrideDate) {
      Toast.show("Pick an override date and time.", Toast.LONG);
      return;
    }
    setSavingOverride(true);
    try {
      const date = overrideDate.toISOString().split("T")[0];
      const time = `${String(overrideDate.getHours()).padStart(
        2,
        "0"
      )}:${String(overrideDate.getMinutes()).padStart(2, "0")}`;
      await setDiscussionDueDateForStudents(discussion._id, selectedStudentIds, {
        date,
        time,
      });
      Toast.show("Due date extension saved.", Toast.LONG);
      setSelectedStudentIds([]);
      setOverrideDate(null);
      await fetchDiscussionDetails();
    } catch (error: any) {
      Toast.show(
        error?.response?.data?.message || "Failed to save extension.",
        Toast.LONG
      );
    } finally {
      setSavingOverride(false);
    }
  };

  const filteredCourseStudents = courseStudents.filter((s) => {
    if (!studentSearch.trim()) return true;
    const full = `${s.firstName} ${s.middleName || ""} ${s.lastName} ${
      s.email || ""
    }`.toLowerCase();
    return full.includes(studentSearch.toLowerCase().trim());
  });

  // ── Edit sheet (teacher) ────────────────────────────────────────────────
  const openEditSheet = async () => {
    if (!discussion) return;
    setEditTopic(discussion.topic || "");
    setEditDescription(discussion.description || "");
    const categoryId =
      typeof discussion.category === "string"
        ? discussion.category
        : (discussion.category as any)?._id || "";
    setEditCategoryId(categoryId);
    if (discussion.dueDate?.date) {
      const due = new Date(discussion.dueDate.date);
      if (discussion.dueDate.time) {
        const [h, m] = discussion.dueDate.time.split(":");
        due.setHours(parseInt(h, 10), parseInt(m, 10));
      }
      setEditDueDate(due);
    } else {
      setEditDueDate(null);
    }
    setShowEditSheet(true);
    try {
      const res = await getAssessmentCategories(discussion.course._id);
      setEditCategories(res?.categories || []);
    } catch (error) {
      Toast.show("Failed to load categories.", Toast.LONG);
    }
  };

  const handleSaveEdit = async () => {
    if (!discussion?._id) return;
    if (!editTopic.trim() || !editDescription.trim() || !editCategoryId) {
      Toast.show("Topic, description and category are required.", Toast.LONG);
      return;
    }
    if (!editDueDate) {
      Toast.show("Please select a due date.", Toast.LONG);
      return;
    }
    setSavingEdit(true);
    try {
      await editDiscussion(discussion._id, {
        topic: editTopic.trim(),
        description: editDescription.trim(),
        category: editCategoryId,
        dueDate: editDueDate.toISOString(),
      });
      Toast.show("Discussion updated successfully.", Toast.LONG);
      setShowEditSheet(false);
      await fetchDiscussionDetails();
    } catch (error: any) {
      Toast.show(
        error?.response?.data?.message || "Failed to update discussion.",
        Toast.LONG
      );
    } finally {
      setSavingEdit(false);
    }
  };

  const openGradeModal = (comment: Comment) => {
    setGradingComment(comment);
    setMarksInput("");
    setGradingError(null);
  };

  const closeGradeModal = () => {
    if (gradingLoading) return;
    setGradingComment(null);
    setMarksInput("");
    setGradingError(null);
  };

  const handleSubmitGrade = async () => {
    if (!gradingComment) return;

    const trimmed = marksInput.trim();
    if (!trimmed) {
      setGradingError("Marks are required");
      return;
    }
    const marks = Number(trimmed);
    if (isNaN(marks) || marks < 0) {
      setGradingError("Marks cannot be negative");
      return;
    }
    if (discussion?.totalMarks != null && marks > discussion.totalMarks) {
      setGradingError(`Marks cannot exceed total (${discussion.totalMarks})`);
      return;
    }

    setGradingLoading(true);
    setGradingError(null);
    try {
      await gradeDiscussionComment(discussionId, gradingComment._id, marks);
      setGradingComment(null);
      setMarksInput("");
      fetchComments(1);
      checkIfCommented();
    } catch (error: any) {
      setGradingError(
        error?.response?.data?.message || "Error giving marks"
      );
    } finally {
      setGradingLoading(false);
    }
  };

  const toggleReplyInput = (commentId: string) => {
    setComments((prev) =>
      prev.map((comment) =>
        comment._id === commentId
          ? { ...comment, showReplyInput: !comment.showReplyInput }
          : comment
      )
    );
  };

  const updateReplyText = (commentId: string, text: string) => {
    setComments((prev) =>
      prev.map((comment) =>
        comment._id === commentId ? { ...comment, replyText: text } : comment
      )
    );
  };

  const handleSendReply = async (commentId: string) => {
    const comment = comments.find((c) => c._id === commentId);
    if (!comment?.replyText?.trim()) return;

    setComments((prev) =>
      prev.map((c) => (c._id === commentId ? { ...c, sendingReply: true } : c))
    );

    try {
      await sendReply(commentId, comment.replyText);
      setComments((prev) =>
        prev.map((c) =>
          c._id === commentId
            ? {
                ...c,
                replyText: "",
                showReplyInput: false,
                sendingReply: false,
              }
            : c
        )
      );
      if (comment.showReplies) {
        fetchRepliesForComment(commentId);
      }
      const replyCountResponse = await getReplyCount(commentId);
      setComments((prev) =>
        prev.map((c) =>
          c._id === commentId
            ? { ...c, replyCount: replyCountResponse?.replyCount || 0 }
            : c
        )
      );
    } catch (error) {
      console.error("Error sending reply:", error);
      setComments((prev) =>
        prev.map((c) =>
          c._id === commentId ? { ...c, sendingReply: false } : c
        )
      );
    }
  };

  const fetchRepliesForComment = async (commentId: string) => {
    setComments((prev) =>
      prev.map((comment) =>
        comment._id === commentId
          ? { ...comment, repliesLoading: true }
          : comment
      )
    );

    try {
      const response = await getReplies(commentId, 1, 5);
      setComments((prev) =>
        prev.map((comment) =>
          comment._id === commentId
            ? {
                ...comment,
                replies: response?.replies || [],
                repliesLoading: false,
              }
            : comment
        )
      );
    } catch (error) {
      console.error("Error fetching replies:", error);
      setComments((prev) =>
        prev.map((comment) =>
          comment._id === commentId
            ? { ...comment, repliesLoading: false }
            : comment
        )
      );
    }
  };

  const toggleShowReplies = async (commentId: string) => {
    const comment = comments.find((c) => c._id === commentId);
    if (!comment) return;

    if (
      !comment.showReplies &&
      (!comment.replies || comment.replies.length === 0)
    ) {
      await fetchRepliesForComment(commentId);
    }

    setComments((prev) =>
      prev.map((c) =>
        c._id === commentId ? { ...c, showReplies: !c.showReplies } : c
      )
    );
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return "less than a minute ago";
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days > 1 ? "s" : ""} ago`;
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.includes("image")) return "image";
    if (fileType.includes("pdf")) return "description";
    if (fileType.includes("video")) return "videocam";
    return "attach-file";
  };

  const getFileIconColor = (fileType: string) => {
    if (fileType.includes("image")) return "#6366f1";
    if (fileType.includes("pdf")) return "#3b82f6";
    if (fileType.includes("video")) return "#ef4444";
    return "#666";
  };

  const renderComment = ({ item }: { item: Comment }) => (
    <View style={styles.commentItem}>
      <View style={styles.commentAvatar}>
        <Text style={styles.avatarText}>
          {item.createdby.firstName.charAt(0).toUpperCase()}
        </Text>
      </View>
      <View style={styles.commentContent}>
        <View style={styles.commentHeader}>
          <Text style={styles.commentAuthor}>
            {item.createdby.firstName} {item.createdby.lastName}
          </Text>
          <Text style={styles.commentDate}>
            {formatRelativeTime(item.createdAt)}
          </Text>
        </View>
        <Text style={styles.commentText}>{item.text}</Text>

        <View style={styles.commentActions}>
          <TouchableOpacity onPress={() => toggleReplyInput(item._id)}>
            <Text style={styles.actionText}>Reply</Text>
          </TouchableOpacity>

          {item.replyCount! > 0 && (
            <TouchableOpacity onPress={() => toggleShowReplies(item._id)}>
              <Text style={styles.actionText}>
                {item.showReplies
                  ? "Hide replies"
                  : `Show replies (${item.replyCount})`}
              </Text>
            </TouchableOpacity>
          )}

          {isTeacher && item.createdby.role !== "teacher" && !item.isGraded && (
            <TouchableOpacity onPress={() => openGradeModal(item)}>
              <Text style={styles.giveMarksText}>Give Marks</Text>
            </TouchableOpacity>
          )}

          {item.createdby.role !== "teacher" && (
            <Text style={styles.notGradedText}>
              {item.isGraded
                ? `Obtained Marks: ${item.marksObtained}`
                : "Not Graded"}
            </Text>
          )}
        </View>

        {item.showReplyInput && (
          <View style={styles.replyInputContainer}>
            <View style={styles.replyInputAvatar}>
              <Text style={styles.replyInputAvatarText}>U</Text>
            </View>
            <TextInput
              style={styles.replyInput}
              placeholder="Write a reply..."
              placeholderTextColor="#999"
              value={item.replyText}
              onChangeText={(text) => updateReplyText(item._id, text)}
              multiline
            />
            <TouchableOpacity
              style={[
                styles.replyButton,
                !item.replyText?.trim() && styles.replyButtonDisabled,
              ]}
              onPress={() => handleSendReply(item._id)}
              disabled={!item.replyText?.trim() || item.sendingReply}
            >
              {item.sendingReply ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <SimpleIcon name="send" size={16} color="#fff" />
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => toggleReplyInput(item._id)}
            >
              <SimpleIcon name="delete" size={16} color="#ef4444" />
            </TouchableOpacity>
          </View>
        )}

        {item.showReplies && (
          <View style={styles.repliesContainer}>
            {item.repliesLoading ? (
              <ActivityIndicator
                size="small"
                color="#10B144"
                style={styles.repliesLoading}
              />
            ) : (
              <>
                {item.replies?.map((reply) => (
                  <View key={reply._id} style={styles.replyItem}>
                    <View style={styles.replyAvatar}>
                      <Text style={styles.replyAvatarText}>
                        {reply.createdby.firstName.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View style={styles.replyContent}>
                      <View style={styles.replyHeader}>
                        <Text style={styles.replyAuthor}>
                          {reply.createdby.firstName} {reply.createdby.lastName}
                        </Text>
                        <Text style={styles.replyDate}>
                          {formatRelativeTime(reply.createdAt)}
                        </Text>
                      </View>
                      <Text style={styles.replyText}>{reply.text}</Text>
                    </View>
                  </View>
                ))}
              </>
            )}
          </View>
        )}
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10B144" />
      </View>
    );
  }

  if (!discussion) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Discussion not found</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={insets.top}
    >
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <SimpleIcon name="arrow-back" size={24} color="#333" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>

        {isTeacher && (
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.headerActionButton}
              onPress={openSettingsSheet}
            >
              <SimpleIcon name="settings" size={20} color="#333" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.headerActionButton}
              onPress={openEditSheet}
            >
              <SimpleIcon name="edit" size={20} color="#333" />
            </TouchableOpacity>
          </View>
        )}
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
      >
        <View style={styles.discussionBanner}>
          <Text style={styles.discussionBannerText}>Discussion</Text>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <SimpleIcon name="calendar" size={20} />
            <Text style={styles.infoLabel}>Due Date:</Text>
            <Text style={styles.infoValue}>
              {new Date(discussion.dueDate.date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
              })}{" "}
              | {discussion.dueDate.time || "00:00"}
            </Text>
          </View>

          <View style={styles.infoRowSplit}>
            <View style={styles.infoColumn}>
              <View style={styles.row}>
                <SimpleIcon name="school" size={16} />

                <Text style={styles.infoLabel}>Course</Text>
              </View>
              <Text style={styles.infoValue}>
                {discussion.course.courseTitle}
              </Text>
            </View>

            <View style={styles.infoColumn}>
              <View style={styles.row}>
                <SimpleIcon name="book" size={16} />

                <Text style={styles.infoLabel}>Chapter</Text>
              </View>

              <Text style={styles.infoValue}>{discussion?.chapter?.title}</Text>
            </View>
          </View>
        </View>

        <View style={styles.discussionContent}>
          <Text style={styles.discussionTitle}>{discussion.topic}</Text>
          <Text style={styles.discussionDescription}>
            {discussion.description}
          </Text>
          {
            discussion.files && discussion.files.length > 0 && (
              <View style={styles.filesSection}>
                {discussion.files.map((file, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.fileItem}
                    onPress={() => Linking.openURL(file.url)}
                  >
                    <View
                      style={[
                        styles.fileIconContainer,
                        { backgroundColor: getFileIconColor(file.type) + "20" },
                      ]}
                    >
                      <Image
                        source={{ uri: file.url }}
                        style={{
                          width: 50,
                          height: 50,
                          // borderRadius: 8,
                        }}
                        resizeMode="cover"
                      />
                    </View>
                    <Text style={styles.fileName}>{file.filename}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )

            /*
          :
{
  <SimpleIcon
    name={getFileIcon(file.type)}
    size={24}
    color={getFileIconColor(file.type)}
  />
}
          */
          }
        </View>

        <View style={styles.commentsSection}>
          <Text style={styles.commentsTitle}>Comments</Text>

          {comments.length === 0 && !commentsLoading ? (
            <View style={styles.noCommentsContainer}>
              <Text style={styles.noCommentsText}>No comments yet</Text>
            </View>
          ) : (
            <View style={styles.commentsList}>
              {comments.map((comment) => (
                <View key={comment._id}>
                  {renderComment({ item: comment })}
                </View>
              ))}

              {commentsLoading && (
                <ActivityIndicator
                  size="small"
                  color="#10B144"
                  style={styles.loadingMore}
                />
              )}

              {currentPage < totalPages && !commentsLoading && (
                <TouchableOpacity
                  style={styles.loadMoreButton}
                  onPress={handleLoadMoreComments}
                >
                  <Text style={styles.loadMoreText}>Load more comments</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {hasCommented ? (
        <View
          style={[
            styles.alreadyCommentedContainer,
            { paddingBottom: insets.bottom || 16 },
          ]}
        >
          <View style={styles.commentInputAvatar}>
            <Text style={styles.commentInputAvatarText}>U</Text>
          </View>
          <Text style={styles.alreadyCommentedText}>
            You have already commented on this discussion
          </Text>
        </View>
      ) : (
        <View
          style={[
            styles.commentInputContainer,
            { paddingBottom: insets.bottom || 16 },
          ]}
        >
          <View style={styles.commentInputAvatar}>
            <Text style={styles.commentInputAvatarText}>U</Text>
          </View>
          <TextInput
            style={styles.commentInput}
            placeholder="Write a comment..."
            placeholderTextColor="#999"
            value={commentText}
            onChangeText={setCommentText}
            multiline
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              !commentText.trim() && styles.sendButtonDisabled,
            ]}
            onPress={handleSendComment}
            disabled={!commentText.trim() || sendingComment}
          >
            {sendingComment ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <SimpleIcon name="send" size={20} color="#fff" />
            )}
          </TouchableOpacity>
        </View>
      )}

      <Modal
        visible={!!gradingComment}
        transparent
        animationType="fade"
        onRequestClose={closeGradeModal}
      >
        <View style={styles.gradeModalOverlay}>
          <View style={styles.gradeModalCard}>
            <Text style={styles.gradeModalTitle}>Give Marks</Text>
            <Text style={styles.gradeModalLabel}>
              Marks (total: {discussion?.totalMarks ?? 0})
            </Text>
            <TextInput
              style={styles.gradeModalInput}
              placeholder="Enter marks"
              placeholderTextColor="#999"
              keyboardType="numeric"
              value={marksInput}
              onChangeText={setMarksInput}
              editable={!gradingLoading}
            />
            {gradingError && (
              <Text style={styles.gradeModalError}>{gradingError}</Text>
            )}
            <View style={styles.gradeModalButtonRow}>
              <TouchableOpacity
                style={styles.gradeModalCancelButton}
                onPress={closeGradeModal}
                disabled={gradingLoading}
              >
                <Text style={styles.gradeModalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.gradeModalSaveButton}
                onPress={handleSubmitGrade}
                disabled={gradingLoading}
              >
                {gradingLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.gradeModalSaveText}>Save</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ── Settings Sheet (teacher) ── */}
      <AnimatedBottomSheet
        visible={showSettingsSheet}
        onClose={() => setShowSettingsSheet(false)}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={styles.sheetTitle}>Discussion Settings</Text>

          <TouchableOpacity
            style={styles.resubmissionRow}
            onPress={handleToggleResubmission}
            disabled={savingResubmission}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.checkbox,
                discussion?.allowResubmission && styles.checkboxChecked,
              ]}
            >
              {savingResubmission ? (
                <ActivityIndicator size="small" color="#3B82F6" />
              ) : (
                discussion?.allowResubmission && (
                  <SimpleIcon name="check" size={14} color="#fff" />
                )
              )}
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.resubmissionLabel}>Allow Resubmission</Text>
              <Text style={styles.resubmissionHint}>
                {discussion?.allowResubmission
                  ? "Students can resubmit their responses."
                  : "Resubmission disabled."}
              </Text>
            </View>
          </TouchableOpacity>

          <View style={styles.sheetDivider} />

          <Text style={styles.sheetSectionTitle}>
            Extend Due Date for Specific Students
          </Text>

          <TextInput
            style={styles.studentSearchInput}
            placeholder="Search student..."
            placeholderTextColor="#999"
            value={studentSearch}
            onChangeText={setStudentSearch}
          />

          {loadingStudents ? (
            <ActivityIndicator style={{ marginVertical: 16 }} color="#10B144" />
          ) : filteredCourseStudents.length === 0 ? (
            <Text style={styles.noStudentsText}>No students found.</Text>
          ) : (
            <View style={styles.studentListBox}>
              {filteredCourseStudents.map((s) => {
                const isSelected = selectedStudentIds.includes(s._id);
                return (
                  <TouchableOpacity
                    key={s._id}
                    style={styles.studentRow}
                    onPress={() => toggleStudentSelection(s._id)}
                  >
                    <View
                      style={[
                        styles.checkbox,
                        isSelected && styles.checkboxChecked,
                      ]}
                    >
                      {isSelected && (
                        <SimpleIcon name="check" size={14} color="#fff" />
                      )}
                    </View>
                    <View style={{ marginLeft: 12 }}>
                      <Text style={styles.studentName}>
                        {s.firstName} {s.middleName || ""} {s.lastName}
                      </Text>
                      <Text style={styles.studentEmail}>{s.email}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {selectedStudentIds.length > 0 && (
            <Text style={styles.selectedCountText}>
              {selectedStudentIds.length} student
              {selectedStudentIds.length > 1 ? "s" : ""} selected
            </Text>
          )}

          <Text style={styles.sheetLabel}>New Override Date & Time</Text>
          <View style={{ flexDirection: "row", gap: 10 }}>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowOverrideDatePicker(true)}
            >
              <Text style={styles.dateButtonText}>
                {overrideDate
                  ? overrideDate.toLocaleDateString("en-US")
                  : "Select date"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => {
                if (!overrideDate && !tempOverrideDate) {
                  Toast.show("Select a date first.", Toast.LONG);
                  return;
                }
                setShowOverrideTimePicker(true);
              }}
            >
              <Text style={styles.dateButtonText}>
                {overrideDate
                  ? overrideDate.toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "Select time"}
              </Text>
            </TouchableOpacity>
          </View>

          {showOverrideDatePicker && (
            <>
              {Platform.OS === "ios" && (
                <TouchableOpacity
                  style={styles.pickerDoneButton}
                  onPress={() => {
                    setShowOverrideDatePicker(false);
                    if (tempOverrideDate) {
                      setTimeout(() => setShowOverrideTimePicker(true), 200);
                    }
                  }}
                >
                  <Text style={styles.pickerDoneText}>Done</Text>
                </TouchableOpacity>
              )}
              <DateTimePicker
                value={tempOverrideDate || overrideDate || new Date()}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={(event, selectedDate) => {
                  if (Platform.OS === "android") {
                    setShowOverrideDatePicker(false);
                    if (event.type === "set" && selectedDate) {
                      setTempOverrideDate(selectedDate);
                      setTimeout(() => setShowOverrideTimePicker(true), 200);
                    }
                  } else if (selectedDate) {
                    setTempOverrideDate(selectedDate);
                    setOverrideDate(selectedDate);
                  }
                }}
              />
            </>
          )}

          {showOverrideTimePicker && (
            <>
              {Platform.OS === "ios" && (
                <TouchableOpacity
                  style={styles.pickerDoneButton}
                  onPress={() => {
                    setShowOverrideTimePicker(false);
                    if (tempOverrideDate) setOverrideDate(tempOverrideDate);
                  }}
                >
                  <Text style={styles.pickerDoneText}>Done</Text>
                </TouchableOpacity>
              )}
              <DateTimePicker
                value={tempOverrideDate || overrideDate || new Date()}
                mode="time"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={(event, selectedTime) => {
                  const base = tempOverrideDate || overrideDate || new Date();
                  if (Platform.OS === "android") {
                    setShowOverrideTimePicker(false);
                    if (event.type === "set" && selectedTime) {
                      const combined = new Date(base);
                      combined.setHours(selectedTime.getHours());
                      combined.setMinutes(selectedTime.getMinutes());
                      setOverrideDate(combined);
                    }
                  } else if (selectedTime) {
                    const combined = new Date(base);
                    combined.setHours(selectedTime.getHours());
                    combined.setMinutes(selectedTime.getMinutes());
                    setTempOverrideDate(combined);
                  }
                }}
              />
            </>
          )}

          <TouchableOpacity
            style={[
              styles.sheetSaveButton,
              savingOverride && { opacity: 0.7 },
            ]}
            onPress={handleSaveExtension}
            disabled={savingOverride}
          >
            {savingOverride ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.sheetSaveButtonText}>Save Extension</Text>
            )}
          </TouchableOpacity>

          {discussion?.studentDueDateOverrides &&
            discussion.studentDueDateOverrides.length > 0 && (
              <>
                <View style={styles.sheetDivider} />
                <Text style={styles.sheetSectionTitle}>
                  Existing Student Due Date Overrides
                </Text>
                {discussion.studentDueDateOverrides.map((override) => (
                  <View key={override._id} style={styles.overrideRow}>
                    <View>
                      <Text style={styles.studentName}>
                        {override.student?.firstName}{" "}
                        {override.student?.lastName}
                      </Text>
                      <Text style={styles.studentEmail}>
                        {override.student?.email}
                      </Text>
                    </View>
                    <View style={{ alignItems: "flex-end" }}>
                      <Text style={styles.overrideDateText}>
                        {new Date(
                          override.newDueDate.date
                        ).toLocaleDateString()}
                      </Text>
                      <Text style={styles.studentEmail}>
                        {override.newDueDate.time || "00:00"}
                      </Text>
                    </View>
                  </View>
                ))}
              </>
            )}
        </ScrollView>
      </AnimatedBottomSheet>

      {/* ── Edit Sheet (teacher) ── */}
      <AnimatedBottomSheet
        visible={showEditSheet}
        onClose={() => setShowEditSheet(false)}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={styles.sheetTitle}>Edit Discussion</Text>

          <Text style={styles.sheetLabel}>Topic</Text>
          <TextInput
            style={styles.sheetInput}
            value={editTopic}
            onChangeText={setEditTopic}
            placeholder="Discussion topic"
          />

          <Text style={styles.sheetLabel}>Description</Text>
          <TextInput
            style={[styles.sheetInput, { minHeight: 90, textAlignVertical: "top" }]}
            value={editDescription}
            onChangeText={setEditDescription}
            placeholder="Discussion description"
            multiline
          />

          <Text style={styles.sheetLabel}>Category</Text>
          <TouchableOpacity
            style={styles.sheetInput}
            onPress={() => setShowEditCategorySheet(true)}
          >
            <Text style={{ color: editCategoryId ? "#000" : "#999" }}>
              {editCategories.find((c) => c._id === editCategoryId)?.name ||
                "Select category"}
            </Text>
          </TouchableOpacity>

          <Text style={styles.sheetLabel}>Standard Due Date</Text>
          <View style={{ flexDirection: "row", gap: 10 }}>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowEditDatePicker(true)}
            >
              <Text style={styles.dateButtonText}>
                {editDueDate
                  ? editDueDate.toLocaleDateString("en-US")
                  : "Select date"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => {
                if (!editDueDate && !tempEditDate) {
                  Toast.show("Select a date first.", Toast.LONG);
                  return;
                }
                setShowEditTimePicker(true);
              }}
            >
              <Text style={styles.dateButtonText}>
                {editDueDate
                  ? editDueDate.toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "Select time"}
              </Text>
            </TouchableOpacity>
          </View>

          {showEditDatePicker && (
            <>
              {Platform.OS === "ios" && (
                <TouchableOpacity
                  style={styles.pickerDoneButton}
                  onPress={() => {
                    setShowEditDatePicker(false);
                    if (tempEditDate) {
                      setTimeout(() => setShowEditTimePicker(true), 200);
                    }
                  }}
                >
                  <Text style={styles.pickerDoneText}>Done</Text>
                </TouchableOpacity>
              )}
              <DateTimePicker
                value={tempEditDate || editDueDate || new Date()}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={(event, selectedDate) => {
                  if (Platform.OS === "android") {
                    setShowEditDatePicker(false);
                    if (event.type === "set" && selectedDate) {
                      setTempEditDate(selectedDate);
                      setTimeout(() => setShowEditTimePicker(true), 200);
                    }
                  } else if (selectedDate) {
                    setTempEditDate(selectedDate);
                    setEditDueDate(selectedDate);
                  }
                }}
              />
            </>
          )}

          {showEditTimePicker && (
            <>
              {Platform.OS === "ios" && (
                <TouchableOpacity
                  style={styles.pickerDoneButton}
                  onPress={() => {
                    setShowEditTimePicker(false);
                    if (tempEditDate) setEditDueDate(tempEditDate);
                  }}
                >
                  <Text style={styles.pickerDoneText}>Done</Text>
                </TouchableOpacity>
              )}
              <DateTimePicker
                value={tempEditDate || editDueDate || new Date()}
                mode="time"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={(event, selectedTime) => {
                  const base = tempEditDate || editDueDate || new Date();
                  if (Platform.OS === "android") {
                    setShowEditTimePicker(false);
                    if (event.type === "set" && selectedTime) {
                      const combined = new Date(base);
                      combined.setHours(selectedTime.getHours());
                      combined.setMinutes(selectedTime.getMinutes());
                      setEditDueDate(combined);
                    }
                  } else if (selectedTime) {
                    const combined = new Date(base);
                    combined.setHours(selectedTime.getHours());
                    combined.setMinutes(selectedTime.getMinutes());
                    setTempEditDate(combined);
                  }
                }}
              />
            </>
          )}

          <TouchableOpacity
            style={[styles.sheetSaveButton, savingEdit && { opacity: 0.7 }]}
            onPress={handleSaveEdit}
            disabled={savingEdit}
          >
            {savingEdit ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.sheetSaveButtonText}>Save Changes</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </AnimatedBottomSheet>

      {/* ── Edit: Category Picker Sheet ── */}
      <AnimatedBottomSheet
        visible={showEditCategorySheet}
        onClose={() => setShowEditCategorySheet(false)}
      >
        <Text style={styles.sheetTitle}>Select Category</Text>
        <ScrollView showsVerticalScrollIndicator={false}>
          {editCategories.length === 0 ? (
            <Text style={styles.noStudentsText}>No categories available</Text>
          ) : (
            editCategories.map((c) => (
              <TouchableOpacity
                key={c._id}
                style={styles.categoryOption}
                onPress={() => {
                  setEditCategoryId(c._id);
                  setShowEditCategorySheet(false);
                }}
              >
                <Text style={styles.studentName}>{c.name}</Text>
                {editCategoryId === c._id && (
                  <SimpleIcon name="check" size={16} color="#10B144" />
                )}
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </AnimatedBottomSheet>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  errorText: {
    fontSize: 16,
    color: "#666",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerActionButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#f3f4f6",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  backText: {
    fontSize: 16,
    color: "#333",
    marginLeft: 8,
    fontWeight: "500",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  discussionBanner: {
    backgroundColor: "#10B144",
    paddingVertical: 10,
    paddingHorizontal: 24,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
  },
  discussionBannerText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  infoCard: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  infoRowSplit: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16,
  },
  infoColumn: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: "#666",
    marginLeft: 6,
    fontWeight: "600",
  },
  infoValue: {
    fontSize: 14,
    color: "#333",
    marginLeft: 6,
  },
  discussionContent: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  discussionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#111",
    marginBottom: 8,
  },
  discussionDescription: {
    fontSize: 16,
    color: "#666",
    lineHeight: 24,
    marginBottom: 16,
  },
  filesSection: {
    marginTop: 8,
  },
  fileItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  fileIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  fileName: {
    fontSize: 14,
    color: "#3b82f6",
    fontWeight: "500",
    flex: 1,
  },
  commentsSection: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    minHeight: 200,
  },
  commentsTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111",
    marginBottom: 16,
  },
  noCommentsContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  noCommentsText: {
    fontSize: 16,
    color: "#999",
  },
  commentsList: {
    gap: 16,
  },
  commentItem: {
    flexDirection: "row",
    marginBottom: 16,
  },
  commentAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#e0e0e0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#666",
  },
  commentContent: {
    flex: 1,
  },
  commentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  commentAuthor: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111",
    marginBottom: 4,
  },
  commentText: {
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
    marginBottom: 4,
  },
  commentDate: {
    fontSize: 12,
    color: "#999",
  },
  commentActions: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    gap: 16,
  },
  actionText: {
    fontSize: 13,
    color: "#3b82f6",
    fontWeight: "500",
  },
  notGradedText: {
    fontSize: 13,
    color: "#999",
  },
  giveMarksText: {
    fontSize: 13,
    color: "#3b82f6",
    fontWeight: "600",
  },
  gradeModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  gradeModalCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    width: "100%",
    maxWidth: 380,
  },
  gradeModalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111",
    marginBottom: 16,
  },
  gradeModalLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#333",
    marginBottom: 6,
  },
  gradeModalInput: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#333",
  },
  gradeModalError: {
    fontSize: 12,
    color: "#ef4444",
    marginTop: 6,
  },
  gradeModalButtonRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
  },
  gradeModalCancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
  },
  gradeModalCancelText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#6b7280",
  },
  gradeModalSaveButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "#10B144",
    alignItems: "center",
  },
  gradeModalSaveText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#fff",
  },
  loadingMore: {
    marginVertical: 16,
  },
  loadMoreButton: {
    alignSelf: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginTop: 8,
  },
  loadMoreText: {
    fontSize: 14,
    color: "#10B144",
    fontWeight: "600",
  },
  replyInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    gap: 8,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    padding: 8,
  },
  replyInputAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#e0e0e0",
    justifyContent: "center",
    alignItems: "center",
  },
  replyInputAvatarText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#666",
  },
  replyInput: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    fontSize: 13,
    color: "#333",
    maxHeight: 80,
  },
  replyButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#10B144",
    justifyContent: "center",
    alignItems: "center",
  },
  replyButtonDisabled: {
    backgroundColor: "#ccc",
  },
  cancelButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#fee",
    justifyContent: "center",
    alignItems: "center",
  },
  repliesContainer: {
    marginTop: 12,
    marginLeft: 12,
    paddingLeft: 12,
    borderLeftWidth: 2,
    borderLeftColor: "#e0e0e0",
  },
  repliesLoading: {
    marginVertical: 8,
  },
  replyItem: {
    flexDirection: "row",
    marginBottom: 12,
  },
  replyAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#e0e0e0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  replyAvatarImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  replyAvatarText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  replyContent: {
    flex: 1,
  },
  replyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 2,
  },
  replyAuthor: {
    fontSize: 13,
    fontWeight: "600",
    color: "#111",
  },
  replyDate: {
    fontSize: 11,
    color: "#999",
  },
  replyText: {
    fontSize: 13,
    color: "#333",
    lineHeight: 18,
  },
  alreadyCommentedContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    gap: 12,
  },
  alreadyCommentedText: {
    flex: 1,
    fontSize: 14,
    color: "#666",
  },
  commentInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    gap: 12,
  },
  commentInputAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#e0e0e0",
    justifyContent: "center",
    alignItems: "center",
  },
  commentInputAvatarText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
  },
  commentInput: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    color: "#333",
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#10B144",
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonDisabled: {
    backgroundColor: "#ccc",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 16,
  },
  sheetSectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 10,
  },
  sheetLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 6,
    marginTop: 12,
  },
  sheetDivider: {
    height: 1,
    backgroundColor: "#e5e7eb",
    marginVertical: 16,
  },
  sheetInput: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#111827",
  },
  sheetSaveButton: {
    backgroundColor: "#10B144",
    borderRadius: 8,
    paddingVertical: 13,
    alignItems: "center",
    marginTop: 16,
  },
  sheetSaveButtonText: { color: "#fff", fontSize: 15, fontWeight: "700" },
  resubmissionRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    padding: 14,
  },
  resubmissionLabel: { fontSize: 14, fontWeight: "600", color: "#111827" },
  resubmissionHint: { fontSize: 12, color: "#6b7280", marginTop: 2 },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: "#3B82F6",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  checkboxChecked: { backgroundColor: "#3B82F6", borderColor: "#3B82F6" },
  studentSearchInput: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 14,
    marginBottom: 10,
  },
  studentListBox: {
    maxHeight: 220,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
  },
  studentRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  studentName: { fontSize: 14, fontWeight: "600", color: "#111827" },
  studentEmail: { fontSize: 12, color: "#6b7280" },
  noStudentsText: {
    fontSize: 13,
    color: "#6b7280",
    textAlign: "center",
    paddingVertical: 12,
  },
  selectedCountText: {
    fontSize: 12,
    color: "#3B82F6",
    fontWeight: "600",
    marginTop: 8,
  },
  dateButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: "center",
  },
  dateButtonText: { fontSize: 13, color: "#111827" },
  pickerDoneButton: {
    alignSelf: "flex-end",
    marginTop: 8,
  },
  pickerDoneText: { color: "#007AFF", fontSize: 16, fontWeight: "600" },
  overrideRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    padding: 10,
    marginBottom: 8,
  },
  overrideDateText: { fontSize: 13, fontWeight: "600", color: "#111827" },
  categoryOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
});

export default DiscussionStudent;
