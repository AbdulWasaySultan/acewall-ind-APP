// import React from "react";
// import {
//   View,
//   Text,
//   Modal,
//   TouchableOpacity,
//   ScrollView,
//   ActivityIndicator,
//   Platform,
// } from "react-native";
// import SimpleIcon from "../SimpleIcon";
// import { Student, Semester, Quarter, Assessment } from "../../types/course";

// interface GradebookModalProps {
//   visible: boolean;
//   onClose: () => void;
//   gradebookLoading: boolean;
//   gradebookData: any;
//   gradebookError: string | null;
//   expandedStudents: Set<string>;
//   expandedSemesters: Set<string>;
//   expandedQuarters: Set<string>;
//   onToggleStudent: (studentId: string) => void;
//   onToggleSemester: (semesterId: string) => void;
//   onToggleQuarter: (quarterId: string) => void;
//   styles: any;
// }

// const GradebookModal: React.FC<GradebookModalProps> = ({
//   visible,
//   onClose,
//   gradebookLoading,
//   gradebookData,
//   gradebookError,
//   expandedStudents,
//   expandedSemesters,
//   expandedQuarters,
//   onToggleStudent,
//   onToggleSemester,
//   onToggleQuarter,
//   styles,
// }) => {
//   return (
//     <Modal
//       visible={visible}
//       transparent={false}
//       animationType="slide"
//       onRequestClose={onClose}
//     >
//       <View style={styles.gradebookModalContainer}>
//         <View style={styles.gradebookModalHeader}>
//           <Text style={styles.gradebookModalTitle}>Gradebook</Text>
//           <TouchableOpacity onPress={onClose}>
//             <SimpleIcon name="close" size={32} color="#333" />
//           </TouchableOpacity>
//         </View>
//         {gradebookLoading ? (
//           <ActivityIndicator
//             size="large"
//             color="#10B144"
//             style={styles.gradebookLoadingContainer}
//           />
//         ) : gradebookError ? (
//           <Text style={styles.gradebookErrorText}>{gradebookError}</Text>
//         ) : gradebookData ? (
//           <ScrollView contentContainerStyle={styles.gradebookContentContainer}>
//             <View style={styles.gradebookCard}>
//               {/* Table Header */}
//               <View style={styles.gradebookTableHeader}>
//                 <Text
//                   style={[styles.gradebookHeaderText, { flex: 2, textAlign: "left" }]}
//                 >
//                   Student
//                 </Text>
//                 <Text
//                   style={[styles.gradebookHeaderText, { flex: 1, textAlign: "center" }]}
//                 >
//                   Final Grade
//                 </Text>
//                 <Text
//                   style={[styles.gradebookHeaderText, { flex: 1, textAlign: "center" }]}
//                 >
//                   Letter Grade
//                 </Text>
//                 <Text
//                   style={[styles.gradebookHeaderText, { flex: 1, textAlign: "right" }]}
//                 >
//                   GPA
//                 </Text>
//               </View>

//               {/* Student Rows */}
//               {gradebookData.gradebook && gradebookData.gradebook.length > 0 ? (
//                 gradebookData.gradebook.map((student: Student) => (
//                   <View key={student.studentId}>
//                     <TouchableOpacity
//                       onPress={() => onToggleStudent(student.studentId)}
//                       style={styles.gradebookStudentRow}
//                     >
//                       <View style={styles.gradebookStudentInfo}>
//                         <Text style={styles.gradebookExpandIcon}>
//                           {expandedStudents.has(student.studentId) ? "▼" : "▶"}
//                         </Text>
//                         <Text style={styles.gradebookStudentName}>
//                           {student.studentName || "Unknown Student"}
//                         </Text>
//                       </View>
//                       <Text style={styles.gradebookGradeText}>
//                         {student.finalGrade ? `${student.finalGrade}%` : "---"}
//                       </Text>
//                       <View style={styles.gradebookLetterGradeContainer}>
//                         <View style={styles.gradebookLetterGradeBadge}>
//                           <Text style={styles.gradebookLetterGradeText}>
//                             {student.assessments?.length > 0
//                               ? student.letterGrade
//                               : "---"}
//                           </Text>
//                         </View>
//                       </View>
//                       <Text style={styles.gradebookGpaText}>
//                         {student.assessments?.length > 0 ? student.gpa : "---"}
//                       </Text>
//                     </TouchableOpacity>

