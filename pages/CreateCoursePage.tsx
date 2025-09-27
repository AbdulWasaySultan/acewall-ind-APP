import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, Image, ActivityIndicator, Modal } from 'react-native';
// Assuming you have an image picker library installed like react-native-image-picker
import { launchImageLibrary, ImagePickerResponse, ImageLibraryOptions, MediaType } from 'react-native-image-picker';
import { pick } from '@react-native-documents/picker';
import { createCourse, getCategories, getSubcategories, getSemesters, getQuartersBySemesters } from '../services/course';
import { useNavigation } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import Toast from 'react-native-simple-toast';

interface Category {
  _id: string;
  title: string;
}

interface Subcategory {
  _id: string;
  title: string;
  category: string;
}

interface Semester {
  _id: string;
  title: string;
  startDate: string;
  endDate: string;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface Quarter {
  _id: string;
  title: string;
  startDate: string;
  endDate: string;
  isArchived: boolean;
  semester: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

const CreateCoursePage = () => {
  const navigation = useNavigation<DrawerNavigationProp<any>>();
  const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);
  const [selectedImageFilename, setSelectedImageFilename] = useState<string | null>(null);
  const [selectedSyllabusFile, setSelectedSyllabusFile] = useState<any>(null);
  const [teachingPoints, setTeachingPoints] = useState<string[]>(['']); // State for teaching points
  const [courseRequirements, setCourseRequirements] = useState<string[]>(['']); // State for course requirements
  const [courseTitle, setCourseTitle] = useState('');
  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [language, setLanguage] = useState('English');
  const [courseDescription, setCourseDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showSubcategoryModal, setShowSubcategoryModal] = useState(false);
  const [selectedCategoryTitle, setSelectedCategoryTitle] = useState('');
  const [selectedSubcategoryTitle, setSelectedSubcategoryTitle] = useState('');
  
  // New state for semester and quarter
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [quarters, setQuarters] = useState<Quarter[]>([]);
  const [selectedSemester, setSelectedSemester] = useState<string>('');
  const [selectedQuarter, setSelectedQuarter] = useState<string>('');
  const [selectedSemesterTitle, setSelectedSemesterTitle] = useState('');
  const [selectedQuarterTitle, setSelectedQuarterTitle] = useState('');
  const [showSemesterModal, setShowSemesterModal] = useState(false);
  const [showQuarterModal, setShowQuarterModal] = useState(false);
  const [isLoadingSemesters, setIsLoadingSemesters] = useState(false);
  const [isLoadingQuarters, setIsLoadingQuarters] = useState(false);

  useEffect(() => {
    fetchCategories();
    fetchSemesters();
  }, []);

  useEffect(() => {
    if (category) {
      fetchSubcategories(category);
    } else {
      setSubcategories([]);
    }
  }, [category]);

  useEffect(() => {
    if (selectedSemester) {
      fetchQuarters([selectedSemester]);
    } else {
      setQuarters([]);
      setSelectedQuarter('');
      setSelectedQuarterTitle('');
    }
  }, [selectedSemester]);

  const fetchCategories = async () => {
    try {
      setIsLoadingCategories(true);
      const response = await getCategories();
      setCategories(response.data);
    } catch (error: any) {
      setCategories([]);
    } finally {
      setIsLoadingCategories(false);
    }
  };

  const fetchSubcategories = async (categoryId: string) => {
    try {
      const response = await getSubcategories(categoryId);
      setSubcategories(response.data);
    } catch (error: any) {
      setSubcategories([]);
    }
  };

  const fetchSemesters = async () => {
    try {
      setIsLoadingSemesters(true);
      const response = await getSemesters();
      setSemesters(response.semesters || []);
    } catch (error: any) {
      setSemesters([]);
    } finally {
      setIsLoadingSemesters(false);
    }
  };

  const fetchQuarters = async (semesterIds: string[]) => {
    try {
      setIsLoadingQuarters(true);
      const response = await getQuartersBySemesters(semesterIds);
      setQuarters(response.quarters || []);
    } catch (error: any) {
      setQuarters([]);
    } finally {
      setIsLoadingQuarters(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Validate course title
    if (!courseTitle || courseTitle.length < 5 || courseTitle.length > 100) {
      newErrors.courseTitle = 'Course title must be between 5 and 100 characters';
    } else if (/^[.,\s]+$/.test(courseTitle) || /\.{3,}/.test(courseTitle) || /,{3,}/.test(courseTitle)) {
      newErrors.courseTitle = 'Course title contains invalid characters';
    }

    // Only validate category and subcategory if categories exist
    if (categories.length > 0) {
      if (!category) {
        newErrors.category = 'Category is required';
      }

      // Only require subcategory if subcategories exist
      if (subcategories.length > 0 && !subcategory) {
        newErrors.subcategory = 'Subcategory is required';
      }
    }

    // Validate semester and quarter
    if (semesters.length > 0) {
      if (!selectedSemester) {
        newErrors.semester = 'Semester is required';
      }
      
      if (!selectedQuarter) {
        newErrors.quarter = 'Quarter is required';
      }
    }

    // Validate course description
    if (!courseDescription || courseDescription.length < 5 || courseDescription.length > 500) {
      newErrors.courseDescription = 'Course description must be between 5 and 500 characters';
    } else if (/^[.,\s]+$/.test(courseDescription) || /\.{3,}/.test(courseDescription) || /,{3,}/.test(courseDescription)) {
      newErrors.courseDescription = 'Course description contains invalid characters';
    }

    if (!selectedImageUri) {
      newErrors.thumbnail = 'Course thumbnail is required';
    }

    if (!selectedSyllabusFile) {
      newErrors.syllabus = 'Course syllabus (PDF) is required';
    }

    // Validate teaching points
    const validTeachingPoints = teachingPoints.filter(point => point.trim() !== '');
    if (validTeachingPoints.length === 0) {
      newErrors.teachingPoints = 'At least one teaching point is required';
    } else {
      // Check each teaching point for minimum length and invalid characters
      validTeachingPoints.forEach((point, index) => {
        if (point.length < 5) {
          newErrors.teachingPoints = `Teaching point ${index + 1} must be at least 5 characters long`;
          Toast.show(newErrors.teachingPoints, Toast.LONG);
        } else if (/^[.,\s]+$/.test(point) || /\.{3,}/.test(point) || /,{3,}/.test(point)) {
          newErrors.teachingPoints = `Teaching point ${index + 1} contains invalid characters`;
          Toast.show(newErrors.teachingPoints, Toast.LONG);
        }
      });
    }

    // Validate requirements
    const validRequirements = courseRequirements.filter(req => req.trim() !== '');
    if (validRequirements.length === 0) {
      newErrors.requirements = 'At least one requirement is required';
    } else {
      // Check each requirement for minimum length and invalid characters
      validRequirements.forEach((req, index) => {
        if (req.length < 5) {
          newErrors.requirements = `Requirement ${index + 1} must be at least 5 characters long`;
          Toast.show(newErrors.requirements, Toast.LONG);
        } else if (/^[.,\s]+$/.test(req) || /\.{3,}/.test(req) || /,{3,}/.test(req)) {
          newErrors.requirements = `Requirement ${index + 1} contains invalid characters`;
          Toast.show(newErrors.requirements, Toast.LONG);
        }
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImageUpload = async () => {
    const options: ImageLibraryOptions = {
      mediaType: 'photo',
      includeBase64: false,
      maxHeight: 800,
      maxWidth: 800,
    };

    launchImageLibrary(options, (response: ImagePickerResponse) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode) {
        console.log('Error', 'Failed to pick image');
      } else if (response.assets && response.assets.length > 0) {
        const asset = response.assets[0];
        setSelectedImageUri(asset.uri || null);
        setSelectedImageFilename(asset.fileName || null);
      }
    });
  };

  const handleSyllabusUpload = async () => {
    try {
      const [result] = await pick({
        mode: 'open',
        type: ['application/pdf'],
      });
      
      if (result.error) {
        Toast.show(result.error || 'Error picking PDF file', Toast.LONG);
        return;
      }
      
      const file = result;
      setSelectedSyllabusFile(file);
      Toast.show('Syllabus PDF selected successfully', Toast.SHORT);
    } catch (err: any) {
      Toast.show(err || 'Error picking PDF file', Toast.LONG);
    }
  };

  const addTeachingPointInput = () => {
    setTeachingPoints([...teachingPoints, '']);
  };

  const handleTeachingPointChange = (index: number, text: string) => {
    const newTeachingPoints = [...teachingPoints];
    newTeachingPoints[index] = text;
    setTeachingPoints(newTeachingPoints);
  };

  const removeTeachingPoint = (index: number) => {
    const newTeachingPoints = teachingPoints.filter((_, i) => i !== index);
    setTeachingPoints(newTeachingPoints);
  };

  const addRequirementInput = () => {
    setCourseRequirements([...courseRequirements, '']);
  };

  const handleRequirementChange = (index: number, text: string) => {
    const newRequirements = [...courseRequirements];
    newRequirements[index] = text;
    setCourseRequirements(newRequirements);
  };

  const removeRequirement = (index: number) => {
    const newRequirements = courseRequirements.filter((_, i) => i !== index);
    setCourseRequirements(newRequirements);
  };

  const resetForm = () => {
    setSelectedImageUri(null);
    setSelectedImageFilename(null);
    setSelectedSyllabusFile(null);
    setTeachingPoints(['']);
    setCourseRequirements(['']);
    setCourseTitle('');
    setCategory('');
    setSubcategory('');
    setLanguage('English');
    setCourseDescription('');
    setSelectedCategoryTitle('');
    setSelectedSubcategoryTitle('');
    setErrors({});
    setSelectedSemester('');
    setSelectedQuarter('');
    setSelectedSemesterTitle('');
    setSelectedQuarterTitle('');
  };

  const handleCreateCourse = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setIsLoading(true);
      
      const filteredTeachingPoints = teachingPoints.filter(point => point.trim() !== '');
      const filteredRequirements = courseRequirements.filter(req => req.trim() !== '');

      const courseData = {
        courseTitle,
        category,
        subcategory: subcategory || category, // Use category as subcategory if no subcategory selected
        language,
        courseDescription,
        thumbnail: {
          url: selectedImageUri!,
          filename: selectedImageFilename || 'thumbnail.jpg'
        },
        teachingPoints: filteredTeachingPoints,
        requirements: filteredRequirements,
        published: false,
        semester: selectedSemester ? [selectedSemester] : [],
        quarter: selectedQuarter ? [selectedQuarter] : [],
        syllabus: selectedSyllabusFile
      };

      console.log('Sending course data:', courseData);
      const response = await createCourse(courseData);
      console.log('Course creation response:', response);
      
      Toast.show('Course created successfully!', Toast.LONG);
      
      resetForm(); // Reset all form fields
      
      // Navigate to MyCourses page to show the newly created course
      navigation.navigate('MyCourses');
    } catch (error: any) {
      console.error('Course creation error:', error);
      let errorMessage = 'Failed to create course';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      Toast.show(errorMessage, Toast.LONG);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCategorySelect = (cat: Category) => {
    setCategory(cat._id);
    setSelectedCategoryTitle(cat.title);
    setShowCategoryModal(false);
    // Reset subcategory when category changes
    setSubcategory('');
    setSelectedSubcategoryTitle('');
    setSubcategories([]);
    // Fetch subcategories for selected category
    fetchSubcategories(cat._id);
  };

  const handleSubcategorySelect = (subcat: Subcategory) => {
    setSubcategory(subcat._id);
    setSelectedSubcategoryTitle(subcat.title);
    setShowSubcategoryModal(false);
  };

  const handleSemesterSelect = (semester: Semester) => {
    setSelectedSemester(semester._id);
    setSelectedSemesterTitle(semester.title);
    setShowSemesterModal(false);
    // Reset quarter when semester changes
    setSelectedQuarter('');
    setSelectedQuarterTitle('');
    setQuarters([]);
    // Fetch quarters for selected semester
    fetchQuarters([semester._id]);
  };

  const handleQuarterSelect = (quarter: Quarter) => {
    setSelectedQuarter(quarter._id);
    setSelectedQuarterTitle(quarter.title);
    setShowQuarterModal(false);
  };


  return (
    <ScrollView style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 16 }}>Create New Course</Text>

      {/* Thumbnail Section */}
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 8 }}>Thumbnail</Text>
      <View style={{ height: 150, borderWidth: 1, borderStyle: 'dashed', borderColor: '#ccc', justifyContent: 'center', alignItems: 'center', marginBottom: 16 }}>
        {selectedImageUri ? (
          <View style={{ width: '100%', height: '100%' }}>
            <Image source={{ uri: selectedImageUri }} style={{ width: '100%', height: '100%', resizeMode: 'cover' }} />
            <Pressable 
              style={{ 
                position: 'absolute', 
                bottom: 8, 
                right: 8, 
                backgroundColor: 'rgba(0,0,0,0.7)', 
                padding: 8, 
                borderRadius: 4 
              }} 
              onPress={handleImageUpload}
            >
              <Text style={{ color: 'white' }}>Change</Text>
            </Pressable>
          </View>
        ) : (
          <Pressable style={{ padding: 8, borderWidth: 1, borderColor: '#ccc', borderRadius: 4 }} onPress={handleImageUpload}>
            <Text>Upload Thumbnail</Text>
          </Pressable>
        )}
      </View>
      {errors.thumbnail && <Text style={{ color: 'red', marginBottom: 8 }}>{errors.thumbnail}</Text>}

      {/* Course Title */}
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 8 }}>Course Title</Text>
      <TextInput 
        style={[
          { height: 40, borderWidth: 1, borderColor: '#ccc', borderRadius: 4, paddingHorizontal: 8, marginBottom: 16 },
          errors.courseTitle && { borderColor: 'red' }
        ]} 
        placeholder='Course Title (5-100 characters)'
        placeholderTextColor="#999999"
        value={courseTitle}
        onChangeText={setCourseTitle}
        maxLength={100}
      />
      {errors.courseTitle && <Text style={{ color: 'red', marginBottom: 8 }}>{errors.courseTitle}</Text>}

