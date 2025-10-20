import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { useAuth } from '../contexts/AuthContext';
import { dashboardService, Course, RecentActivity } from '../services/dashboard';

// Static data
const staticRecentActivity: RecentActivity[] = [
  // {
  //   id: '1',
  //   message: 'New student enrolled in React Native course',
  //   timestamp: '2 hours ago'
  // },
  // {
  //   id: '2',
  //   message: 'Course "Advanced JavaScript" updated',
  //   timestamp: '5 hours ago'
  // }
];

// Add this type above the DashboardPage component
interface StudentEnrollment {
  _id: string;
  student: string;
  course: {
    _id: string;
    courseTitle: string;
    category?: { _id: string; title: string };
    thumbnail?: { url: string };
    [key: string]: any;
  };
  enrolledAt?: string;
  [key: string]: any;
}

const DashboardPage = () => {
  const navigation = useNavigation<DrawerNavigationProp<any>>();
  const { userRole } = useAuth();
  const [recentCourses, setRecentCourses] = useState<Course[]>([]);
  const [recentCourseslength, setRecentCourseslength] = useState<number>(0);
  const [publishedCoursesCount, setPublishedCoursesCount] = useState<number>(0);
  const [unpublishedCoursesCount, setUnpublishedCoursesCount] = useState<number>(0);
  const [studentCount, setStudentCount] = useState(0);
  const [loading, setLoading] = useState(false);
  // Student-specific state
  const [studentCourses, setStudentCourses] = useState<StudentEnrollment[]>([]);
  const [studentAnnouncements, setStudentAnnouncements] = useState<any[]>([]);
  const [studentLoading, setStudentLoading] = useState(false);
  const [studentError, setStudentError] = useState<string | null>(null);

  const fetchRecentCourses = async () => {
    try {
      setLoading(true);
      const coursesData = await dashboardService.getRecentCourses();
      console.log("coursesData *********", coursesData);

      // Count published and unpublished courses
      const publishedCount = coursesData.filter(course => course.published === true).length;
      const unpublishedCount = coursesData.filter(course => course.published === false).length;

      setPublishedCoursesCount(publishedCount);
      setUnpublishedCoursesCount(unpublishedCount);
      setRecentCourseslength(coursesData.length);

      // Filter only published courses and take the first 3
      const publishedCourses = coursesData.filter(course => course.published === true);
      const limitedCourses = publishedCourses.slice(0, 3).reverse();
      setRecentCourses(limitedCourses);
    } catch (error: any) {
      console.error('Error fetching recent courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentCount = async () => {
    try {
      const count = await dashboardService.getStudentsCount();
      setStudentCount(count);
    } catch (error) {
      console.error('Error fetching student count:', error);
    }
  };

  // Student: fetch announcements and courses
  const fetchStudentDashboard = async () => {
    setStudentLoading(true);
    setStudentError(null);
    try {
      const [courses, announcements] = await Promise.all([
        dashboardService.getStudentCourses(),
        dashboardService.getStudentAnnouncements(),
      ]);
      setStudentCourses(courses);
      setStudentAnnouncements(announcements);
    } catch (err) {
      setStudentError('Failed to load student dashboard data.');
    } finally {
      setStudentLoading(false);
    }
  };

  // Use useFocusEffect to refresh data every time the screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      console.log('Dashboard focused - refreshing data...');
      if (userRole === 'student') {
        fetchStudentDashboard();
      } else {
        fetchRecentCourses();
        fetchStudentCount();
      }
    }, [userRole])
  );

  if (userRole === 'student') {
    return (
      <View style={styles.mainContainer}>

        <ScrollView style={styles.container}>
          <Text style={styles.sectionTitle}>Announcements</Text>
          {studentLoading ? (
            <Text style={styles.sectionSubtitle}>Loading...</Text>
          ) : studentError ? (
            <Text style={styles.sectionSubtitle}>{studentError}</Text>
          ) : studentAnnouncements.length > 0 ? (
            studentAnnouncements.map((a) => (
              <View key={a.id} style={styles.activityCard}>
                <Text style={styles.activityText}>{a.title}</Text>
                <Text style={styles.activityTime}>{a.date ? new Date(a.date).toLocaleString() : ''}</Text>
                <Text style={styles.activityText}>{a.content}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.sectionSubtitle}>No announcements to show.</Text>
          )}

          <Text style={styles.sectionTitle}>Courses</Text>
          <View style={styles.recentCoursesContainer}>
            {studentLoading ? (
              <Text style={styles.sectionSubtitle}>Loading...</Text>
            ) : studentCourses.length > 0 ? (
              studentCourses.map((enrollment) => (
                <TouchableOpacity
                  key={enrollment._id}
                  style={styles.horizontalCourseCard}
                  onPress={() => navigation.navigate('CourseDetailStudentPageEnrolled', { enrollmentId: enrollment._id, courseId: enrollment.course?._id })}
                >
                  <Image
                    source={{ uri: enrollment.course?.thumbnail?.url || 'https://via.placeholder.com/150' }}
                    style={styles.horizontalCourseImage}
                    defaultSource={require('../assets/jpg.jpg')}
                  />
                  <View style={styles.horizontalCourseInfo}>
                    <Text style={styles.horizontalCourseTitle} numberOfLines={1}>
                      {enrollment.course?.courseTitle}
                    </Text>
                    <Text style={styles.horizontalCourseCategory}>
                      {enrollment.course?.category?.title}
                    </Text>
                    <Text style={styles.horizontalCourseCategory}>
                      Enrolled at {enrollment.enrolledAt ? new Date(enrollment.enrolledAt).toLocaleDateString() : ''}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <Text style={styles.sectionSubtitle}>No courses to show.</Text>
            )}
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.mainContainer}>
      <ScrollView style={styles.container}>
        {/* Cards */}
        <View style={styles.cardsContainer}>
          <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('MyCourses')}>
            <Text style={styles.cardTitle}>Total Courses</Text>
            <View style={styles.cardContent}>
              <Text style={styles.cardNumber}>{recentCourseslength}</Text>
              <View style={styles.iconCircleGreen}>
                <Text style={styles.iconText}>📖</Text>
              </View>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('Students')}>
            <Text style={styles.cardTitle}>Students</Text>
            <View style={styles.cardContent}>
              <Text style={styles.cardNumber}>{studentCount}</Text>
              <View style={styles.iconCircleBlue}>
                <Text style={styles.iconText}>👥</Text>
              </View>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('MyCourses')}>
            <Text style={styles.cardTitle}>Published Courses</Text>
            <View style={styles.cardContent}>
              <Text style={styles.cardNumber}>{publishedCoursesCount}</Text>
              <View style={styles.iconCircleGreen}>
                <Text style={styles.iconText}>📄</Text>
              </View>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('MyCourses')}>
            <Text style={styles.cardTitle}>Unpublished Courses</Text>
            <View style={styles.cardContent}>
              <Text style={styles.cardNumber}>{unpublishedCoursesCount}</Text>
              <View style={styles.iconCircleRed}>
                <Text style={styles.iconText}>📝</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Recent Activity */}
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        {staticRecentActivity.length > 0 ? (
          staticRecentActivity.map((activity) => (
            <View key={activity.id} style={styles.activityCard}>
              <Text style={styles.activityText}>{activity.message}</Text>
              <Text style={styles.activityTime}>{activity.timestamp}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.sectionSubtitle}>No recent activity to show.</Text>
        )}

        {/* Recent Courses */}
        <Text style={styles.sectionTitle}>Recent Courses</Text>
        <View style={styles.recentCoursesContainer}>
          {recentCourses.length > 0 ? (
            recentCourses.map((course) => (
              <TouchableOpacity
                key={course.id}
                style={styles.horizontalCourseCard}
                onPress={() => navigation.navigate('CourseDetails', { courseId: course.id })}
              >
                <Image
                  source={{ uri: course.imageUrl }}
                  style={styles.horizontalCourseImage}
                  defaultSource={require('../assets/jpg.jpg')}
                />
                <View style={styles.horizontalCourseInfo}>
                  <Text style={styles.horizontalCourseTitle} numberOfLines={1}>{course.title}</Text>
                  <Text style={styles.horizontalCourseCategory}>{course.category}</Text>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.sectionSubtitle}>No recent courses to show.</Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  customHeader: {
    height: 60,
    backgroundColor: '#10B144',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  menuButton: {
    padding: 8,
  },
  menuIcon: {
    fontSize: 24,
    color: '#fff',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 16,
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  cardsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginHorizontal: 10,
    marginBottom: 10,
    marginTop: 30,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    width: '48%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    color: '#444',
    fontSize: 18,
    marginBottom: 10,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#222',
  },
  iconCircleGreen: {
    backgroundColor: '#D1FADF',
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircleBlue: {
    backgroundColor: '#E0EDFF',
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircleRed: {
    backgroundColor: '#FEE2E2',
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 22,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 4,
    color: '#111',
  },
  sectionSubtitle: {
    fontSize: 16,
    color: '#888',
    marginHorizontal: 16,
    marginBottom: 8,
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    marginTop: 10,
  },
  activityCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginHorizontal: 10,
    marginBottom: 10,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  activityText: {
    fontSize: 16,
    color: '#222',
  },
  activityTime: {
    fontSize: 13,
    color: '#888',
    marginTop: 4,
  },
  saleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    marginHorizontal: 10,
    marginBottom: 10,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  saleIconCircle: {
    backgroundColor: '#FFF7E0',
    borderRadius: 16,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  saleIcon: {
    fontSize: 18,
  },
  saleTextContainer: {
    flex: 1,
  },
  saleText: {
    fontSize: 16,
    color: '#222',
  },
  bold: {
    fontWeight: 'bold',
    color: '#111',
  },
  gray: {
    color: '#888',
  },
  saleTime: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
  },
  recentCoursesContainer: {
    marginHorizontal: 0,
    marginBottom: 32,
  },
  horizontalCourseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  horizontalCourseImage: {
    width: 50,
    height: 50,
    borderRadius: 10,
    marginRight: 16,
  },
  horizontalCourseInfo: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
  },
  horizontalCourseTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 4,
  },
  horizontalCourseCategory: {
    fontSize: 14,
    color: '#888',
  },
});

export default DashboardPage; 