//                     {expandedStudents.has(student.studentId) && (
//                       <View style={styles.gradebookStudentExpanded}>
//                         <Text style={styles.gradebookPerformanceTitle}>
//                           Academic Performance Breakdown
//                         </Text>

//                         {/* Semesters */}
//                         {student.hasSemesterStructure ? (
//                           student.semesters && student.semesters.length > 0 ? (
//                             student.semesters.map((semester: Semester) => (
//                               <View
//                                 key={semester.semesterId}
//                                 style={styles.gradebookSemesterItem}
//                               >
//                                 <TouchableOpacity
//                                   onPress={() =>
//                                     onToggleSemester(semester.semesterId)
//                                   }
//                                   style={styles.gradebookSemesterButton}
//                                 >
//                                   <Text style={styles.gradebookExpandIcon}>
//                                     {expandedSemesters.has(semester.semesterId)
//                                       ? "▼"
//                                       : "▶"}
//                                   </Text>
//                                   <Text style={styles.gradebookSemesterTitle}>
//                                     {semester.semesterTitle}
//                                   </Text>
//                                 </TouchableOpacity>

//                                 {expandedSemesters.has(semester.semesterId) && (
//                                   <View style={styles.gradebookSemesterExpanded}>
//                                     {semester.quarters &&
//                                     semester.quarters.length > 0 ? (
//                                       semester.quarters.map(
//                                         (quarter: Quarter) => (
//                                           <View
//                                             key={quarter.quarterId}
//                                             style={styles.gradebookSemesterItem}
//                                           >
//                                             <TouchableOpacity
//                                               onPress={() =>
//                                                 onToggleQuarter(
//                                                   quarter.quarterId
//                                                 )
//                                               }
//                                               style={styles.gradebookQuarterButton}
//                                             >
//                                               <Text style={styles.gradebookExpandIcon}>
//                                                 {expandedQuarters.has(
//                                                   quarter.quarterId
//                                                 )
//                                                   ? "▼"
//                                                   : "▶"}
//                                               </Text>
//                                               <Text style={styles.gradebookQuarterTitle}>
//                                                 {quarter.quarterTitle}
//                                               </Text>
//                                               <Text style={styles.gradebookQuarterGrade}>
//                                                 {quarter.grade}%
//                                               </Text>
//                                               <View style={styles.gradebookQuarterBadge}>
//                                                 <Text style={styles.gradebookQuarterBadgeText}>
//                                                   {quarter.letterGrade}
//                                                 </Text>
//                                               </View>
//                                               <Text style={styles.gradebookQuarterGpa}>
//                                                 GPA: {quarter.gpa}
//                                               </Text>
//                                             </TouchableOpacity>

//                                             {expandedQuarters.has(
//                                               quarter.quarterId
//                                             ) && (
//                                               <View style={styles.gradebookQuarterExpanded}>
//                                                 {/* Assessment Headers */}
//                                                 <View style={styles.gradebookAssessmentHeader}>
//                                                   <Text
//                                                     style={[styles.gradebookAssessmentHeaderText, { flex: 2 }]}
//                                                   >
//                                                     Assessment
//                                                   </Text>
//                                                   <Text
//                                                     style={[styles.gradebookAssessmentHeaderText, { flex: 1.5 }]}
//                                                   >
//                                                     Category
//                                                   </Text>
//                                                   <Text
//                                                     style={[styles.gradebookAssessmentHeaderText, { flex: 1, textAlign: "center" }]}
//                                                   >
//                                                     Score
//                                                   </Text>
//                                                   <Text
//                                                     style={[styles.gradebookAssessmentHeaderText, { flex: 1, textAlign: "center" }]}
//                                                   >
//                                                     %
//                                                   </Text>
//                                                 </View>