      {/* Category Selection - Only show if categories exist */}
      {categories.length > 0 && (
        <>
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 8 }}>Category</Text>
          <Pressable
            style={[
              { height: 40, borderWidth: 1, borderColor: '#ccc', borderRadius: 4, paddingHorizontal: 8, marginBottom: 16, justifyContent: 'center' },
              errors.category && { borderColor: 'red' }
            ]}
            onPress={() => setShowCategoryModal(true)}
          >
            <Text>{selectedCategoryTitle || 'Select Category'}</Text>
          </Pressable>
          {errors.category && <Text style={{ color: 'red', marginBottom: 8 }}>{errors.category}</Text>}

          {/* Category Selection Modal */}
          <Modal
            visible={showCategoryModal}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setShowCategoryModal(false)}
          >
            <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 }}>
              <View style={{ backgroundColor: 'white', borderRadius: 8, padding: 16, maxHeight: '80%' }}>
                <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 16 }}>Select Category</Text>
                <ScrollView>
                  {isLoadingCategories ? (
                    <ActivityIndicator style={{ marginVertical: 20 }} />
                  ) : (
                    categories.map((cat) => (
                      <Pressable
                        key={cat._id}
                        style={[
                          { padding: 12, borderBottomWidth: 1, borderBottomColor: '#eee' },
                          category === cat._id && { backgroundColor: '#e6ffe6' }
                        ]}
                        onPress={() => handleCategorySelect(cat)}
                      >
                        <Text style={{ fontSize: 16 }}>{cat.title}</Text>
                      </Pressable>
                    ))
                  )}
                </ScrollView>
                <Pressable
                  style={{ marginTop: 16, padding: 12, backgroundColor: '#f0f0f0', borderRadius: 4 }}
                  onPress={() => setShowCategoryModal(false)}
                >
                  <Text style={{ textAlign: 'center' }}>Cancel</Text>
                </Pressable>
              </View>
            </View>
          </Modal>

          {/* Subcategory Selection - Only show if subcategories exist and category is selected */}
          {category && subcategories.length > 0 && (
            <>
              <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 8 }}>Subcategory</Text>
              <Pressable
                style={[
                  { height: 40, borderWidth: 1, borderColor: '#ccc', borderRadius: 4, paddingHorizontal: 8, marginBottom: 16, justifyContent: 'center' },
                  errors.subcategory && { borderColor: 'red' }
                ]}
                onPress={() => setShowSubcategoryModal(true)}
              >
                <Text>{selectedSubcategoryTitle || 'Select Subcategory'}</Text>
              </Pressable>
              {errors.subcategory && <Text style={{ color: 'red', marginBottom: 8 }}>{errors.subcategory}</Text>}

              {/* Subcategory Selection Modal */}
              <Modal
                visible={showSubcategoryModal}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowSubcategoryModal(false)}
              >
                <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 }}>
                  <View style={{ backgroundColor: 'white', borderRadius: 8, padding: 16, maxHeight: '80%' }}>
                    <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 16 }}>Select Subcategory</Text>
                    <ScrollView>
                      {subcategories.length > 0 ? (
                        subcategories.map((subcat) => (
                          <Pressable
                            key={subcat._id}
                            style={[
                              { padding: 12, borderBottomWidth: 1, borderBottomColor: '#eee' },
                              subcategory === subcat._id && { backgroundColor: '#e6ffe6' }
                            ]}
                            onPress={() => handleSubcategorySelect(subcat)}
                          >
                            <Text style={{ fontSize: 16 }}>{subcat.title}</Text>
                          </Pressable>
                        ))
                      ) : (
                        <Text style={{ padding: 12, textAlign: 'center', color: '#666' }}>No subcategories available</Text>
                      )}
                    </ScrollView>
                    <Pressable
                      style={{ marginTop: 16, padding: 12, backgroundColor: '#f0f0f0', borderRadius: 4 }}
                      onPress={() => setShowSubcategoryModal(false)}
                    >
                      <Text style={{ textAlign: 'center' }}>Cancel</Text>
                    </Pressable>
                  </View>
                </View>
              </Modal>
            </>
          )}
        </>
      )}

      {/* Language */}
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 8 }}>Language</Text>
      <TextInput 
        style={{ height: 40, borderWidth: 1, borderColor: '#ccc', borderRadius: 4, paddingHorizontal: 8, marginBottom: 16 }} 
        placeholder='English'
        placeholderTextColor="#999999"
        value={language}
        onChangeText={setLanguage}
      />

      {/* Semester Selection - Only show if semesters exist */}
      {semesters.length > 0 && (
        <>
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 8 }}>Semester</Text>
          <Pressable
            style={[
              { height: 40, borderWidth: 1, borderColor: '#ccc', borderRadius: 4, paddingHorizontal: 8, marginBottom: 16, justifyContent: 'center' },
              errors.semester && { borderColor: 'red' }
            ]}
            onPress={() => setShowSemesterModal(true)}
          >
            <Text>{selectedSemesterTitle || 'Select Semester'}</Text>
          </Pressable>
          {errors.semester && <Text style={{ color: 'red', marginBottom: 8 }}>{errors.semester}</Text>}

          {/* Semester Selection Modal */}
          <Modal
            visible={showSemesterModal}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setShowSemesterModal(false)}
          >
            <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 }}>
              <View style={{ backgroundColor: 'white', borderRadius: 8, padding: 16, maxHeight: '80%' }}>
                <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 16 }}>Select Semester</Text>
                <ScrollView>
                  {isLoadingSemesters ? (
                    <ActivityIndicator style={{ marginVertical: 20 }} />
                  ) : (
                    semesters.map((semester) => (
                      <Pressable
                        key={semester._id}
                        style={[
                          { padding: 12, borderBottomWidth: 1, borderBottomColor: '#eee' },
                          selectedSemester === semester._id && { backgroundColor: '#e6ffe6' }
                        ]}
                        onPress={() => handleSemesterSelect(semester)}
                      >
                        <Text style={{ fontSize: 16 }}>{semester.title}</Text>
                      </Pressable>
                    ))
                  )}
                </ScrollView>
                <Pressable
                  style={{ marginTop: 16, padding: 12, backgroundColor: '#f0f0f0', borderRadius: 4 }}
                  onPress={() => setShowSemesterModal(false)}
                >
                  <Text style={{ textAlign: 'center' }}>Cancel</Text>
                </Pressable>
              </View>
            </View>
          </Modal>

          {/* Quarter Selection - Always show if semester is selected */}
          {selectedSemester && (
            <>
              <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 8 }}>Quarter</Text>
              <Pressable
                style={[
                  { height: 40, borderWidth: 1, borderColor: '#ccc', borderRadius: 4, paddingHorizontal: 8, marginBottom: 16, justifyContent: 'center' },
                  errors.quarter && { borderColor: 'red' }
                ]}
                onPress={() => setShowQuarterModal(true)}
              >
                <Text>{selectedQuarterTitle || 'Select Quarter'}</Text>
              </Pressable>
              {errors.quarter && <Text style={{ color: 'red', marginBottom: 8 }}>{errors.quarter}</Text>}

              {/* Quarter Selection Modal */}
              <Modal
                visible={showQuarterModal}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowQuarterModal(false)}
              >
                <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 }}>
                  <View style={{ backgroundColor: 'white', borderRadius: 8, padding: 16, maxHeight: '80%' }}>
                    <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 16 }}>Select Quarter</Text>
                    <ScrollView>
                      {isLoadingQuarters ? (
                        <ActivityIndicator style={{ marginVertical: 20 }} />
                      ) : quarters.length > 0 ? (
                        quarters.map((quarter) => (
                          <Pressable
                            key={quarter._id}
                            style={[
                              { padding: 12, borderBottomWidth: 1, borderBottomColor: '#eee' },
                              selectedQuarter === quarter._id && { backgroundColor: '#e6ffe6' }
                            ]}
                            onPress={() => handleQuarterSelect(quarter)}
                          >
                            <Text style={{ fontSize: 16 }}>{quarter.title}</Text>
                          </Pressable>
                        ))
                      ) : (
                        <Text style={{ padding: 12, textAlign: 'center', color: '#666' }}>No quarters available</Text>
                      )}
                    </ScrollView>
                    <Pressable
                      style={{ marginTop: 16, padding: 12, backgroundColor: '#f0f0f0', borderRadius: 4 }}
                      onPress={() => setShowQuarterModal(false)}
                    >
                      <Text style={{ textAlign: 'center' }}>Cancel</Text>
                    </Pressable>
                  </View>
                </View>
              </Modal>
            </>
          )}
        </>
      )}

      {/* Course Description */}
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 8 }}>Course Description</Text>
      <TextInput 
        style={[
          { height: 100, borderWidth: 1, borderColor: '#ccc', borderRadius: 4, paddingHorizontal: 8, textAlignVertical: 'top', marginBottom: 16 },
          errors.courseDescription && { borderColor: 'red' }
        ]} 
        multiline 
        placeholder='Course Description (5-500 characters)'
        placeholderTextColor="#999999"
        value={courseDescription}
        onChangeText={setCourseDescription}
        maxLength={500}
      />
      {errors.courseDescription && <Text style={{ color: 'red', marginBottom: 8 }}>{errors.courseDescription}</Text>}

      {/* Teaching Points */}
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 8 }}>What you will teach in this course (max 6)</Text>
      {teachingPoints.map((point: string, index: number) => (
        <View key={index} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
          <Text style={{ marginRight: 8 }}>{String(index + 1).padStart(2, '0')}</Text>
          <TextInput
            style={{ flex: 1, height: 40, borderWidth: 1, borderColor: '#ccc', borderRadius: 4, paddingHorizontal: 8, marginRight: 8 }}
            placeholder='Teaching point (5-120 characters)'
            placeholderTextColor="#999999"
            value={point}
            onChangeText={(text) => handleTeachingPointChange(index, text)}
            maxLength={120}
          />
          {teachingPoints.length > 1 && (
            <Pressable onPress={() => removeTeachingPoint(index)}>
              <Text style={{ color: 'red' }}>Remove</Text>
            </Pressable>
          )}
        </View>
      ))}
      {errors.teachingPoints && <Text style={{ color: 'red', marginBottom: 8 }}>{errors.teachingPoints}</Text>}
      {teachingPoints.length < 6 && (
        <Pressable style={{ alignSelf: 'flex-start', padding: 8 }} onPress={addTeachingPointInput}>
          <Text style={{ color: 'blue' }}>+ Add Teaching Point</Text>
        </Pressable>
      )}

      {/* Course Requirements */}
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 8, marginTop: 16 }}>Course Requirements (max 6)</Text>
      {courseRequirements.map((requirement: string, index: number) => (
        <View key={index} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
          <Text style={{ marginRight: 8 }}>{String(index + 1).padStart(2, '0')}</Text>
          <TextInput
            style={{ flex: 1, height: 40, borderWidth: 1, borderColor: '#ccc', borderRadius: 4, paddingHorizontal: 8, marginRight: 8 }}
            placeholder='Requirement (5-120 characters)'
            placeholderTextColor="#999999"
            value={requirement}
            onChangeText={(text) => handleRequirementChange(index, text)}
            maxLength={120}
          />
          {courseRequirements.length > 1 && (
            <Pressable onPress={() => removeRequirement(index)}>
              <Text style={{ color: 'red' }}>Remove</Text>
            </Pressable>
          )}
        </View>
      ))}
      {errors.requirements && <Text style={{ color: 'red', marginBottom: 8 }}>{errors.requirements}</Text>}
      {courseRequirements.length < 6 && (
        <Pressable style={{ alignSelf: 'flex-start', padding: 8 }} onPress={addRequirementInput}>
          <Text style={{ color: 'blue' }}>+ Add Requirement</Text>
        </Pressable>
      )}

      {/* Syllabus Upload */}
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 8, marginTop: 16 }}>Upload Syllabus (PDF)</Text>
      <View style={{ height: 60, borderWidth: 1, borderStyle: 'dashed', borderColor: '#ccc', justifyContent: 'center', alignItems: 'center', marginBottom: 16 }}>
        {selectedSyllabusFile ? (
          <View style={{ width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ color: 'green', fontWeight: 'bold' }}>✓ {selectedSyllabusFile.name}</Text>
            <Pressable 
              style={{ 
                marginTop: 4,
                backgroundColor: 'rgba(0,0,0,0.7)', 
                padding: 4, 
                borderRadius: 4 
              }} 
              onPress={handleSyllabusUpload}
            >
              <Text style={{ color: 'white', fontSize: 12 }}>Change</Text>
            </Pressable>
          </View>
        ) : (
          <Pressable style={{ padding: 8, borderWidth: 1, borderColor: '#ccc', borderRadius: 4 }} onPress={handleSyllabusUpload}>
            <Text>Upload PDF Syllabus</Text>
          </Pressable>
        )}
      </View>
      {errors.syllabus && <Text style={{ color: 'red', marginBottom: 8 }}>{errors.syllabus}</Text>}

      {/* Create Button */}
      <Pressable 
        style={{ 
          backgroundColor: isLoading ? '#ccc' : 'green', 
          padding: 16, 
          borderRadius: 8, 
          alignItems: 'center', 
          marginTop: 24, 
          marginBottom: 36 
        }}
        onPress={handleCreateCourse}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>Create Course</Text>
        )}
      </Pressable>

    </ScrollView>
  );
};

export default CreateCoursePage; 