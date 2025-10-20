

"use client"

import { useEffect, useState } from "react"
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from "react-native"
import { getOverallGradeReport } from "../services/gradebook"
const getGradeColor = (grade?: string) => {
  switch (grade) {
    case 'A': return 'green';
    case 'B': return 'blue';
    case 'C':
    case 'D': return 'orange';
    case 'E':
    case 'F': return 'red';
    default: return 'black';
  }
};
const GradebookPage = () => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<any>(null)
  const [expandedCourses, setExpandedCourses] = useState<Set<string>>(new Set())
  const [expandedSemesters, setExpandedSemesters] = useState<Record<string, boolean>>({})

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await getOverallGradeReport()
        setData(res)
      } catch (err: any) {
        setError(err.message || "Failed to fetch grade report")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const toggleCourse = (courseId: string) => {
    setExpandedCourses((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(courseId)) {
        newSet.delete(courseId)
      } else {
        newSet.add(courseId)
      }
      return newSet
    })
  }

  const getSemesterId = (sem: any, idx: number) => sem?.semesterId || sem?._id || `sem-${idx}`
  const toggleSemester = (semId: string) => setExpandedSemesters((prev) => ({ ...prev, [semId]: !prev[semId] }))

  const getLetterGrade = (average: number) => {
    if (average >= 90) return "A"
    if (average >= 80) return "B"
    if (average >= 70) return "C"
    if (average >= 60) return "D"
    return "F"
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.performanceCard}>
          <Text style={styles.performanceTitle}>Overall Academic Performance</Text>
          <View style={styles.performanceRow}>
            <Text style={styles.gpaLabel}>Overall GPA</Text>
            <Text style={styles.gpaValue}>
              {data?.overallGPA != null ? Number(data.overallGPA).toFixed(2) : "0.00"}
            </Text>
            <Text style={styles.coursesCount}>
              {Array.isArray(data?.courses) ? `${data.courses.length} Courses` : "0 Courses"}
            </Text>
          </View>
        </View>

        <View style={styles.courseDetailsCard}>
          <View style={styles.courseDetailsHeader}>
            <Text style={styles.courseDetailsTitle}>Course Details</Text>
            <Text style={styles.pageInfo}>
              Page {data?.currentPage ?? 1} of {data?.totalPages ?? 1}
            </Text>
          </View>

          {loading ? (
            <ActivityIndicator style={{ marginVertical: 32 }} />
          ) : error ? (
            <Text style={styles.noDataText}>{error}</Text>
          ) : data && data.courses && data.courses.length > 0 ? (
            data.courses.map((course: any) => (
              <View key={course.courseId || course._id} style={styles.courseItem}>
                <View style={styles.courseHeaderRow}>
                  <View style={styles.courseInfo}>
                    <Text style={styles.courseLabel}>Course</Text>
                    <Text style={styles.courseName}>{course.courseName || "Untitled Course"}</Text>
                  </View>
                  <View style={styles.semesterInfo}>
                    <Text style={styles.courseLabel}>Semesters</Text>
                    <Text style={styles.semesterText}>
                      {Array.isArray(course.semesters)
                        ? `${course.semesters.length} semester${course.semesters.length === 1 ? "" : "s"}`
                        : "0 semesters"}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => toggleCourse(course.courseId || course._id)}
                  >
                    <Text style={styles.actionText}>
                      {expandedCourses.has(course.courseId || course._id) ? "▴ Hide Details" : "▾ Show Details"}
                    </Text>
                  </TouchableOpacity>
                </View>

                {expandedCourses.has(course.courseId || course._id) && (
                  <View style={styles.courseDetails}>
                    {Array.isArray(course.semesters) && course.semesters.length > 0 ? (
                      course.semesters.map((sem: any, sIdx: number) => {
                        const semId = getSemesterId(sem, sIdx)
                        const quartersCount = Array.isArray(sem.quarters) ? sem.quarters.length : 0
                        const isOpen = !!expandedSemesters[semId]
                        return (
                          <View key={semId} style={{ marginBottom: 16 }}>
                            <View style={styles.semesterSection}>
                              <Text style={styles.semesterTitle}>{sem.semesterTitle || "Semester"}</Text>
                              <TouchableOpacity
                                onPress={() => toggleSemester(semId)}
                                style={styles.quarterToggle}
                                accessibilityRole="button"
                                accessibilityLabel={isOpen ? "Hide quarters" : "Show quarters"}
                              >
                                <Text style={styles.quarterToggleText}>
                                  {isOpen ? "▾" : "▸"} {quartersCount} Quarter{quartersCount === 1 ? "" : "s"}
                                </Text>
                              </TouchableOpacity>
                            </View>

                            {isOpen ? (
                              quartersCount > 0 ? (
                                sem.quarters.map((qtr: any) => (
                                  <View key={qtr.quarterId} style={styles.quarterCard}>
                                    <View style={styles.quarterHeader}>
                                      <Text style={styles.quarterTitle}>{qtr.quarterTitle || "Quarter"}</Text>
                                      <View style={styles.gradeInfo}>
                                        <Text style={styles.gradeLabel}>Grade: </Text>
                                        <Text style={styles.gradeValue}>
                                          {qtr.grade != null ? `${Number(qtr.grade).toFixed(2)}%` : "—"}
                                        </Text>
                                        <Text style={styles.gpaLabel}>GPA: </Text>
                                        <Text style={styles.gpaNumber}>{qtr.gpa != null ? String(qtr.gpa) : "—"}</Text>
                                        <View
                                          style={[
                                            styles.letterGrade,
                                            (qtr.grade ?? 0) >= 60 ? styles.letterGradePass : styles.letterGradeFail,
                                          ]}
                                        >
                                          <Text style={[styles.letterGradeText, { color: getGradeColor(qtr.letterGrade) }]}>{qtr.letterGrade || "—"}</Text>
                                        </View>
                                      </View>
                                    </View>

                                    <View style={styles.assessmentsList}>
                                      {Array.isArray(qtr.assessments) && qtr.assessments.length > 0 ? (
                                        qtr.assessments.map((a: any) => {
                                          const max = Number(a.maxPoints ?? 0)
                                          const pts = Number(a.studentPoints ?? 0)
                                          const pct = max > 0 ? (pts / max) * 100 : 0
                                          return (
                                            <View key={a.assessmentId} style={styles.assessmentItemCard}>
                                              <View style={styles.assessmentItemRow}>
                                                <Text style={styles.assessmentLabel}>Assessment</Text>
                                                <Text style={styles.assessmentValue}>
                                                  {a.assessmentTitle || "Assessment"}
                                                </Text>
                                              </View>
                                              <View style={styles.assessmentItemRow}>
                                                <Text style={styles.assessmentLabel}>Category</Text>
                                                <Text style={styles.assessmentValue}>{a.category || "—"}</Text>
                                              </View>
                                              <View style={styles.assessmentItemRow}>
                                                <Text style={styles.assessmentLabel}>Score</Text>
                                                <Text style={styles.assessmentValue}>
                                                  {isNaN(pts) ? "0" : String(pts)}
                                                </Text>
                                              </View>
                                              <View style={styles.assessmentItemRow}>
                                                <Text style={styles.assessmentLabel}>Max Points</Text>
                                                <Text style={styles.assessmentValue}>
                                                  {isNaN(max) ? "0" : String(max)}
                                                </Text>
                                              </View>
                                              <View style={[styles.assessmentItemRow, { marginBottom: 0, borderBottomWidth: 0 }]}>
                                                <Text style={styles.assessmentLabel}>Percentage</Text>
                                                <Text
                                                  style={[
                                                    styles.assessmentValueStrong,
                                                    pct >= 60 ? styles.percentPass : styles.percentFail,
                                                  ]}
                                                >
                                                  {pct.toFixed(1)}%
                                                </Text>
                                              </View>
                                            </View>
                                          )
                                        })
                                      ) : (
                                        <Text style={styles.noAssessments}>No assessments available</Text>
                                      )}
                                    </View>
                                  </View>
                                ))
                              ) : (
                                <Text style={styles.noDataText}>No quarters available</Text>
                              )
                            ) : null}
                          </View>
                        )
                      })
                    ) : (
                      <Text style={styles.noDataText}>No semesters available</Text>
                    )}
                  </View>
                )}
              </View>
            ))
          ) : (
            <Text style={styles.noDataText}>No courses or assessments found matching your search.</Text>
          )}
        </View>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    padding: 16,
  },
  performanceCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#eee",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  performanceTitle: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#10B144",
    marginBottom: 12,
    textAlign: "left",
  },
  performanceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
  },
  gpaLabel: {
    fontSize: 18,
    fontWeight: "600",
    color: "#222",
  },
  gpaValue: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#10B144",
    marginLeft: 8,
  },
  coursesCount: {
    fontSize: 16,
    color: "#7b8794",
    marginLeft: "auto",
  },
  courseDetailsCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#eee",
    padding: 20,
  },
  courseDetailsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  courseDetailsTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#000",
  },
  pageInfo: {
    fontSize: 14,
    color: "#7b8794",
  },
  courseItem: {
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingBottom: 16,
  },
  courseHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  courseInfo: {
    flex: 1,
  },
  semesterInfo: {
    flex: 1,
    paddingHorizontal: 12,
  },
  courseLabel: {
    fontSize: 12,
    color: "#7b8794",
    marginBottom: 4,
    fontWeight: "600",
  },
  courseName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
  semesterText: {
    fontSize: 14,
    color: "#000",
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  actionText: {
    fontSize: 14,
    color: "#000",
    fontWeight: "500",
  },
  courseDetails: {
    marginTop: 16,
    paddingLeft: 16,
  },
  semesterSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  semesterTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
  },
  quarterToggle: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  quarterToggleText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  quarterCard: {
    backgroundColor: "#fafbfc",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  quarterHeader: {
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  quarterTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 8,
  },
  gradeInfo: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  gradeLabel: {
    fontSize: 14,
    color: "#000",
    fontWeight: "500",
  },
  gradeValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#10B144",
    marginRight: 16,
  },
  gpaNumber: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#10B144",
    marginRight: 8,
  },
  letterGrade: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  letterGradePass: {
    backgroundColor: "#ffebee",
  },
  letterGradeFail: {
    backgroundColor: "#ffebee",
  },
  letterGradeText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#f44336",
  },
  assessmentsList: {
    // container for the list; spacing handled by card margins
  },
  assessmentItemCard: {
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#eee",
    padding: 12,
    marginBottom: 12,
  },
  assessmentItemRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  assessmentLabel: {
    fontSize: 12,
    color: "#7b8794",
    fontWeight: "600",
    marginRight: 12,
    maxWidth: "50%",
  },
  assessmentValue: {
    fontSize: 14,
    color: "#111827",
    fontWeight: "500",
    textAlign: "right",
    flexShrink: 1,
  },
  assessmentValueStrong: {
    fontSize: 14,
    color: "#111827",
    fontWeight: "700",
    textAlign: "right",
  },
  percentPass: {
    color: "#10B144",
  },
  percentFail: {
    color: "#f44336",
  },
  noAssessments: {
    flex: 1,
    textAlign: "center",
    color: "#7b8794",
    fontSize: 14,
  },
  noDataText: {
    color: "#222",
    textAlign: "center",
    fontSize: 16,
    paddingVertical: 24,
  },
})

export default GradebookPage