//                                                 {/* Assessment Rows */}
//  {quarter.assessments &&
//                                                 quarter.assessments.length >
//                                                   0 ? (
//                                                   quarter.assessments.map(
//                                                     (
//                                                       assessment: Assessment
//                                                     ) => (
//                                                       <View
//                                                         key={
//                                                           assessment.assessmentId
//                                                         }
//                                                         style={styles.gradebookAssessmentRow}
//                                                       >
//                                                         <Text
//                                                           style={[styles.gradebookAssessmentText, { flex: 2 }]}
//                                                           numberOfLines={1}
//                                                         >
//                                                           {
//                                                             assessment.assessmentTitle
//                                                           }
//                                                         </Text>
//                                                         <Text
//                                                           style={[styles.gradebookAssessmentText, { flex: 1.5 }]}
//                                                           numberOfLines={1}
//                                                         >
//                                                           {assessment.category}
//                                                         </Text>
//                                                         <Text
//                                                           style={[styles.gradebookAssessmentText, { flex: 1, textAlign: "center" }]}
//                                                         >
//                                                           {
//                                                             assessment.studentPoints
//                                                           }
//                                                           /
//                                                           {assessment.maxPoints}
//                                                         </Text>
//                                                         <Text
//                                                           style={[styles.gradebookAssessmentText, { flex: 1, textAlign: "right", fontWeight: "600" }]}
//                                                         >
//                                                           {assessment.maxPoints >
//                                                           0
//                                                             ? (
//                                                                 (assessment.studentPoints /
//                                                                   assessment.maxPoints) *
//                                                                 100
//                                                               ).toFixed(1)
//                                                             : 0}
//                                                           %
//                                                         </Text>
//                                                       </View>
//                                                     )
//                                                   )
//                                                 ) : (
//                                                   <Text style={styles.gradebookNoDataText}>
//                                                     No assessments found.
//                                                   </Text>
//                                                 )}
//                                               </View>
//                                             )}
//                                           </View>
//                                         )
//                                       )
//                                     ) : (
//                                       <Text style={styles.gradebookNoDataText}>
//                                         No quarters found.
//                                       </Text>
//                                     )}
//                                   </View>
//                                 )}
//                               </View>
//                             ))
//                           ) : (
//                             <Text style={styles.gradebookNoSemestersText}>
//                               No semesters found.
//                             </Text>
//                           )
//                         ) : (
//                           <View style={styles.gradebookDirectAssessments}>
//                             {/* Assessment Headers */}
//                             <View style={styles.gradebookAssessmentHeader}>
//                               <Text
//                                 style={[styles.gradebookAssessmentHeaderText, { flex: 2 }]}
//                               >
//                                 Assessment
//                               </Text>
//                               <Text
//                                 style={[styles.gradebookAssessmentHeaderText, { flex: 1.5 }]}
//                               >
//                                 Category
//                               </Text>
//                               <Text
//                                 style={[styles.gradebookAssessmentHeaderText, { flex: 1, textAlign: "center" }]}
//                               >
//                                 Score
//                               </Text>
//                               <Text
//                                 style={[styles.gradebookAssessmentHeaderText, { flex: 1, textAlign: "center" }]}
//                               >
//                                 %
//                               </Text>
//                             </View>

//                             {/* Assessment Rows */}
//                             {student.assessments &&
//                             student.assessments.length > 0 ? (
//                               student.assessments.map(
//                                 (assessment: Assessment) => (
//                                   <View
//                                     key={assessment.assessmentId}
//                                     style={styles.gradebookAssessmentRow}
//                                   >
//                                     <Text
//                                       style={[styles.gradebookAssessmentText, { flex: 2 }]}
//                                       numberOfLines={1}
//                                     >
//                                       {assessment.assessmentTitle}
//                                     </Text>
//                                     <Text
//                                       style={[styles.gradebookAssessmentText, { flex: 1.5 }]}
//                                       numberOfLines={1}
//                                     >
//                                       {assessment.category}
//                                     </Text>
//                                     <Text
//                                       style={[styles.gradebookAssessmentText, { flex: 1, textAlign: "center" }]}
//                                     >
//                                       {assessment.studentPoints}/
//                                       {assessment.maxPoints}
//                                     </Text>
//                                     <Text
//                                       style={[styles.gradebookAssessmentText, { flex: 1, textAlign: "right", fontWeight: "600" }]}
//                                     >
//                                       {assessment.maxPoints > 0
//                                         ? (
//                                             (assessment.studentPoints /
//                                               assessment.maxPoints) *
//                                             100
//                                           ).toFixed(1)
//                                         : 0}
//                                       %
//                                     </Text>
//                                   </View>
//                                 )
//                               )
//                             ) : (
//                               <Text style={styles.gradebookNoDataText}>
//                                 No assessments found.
//                               </Text>
//                             )}
//                           </View>
//                         )}
//                       </View>
//                     )}
//                   </View>
//                 ))
//               ) : (
//                 <View style={{ paddingVertical: 20, alignItems: "center" }}>
//                   <Text
//                     style={{
//                       color: "#6b7280",
//                       fontSize: 14,
//                       textAlign: "center",
//                     }}
//                   >
//                     No students found in this course.
//                   </Text>
//                 </View>
//               )}
//             </View>
//           </ScrollView>
//         ) : (
//           <Text
//             style={{
//               textAlign: "center",
//               color: "#7b8794",
//               marginVertical: 40,
//             }}
//           >
//             No gradebook data found.
//           </Text>
//         )}
//       </View>
//     </Modal>
//   );
// };

