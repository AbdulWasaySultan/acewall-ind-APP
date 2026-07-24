import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
} from 'react-native';
import GradeScaleModal from '../components/GradeScaleModal';
import SimpleIcon from '../components/SimpleIcon';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface GradeScale {
    id: string;
    letter: string;
    minPercentage: number;
    maxPercentage: number;
}

const GradeScaleManagementPage: React.FC = () => {
    const insets = useSafeAreaInsets();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [gradeScales, setGradeScales] = useState<GradeScale[]>([
        { id: '1', letter: 'A', minPercentage: 90, maxPercentage: 100 },
        { id: '2', letter: 'B', minPercentage: 80, maxPercentage: 89.99 },
        { id: '3', letter: 'C', minPercentage: 70, maxPercentage: 79.99 },
        { id: '4', letter: 'D', minPercentage: 60, maxPercentage: 69.99 },
    ]);

    const handleManageGradeScale = () => {
        setIsModalVisible(true);
    };

    const handleSaveGradeScales = (newGradeScales: GradeScale[]) => {
        setGradeScales(newGradeScales);
        console.log('Grade scales saved:', newGradeScales);
        // Here you would typically save to your backend
        // await saveGradeScalesToBackend(newGradeScales);
    };

    const getPercentageBarWidth = (min: number, max: number) => {
        return ((max - min) / 100) * 100;
    };

    return (
        <View style={styles.container}>
            <ScrollView style={styles.content}>
                {/* Header */}
                <View style={[styles.header, { paddingTop: insets.top }]}>
                    <TouchableOpacity style={styles.backButton}>
                        <SimpleIcon name="arrow-back" size={24} color="#333" />
                        <Text style={styles.backText}>Back</Text>
                    </TouchableOpacity>
                    <Text style={styles.title}>Grade Scale</Text>
                    <TouchableOpacity style={styles.manageButton} onPress={handleManageGradeScale}>
                        <Text style={styles.manageButtonText}>Manage Grade Scale</Text>
                    </TouchableOpacity>
                </View>

                {/* Grade Scale Display */}
                <View style={styles.gradeScaleCard}>
                    <Text style={styles.sectionTitle}>Current Grade Scale</Text>

                    {gradeScales.map((grade) => (
                        <View key={grade.id} style={styles.gradeRow}>
                            <View style={styles.gradeColumn}>
                                <View style={styles.gradeBadge}>
                                    <Text style={styles.gradeText}>{grade.letter}</Text>
                                </View>
                            </View>

                            <View style={styles.rangeColumn}>
                                <Text style={styles.rangeText}>
                                    {grade.minPercentage}% - {grade.maxPercentage}%
                                </Text>
                            </View>

                            <View style={styles.percentageColumn}>
                                <View style={styles.percentageBar}>
                                    <View
                                        style={[
                                            styles.percentageFill,
                                            { width: `${getPercentageBarWidth(grade.minPercentage, grade.maxPercentage)}%` }
                                        ]}
                                    />
                                </View>
                            </View>
                        </View>
                    ))}

                    {/* Instructions */}
                    <View style={styles.instructionsCard}>
                        <Text style={styles.instructionsTitle}>Instructions</Text>
                        <Text style={styles.instructionsText}>
                            • Click "Manage Grade Scale" to create or modify your grading scale
                        </Text>
                        <Text style={styles.instructionsText}>
                            • Only letters A-F and +/- symbols are allowed for grade letters
                        </Text>
                        <Text style={styles.instructionsText}>
                            • Percentage ranges are automatically calculated (90-100, 80-89.99, etc.)
                        </Text>
                        <Text style={styles.instructionsText}>
                            • Ensure your grade scale covers the full 0-100% range
                        </Text>
                    </View>
                </View>
            </ScrollView>

            {/* Grade Scale Modal */}
            <GradeScaleModal
                visible={isModalVisible}
                onClose={() => setIsModalVisible(false)}
                onSave={handleSaveGradeScales}
                initialGradeScales={gradeScales}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    content: {
        flex: 1,
        padding: 20,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    backText: {
        fontSize: 16,
        color: '#333',
        marginLeft: 8,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        flex: 1,
        textAlign: 'center',
    },
    manageButton: {
        backgroundColor: '#10B144',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    manageButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    gradeScaleCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 20,
    },
    gradeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    gradeColumn: {
        width: 80,
    },
    gradeBadge: {
        backgroundColor: '#10B144',
        borderRadius: 16,
        paddingHorizontal: 12,
        paddingVertical: 6,
        alignSelf: 'flex-start',
    },
    gradeText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    },
    rangeColumn: {
        flex: 1,
        paddingHorizontal: 15,
    },
    rangeText: {
        fontSize: 16,
        color: '#333',
        fontWeight: '500',
    },
    percentageColumn: {
        width: 100,
    },
    percentageBar: {
        height: 8,
        backgroundColor: '#e0e0e0',
        borderRadius: 4,
        overflow: 'hidden',
    },
    percentageFill: {
        height: '100%',
        backgroundColor: '#10B144',
        borderRadius: 4,
    },
    instructionsCard: {
        backgroundColor: '#f8f9fa',
        borderRadius: 12,
        padding: 16,
        marginTop: 20,
        borderLeftWidth: 4,
        borderLeftColor: '#10B144',
    },
    instructionsTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 12,
    },
    instructionsText: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
        lineHeight: 20,
    },
});

export default GradeScaleManagementPage;
