import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Image } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';

type StudentProfileRouteProp = RouteProp<RootStackParamList, 'StudentProfile'>;

const StudentProfilePage = () => {
  const route = useRoute<StudentProfileRouteProp>();
  const { studentId } = route.params;
  const [student, setStudent] = useState({
    name: 'rubbas yar khan',
    email: 'rubbasyarkhan007@gmail.com',
    joinedDate: '30/05/2025',
    enrolledCourses: [
      {
        id: '1',
        name: 'testing',
        imageUrl: 'https://via.placeholder.com/400x200'
      }
    ]
  });

  useEffect(() => {
    // Here you would typically fetch the student data using the studentId
    // For now, we're using mock data
    console.log('Loading profile for student:', studentId);
  }, [studentId]);

  return (
    <ScrollView style={{ flex: 1, padding: 16 }}
      showsVerticalScrollIndicator={false}
      showsHorizontalScrollIndicator={false}
    >
      {/* Profile Section */}
      <View style={{ alignItems: 'center', marginBottom: 24 }}>
        {/* Profile Icon Placeholder */}
        <View style={{ width: 100, height: 100, borderRadius: 50, backgroundColor: '#eee', justifyContent: 'center', alignItems: 'center', marginBottom: 12, borderWidth: 2, borderColor: '#ccc' }}>
          {/* You might use an Image component or icon here */}
          <Text style={{ fontSize: 50, color: '#666' }}>👤</Text>{/* Placeholder text icon */}
        </View>
        <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 4 }}>{student.name}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
          <Text style={{ marginRight: 4, color: '#666' }}>✉️</Text>{/* Envelope icon placeholder */}
          <Text style={{ color: '#666' }}>{student.email}</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
           <Text style={{ marginRight: 4, color: '#666' }}>📅</Text>{/* Calendar icon placeholder */}
          <Text style={{ color: '#666' }}>Joined: {student.joinedDate}</Text>
        </View>
      </View>

      {/* Enrolled Courses Count Card */}
      <View style={{ borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 16, alignItems: 'center', marginBottom: 24 }}>
         <Text style={{ fontSize: 30, marginBottom: 8 }}>🏫</Text>{/* University/building icon placeholder */}
        <Text style={{ color: '#666', marginBottom: 4 }}>Enrolled Courses</Text>
        <Text style={{ fontSize: 24, fontWeight: 'bold' }}>{student.enrolledCourses.length}</Text>
      </View>

      {/* Enrolled Courses Section Title */}
      <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 16 }}>Enrolled Courses</Text>

      {/* Enrolled Course Cards */}
      {student.enrolledCourses.map((course) => (
        <View key={course.id} style={{ borderWidth: 1, borderColor: '#ddd', borderRadius: 8, overflow: 'hidden', marginBottom: 16 }}>
          <Image
            source={require('../assets/jpg.jpg')}
            style={{ width: '100%', height: 150, resizeMode: 'cover' }}
          />
          <View style={{ padding: 12, alignItems: 'center' }}>
            <Text style={{ fontSize: 16, fontWeight: 'bold' }}>{course.name}</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
};

export default StudentProfilePage;