// export default GradebookModal;

// components/modals/GradebookModal.tsx
import React from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Platform,
  StyleSheet,
} from "react-native";
import SimpleIcon from "../SimpleIcon";
import { Student, Semester, Quarter, Assessment } from "../../types/course";

interface GradebookModalProps {
  visible: boolean;
  onClose: () => void;
  gradebookLoading: boolean;
  gradebookData: any;
  gradebookError: string | null;
  expandedStudents: Set<string>;
  expandedSemesters: Set<string>;
  expandedQuarters: Set<string>;
  onToggleStudent: (studentId: string) => void;
  onToggleSemester: (semesterId: string) => void;
  onToggleQuarter: (quarterId: string) => void;
}

const GradebookModal: React.FC<GradebookModalProps> = ({
  visible,
  onClose,
  gradebookLoading,
  gradebookData,
  gradebookError,
  expandedStudents,
  expandedSemesters,
  expandedQuarters,
  onToggleStudent,
  onToggleSemester,
  onToggleQuarter,
}) => {
  const courseType: "semester-based" | "chapter-based" =
    gradebookData?.courseType || "semester-based";
  const gradingSystem: "normalGrading" | "StandardGrading" =
    gradebookData?.gradingSystem || "normalGrading";
  const isNormalGrading = gradingSystem === "normalGrading";

  const hasGradeData = (student: Student) =>
    courseType === "semester-based"
      ? (student.semesters?.length || 0) > 0
      : (student.chapters?.length || 0) > 0;

  const renderAssessmentTable = (assessments: Assessment[]) => (
    <>
      <View style={styles.assessmentHeader}>
        <Text style={[styles.assessmentHeaderText, { flex: 2 }]}>
          Assessment
        </Text>
        <Text style={[styles.assessmentHeaderText, { flex: 1.5 }]}>
          Category
        </Text>
        <Text
          style={[
            styles.assessmentHeaderText,
            { flex: 1, textAlign: "center" },
          ]}
        >
          Score
        </Text>
        <Text
          style={[
            styles.assessmentHeaderText,
            { flex: 1, textAlign: "center" },
          ]}
        >
          %
        </Text>
      </View>

      {assessments?.length > 0 ? (
        assessments.map((assessment) => (
          <View key={assessment.assessmentId} style={styles.assessmentRow}>
            <Text
              style={[styles.assessmentText, { flex: 2 }]}
              numberOfLines={1}
            >
              {assessment.assessmentTitle}
            </Text>
            <Text
              style={[styles.assessmentText, { flex: 1.5 }]}
              numberOfLines={1}
            >
              {assessment.category}
            </Text>
            <Text
              style={[styles.assessmentText, { flex: 1, textAlign: "center" }]}
            >
              {assessment.studentPoints}/{assessment.maxPoints}
            </Text>
            <Text
              style={[
                styles.assessmentText,
                { flex: 1, textAlign: "right", fontWeight: "600" },
              ]}
            >
              {assessment.maxPoints > 0
                ? (
                    (assessment.studentPoints / assessment.maxPoints) *
                    100
                  ).toFixed(1)
                : 0}
              %
            </Text>
          </View>
        ))
      ) : (
        <Text style={styles.noDataText}>No assessments found.</Text>
      )}
    </>
  );

  return (
    <Modal
      visible={visible}
      transparent={false}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Gradebook</Text>
          <TouchableOpacity onPress={onClose}>
            <SimpleIcon name="close" size={32} color="#333" />
          </TouchableOpacity>
        </View>
        {gradebookLoading ? (
          <ActivityIndicator
            size="large"
            color="#10B144"
            style={styles.loader}
          />
        ) : gradebookError ? (
          <Text style={styles.errorText}>{gradebookError}</Text>
        ) : gradebookData ? (
          <ScrollView contentContainerStyle={styles.contentContainer}>
            <View style={styles.card}>
              <View style={styles.tableHeader}>
                <Text
                  style={[styles.headerCell, { flex: 2, textAlign: "left" }]}
                >
                  Student
                </Text>
                <Text
                  style={[styles.headerCell, { flex: 1, textAlign: "center" }]}
                >
                  Final Grade
                </Text>
                <Text
                  style={[styles.headerCell, { flex: 1, textAlign: "center" }]}
                >
                  {isNormalGrading ? "Letter" : "Points"}
                </Text>
                <Text
                  style={[styles.headerCell, { flex: 1, textAlign: "right" }]}
                >
                  {isNormalGrading ? "GPA" : "Remarks"}
                </Text>
              </View>

              {gradebookData.gradebook?.length > 0 ? (
                gradebookData.gradebook.map((student: Student) => (
                  <View key={student.studentId}>
                    <TouchableOpacity
                      onPress={() => onToggleStudent(student.studentId)}
                      style={styles.studentRow}
                    >
                      <View style={styles.studentInfo}>
                        <Text
                          style={styles.expandIcon}
                          numberOfLines={2}
                          ellipsizeMode="tail"
                        >
                          {expandedStudents.has(student.studentId) ? "▼" : "▶"}
                        </Text>
                        <Text style={styles.studentName}>
                          {student.studentName || "Unknown Student"}
                        </Text>
                      </View>
                      <Text style={styles.gradeText}>
                        {hasGradeData(student)
                          ? `${
                              isNormalGrading
                                ? student.finalGrade
                                : student.standardGrade?.finalGrade
                            }%`
                          : "---"}
                      </Text>
                      <View style={styles.letterGradeContainer}>
                        <View style={styles.letterGradeBadge}>
                          <Text style={styles.letterGradeText}>
                            {hasGradeData(student)
                              ? isNormalGrading
                                ? student.letterGrade
                                : student.standardGrade?.points
                              : "---"}
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.gpaText}>
                        {hasGradeData(student)
                          ? isNormalGrading
                            ? student.gpa
                            : student.standardGrade?.remarks
                          : "---"}
                      </Text>
                    </TouchableOpacity>

                    {expandedStudents.has(student.studentId) && (
                      <View style={styles.expandedContent}>
                        <Text style={styles.performanceTitle}>
                          Academic Performance Breakdown
                        </Text>

                        {courseType === "semester-based" ? (
                          student.semesters && student.semesters.length > 0 ? (
                            student.semesters.map((semester: Semester) => (
                              <View
                                key={semester.semesterId}
                                style={styles.semesterItem}
                              >
                                <TouchableOpacity
                                  onPress={() =>
                                    onToggleSemester(semester.semesterId)
                                  }
                                  style={styles.semesterButton}
                                >
                                  <Text style={styles.expandIcon}>
                                    {expandedSemesters.has(semester.semesterId)
                                      ? "▼"
                                      : "▶"}
                                  </Text>
                                  <Text style={styles.semesterTitle}>
                                    {semester.semesterTitle}
                                  </Text>
                                  {isNormalGrading ? (
                                    <>
                                      <Text style={styles.quarterGrade}>
                                        {semester.grade}%
                                      </Text>
                                      <View style={styles.quarterBadge}>
                                        <Text style={styles.quarterBadgeText}>
                                          {semester.letterGrade}
                                        </Text>
                                      </View>
                                    </>
                                  ) : (
                                    <>
                                      <Text style={styles.quarterGrade}>
                                        {semester.standardGrade?.grade}%
                                      </Text>
                                      <View style={styles.quarterBadge}>
                                        <Text style={styles.quarterBadgeText}>
                                          Pts: {semester.standardGrade?.points}
                                        </Text>
                                      </View>
                                    </>
                                  )}
                                </TouchableOpacity>

                                {expandedSemesters.has(semester.semesterId) && (
                                  <View style={styles.semesterExpanded}>
                                    {semester.quarters?.length > 0 ? (
                                      semester.quarters.map(
                                        (quarter: Quarter) => (
                                          <View
                                            key={quarter.quarterId}
                                            style={styles.quarterItem}
                                          >
                                            <TouchableOpacity
                                              onPress={() =>
                                                onToggleQuarter(
                                                  quarter.quarterId
                                                )
                                              }
                                              style={styles.quarterButton}
                                            >
                                              <Text style={styles.expandIcon}>
                                                {expandedQuarters.has(
                                                  quarter.quarterId
                                                )
                                                  ? "▼"
                                                  : "▶"}
                                              </Text>
                                              <Text style={styles.quarterTitle}>
                                                {quarter.quarterTitle}
                                              </Text>
                                              {isNormalGrading ? (
                                                <>
                                                  <Text
                                                    style={styles.quarterGrade}
                                                  >
                                                    {quarter.grade}%
                                                  </Text>
                                                  <View
                                                    style={styles.quarterBadge}
                                                  >
                                                    <Text
                                                      style={
                                                        styles.quarterBadgeText
                                                      }
                                                    >
                                                      {quarter.letterGrade}
                                                    </Text>
                                                  </View>
                                                  <Text
                                                    style={styles.quarterGpa}
                                                  >
                                                    GPA: {quarter.gpa}
                                                  </Text>
                                                </>
                                              ) : (
                                                <>
                                                  <Text
                                                    style={styles.quarterGrade}
                                                  >
                                                    {quarter.standardGrade?.grade}%
                                                  </Text>
                                                  <View
                                                    style={styles.quarterBadge}
                                                  >
                                                    <Text
                                                      style={
                                                        styles.quarterBadgeText
                                                      }
                                                    >
                                                      Pts:{" "}
                                                      {
                                                        quarter.standardGrade
                                                          ?.points
                                                      }
                                                    </Text>
                                                  </View>
                                                  <Text
                                                    style={styles.quarterGpa}
                                                  >
                                                    {quarter.standardGrade?.remarks}
                                                  </Text>
                                                </>
                                              )}
                                            </TouchableOpacity>

                                            {expandedQuarters.has(
                                              quarter.quarterId
                                            ) && (
                                              <View
                                                style={styles.quarterExpanded}
                                              >
                                                {renderAssessmentTable(
                                                  quarter.assessments
                                                )}
                                              </View>
                                            )}
                                          </View>
                                        )
                                      )
                                    ) : (
                                      <Text style={styles.noDataText}>
                                        No quarters found.
                                      </Text>
                                    )}
                                  </View>
                                )}
                              </View>
                            ))
                          ) : (
                            <Text style={styles.noDataText}>
                              No semesters found.
                            </Text>
                          )
                        ) : (
                          <View style={styles.directAssessments}>
                            {hasGradeData(student) && (
                              <View style={styles.chapterSummaryRow}>
                                {isNormalGrading ? (
                                  <>
                                    <Text style={styles.chapterSummaryText}>
                                      Overall: {student.finalGrade}%
                                    </Text>
                                    <Text style={styles.chapterSummaryText}>
                                      Letter: {student.letterGrade}
                                    </Text>
                                    <Text style={styles.chapterSummaryText}>
                                      GPA: {student.gpa}
                                    </Text>
                                  </>
                                ) : (
                                  <>
                                    <Text style={styles.chapterSummaryText}>
                                      Overall: {student.standardGrade?.finalGrade}%
                                    </Text>
                                    <Text style={styles.chapterSummaryText}>
                                      Points: {student.standardGrade?.points}
                                    </Text>
                                    <Text style={styles.chapterSummaryText}>
                                      {student.standardGrade?.remarks}
                                    </Text>
                                  </>
                                )}
                              </View>
                            )}
                            {renderAssessmentTable(student.chapters || [])}
                          </View>
                        )}
                      </View>
                    )}
                  </View>
                ))
              ) : (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>
                    No students found in this course.
                  </Text>
                </View>
              )}
            </View>
          </ScrollView>
        ) : (
          <Text style={styles.noDataText}>No gradebook data found.</Text>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingTop: Platform.OS === "ios" ? 40 : 16,
  },
  headerTitle: { fontSize: 28, fontWeight: "bold", color: "#1E293B" },
  loader: { marginVertical: 40 },
  errorText: { color: "red", textAlign: "center", marginVertical: 20 },
  contentContainer: { padding: 16 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#eee",
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  tableHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderColor: "#eee",
    paddingBottom: 12,
    marginBottom: 12,
  },
  headerCell: { fontWeight: "bold", fontSize: 16, color: "#6b7280" },
  studentRow: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
  },
  studentInfo: {
    flex: 2,
    flexDirection: "row",
    alignItems: "center",
    // backgroundColor: "pink",
  },
  expandIcon: {
    fontSize: 16,
    marginRight: 8,
    color: "#6b7280",
    fontWeight: "bold",
  },
  studentName: { flex: 1, fontSize: 16, fontWeight: "bold", color: "#1E293B" },
  gradeText: { flex: 1, textAlign: "center", fontSize: 16, color: "#1E293B" },
  letterGradeContainer: { flex: 1, alignItems: "center" },
  letterGradeBadge: {
    backgroundColor: "#dbeafe",
    borderColor: "#93c5fd",
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  letterGradeText: { color: "#1E293B", fontWeight: "bold", fontSize: 14 },
  gpaText: { flex: 1, textAlign: "right", fontSize: 16, color: "#1E293B" },
  expandedContent: {
    // backgroundColor: "#000",
    paddingVertical: 12,
    borderLeftWidth: 2,
    borderLeftColor: "#e5e7eb",
    justifyContent: "center",
  },
  performanceTitle: {
    color: "#6b7280",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 12,
    paddingLeft: 12,
  },
  semesterItem: { marginBottom: 8 },
  semesterButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#fff",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  semesterTitle: { flex: 1, fontSize: 14, fontWeight: "600", color: "#374151" },
  semesterExpanded: {
    marginTop: 8,
    marginLeft: 12,
    paddingLeft: 12,
    borderLeftWidth: 2,
    borderLeftColor: "#d1d5db",
  },
  quarterItem: { marginBottom: 8 },
  quarterButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#f3f4f6",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  quarterTitle: { flex: 1, fontSize: 13, fontWeight: "600", color: "#374151" },
  quarterGrade: { fontSize: 12, color: "#6b7280", marginRight: 8 },
  quarterBadge: {
    backgroundColor: "#dbeafe",
    borderColor: "#93c5fd",
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginRight: 8,
  },
  quarterBadgeText: { color: "#1E293B", fontWeight: "bold", fontSize: 11 },
  quarterGpa: { fontSize: 12, color: "#6b7280" },
  quarterExpanded: {
    marginTop: 8,
    marginLeft: 12,
    paddingLeft: 12,
    paddingVertical: 8,
    backgroundColor: "#fff",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  assessmentHeader: {
    flexDirection: "row",
    paddingBottom: 8,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  assessmentHeaderText: { fontSize: 12, fontWeight: "600", color: "#6b7280" },
  assessmentRow: {
    flexDirection: "row",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  assessmentText: { fontSize: 12, color: "#374151" },
  noDataText: {
    fontSize: 12,
    color: "#9ca3af",
    textAlign: "center",
    paddingVertical: 8,
  },
  directAssessments: {
    marginTop: 8,
    marginLeft: 12,
    paddingLeft: 12,
    paddingVertical: 8,
    backgroundColor: "#fff",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  chapterSummaryRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 10,
    gap: 12,
  },
  chapterSummaryText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
  },
  emptyContainer: { paddingVertical: 20, alignItems: "center" },
  emptyText: { color: "#6b7280", fontSize: 14, textAlign: "center" },
});

export default GradebookModal;
