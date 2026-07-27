import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    TextInput,
    ScrollView,
    Alert,
} from 'react-native';
import SimpleIcon from '../SimpleIcon';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GradeScaleItem } from '../../types/course';

interface GradeScaleModalProps {
    visible: boolean;
    onClose: () => void;
    onSave?: (gradeScales: { grade: string; min: number; max: number }[]) => void;
    initialGradeScales?: GradeScaleItem[];
}

const GradeScaleModal: React.FC<GradeScaleModalProps> = ({
    visible,
    onClose,
    onSave,
    initialGradeScales = [],
}) => {
    const insets = useSafeAreaInsets();
    const [gradeScales, setGradeScales] = useState<GradeScaleItem[]>(initialGradeScales);
    const [newGrade, setNewGrade] = useState({
        grade: '',
        minInput: '90',
        maxInput: '100',
    });

    useEffect(() => {
        if (initialGradeScales.length > 0) {
            setGradeScales(initialGradeScales);
        }
    }, [initialGradeScales]);

    const getNextRange = (scales: GradeScaleItem[] = gradeScales) => {
        if (scales.length === 0) return { min: 90, max: 100 };

        const sorted = [...scales].sort((a, b) => a.min - b.min);
        const lowest = sorted[0];

        const nextMax = lowest.min - 0.01;
        const nextMin = Math.max(0, nextMax - 9.99);

        return { min: parseFloat(nextMin.toFixed(2)), max: parseFloat(nextMax.toFixed(2)) };
    };

    const handleAddGrade = () => {
        if (isScaleComplete()) {
            Alert.alert('Notice', 'Grade scale already covers 0% to 100%.');
            return;
        }

        const { grade, minInput, maxInput } = newGrade;
        const min = parseFloat(minInput);
        const max = parseFloat(maxInput);

        if (!grade.trim()) {
            Alert.alert('Error', 'Please enter a grade letter.');
            return;
        }

        if (isNaN(min) || isNaN(max)) {
            Alert.alert('Error', 'Please enter valid numbers for min and max.');
            return;
        }

        if (min < 0 || max > 100 || min >= max) {
            Alert.alert('Error', 'Invalid percentage range.');
            return;
        }

        // Check for overlapping with existing grades
        for (const g of gradeScales) {
            const overlaps = !(max < g.min || min > g.max);
            if (overlaps) {
                Alert.alert(
                    'Error',
                    `The range ${min}% - ${max}% overlaps with existing grade ${g.grade} (${g.min}% - ${g.max}%).`
                );
                return;
            }
        }

        if (gradeScales.some(g => g.grade.toUpperCase() === grade.toUpperCase())) {
            Alert.alert('Error', 'This grade already exists.');
            return;
        }

        const newEntry: GradeScaleItem = {
            _id: Date.now().toString(),
            grade: grade.toUpperCase(),
            min,
            max,
        };

        const updatedScales = [...gradeScales, newEntry];
        setGradeScales(updatedScales);

        const nextRange = getNextRange(updatedScales);

        if (nextRange.min === 0) {
            setNewGrade({ grade: '', minInput: '0', maxInput: '0' });
        } else {
            setNewGrade({
                grade: '',
                minInput: nextRange.min.toString(),
                maxInput: nextRange.max.toString()
            });
        }
    };

    const handleReset = () => {
        console.log('yes')
        setGradeScales([]);
        setNewGrade({ grade: '', minInput: '90', maxInput: '100' });
    };

    const handleSave = () => {
        if (gradeScales.length === 0) {
            Alert.alert('Error', 'Please add at least one grade.');
            return;
        }

        // Ensure scale covers 0–100
        const sorted = [...gradeScales].sort((a, b) => a.min - b.min);
        if (sorted[0].min !== 0) {
            Alert.alert('Error', 'Grade scale must start at 0%.');
            return;
        }

        const payload = gradeScales.map(g => ({
            grade: g.grade,
            min: g.min,
            max: g.max,
        }));

        onSave?.(payload);
        handleReset()
    };

    const getPercentageBarWidth = (min: number, max: number) => ((max - min) / 100) * 100;

    const isScaleComplete = () => {
        if (gradeScales.length === 0) return false;
        const sorted = [...gradeScales].sort((a, b) => a.min - b.min);
        return sorted[0].min === 0 && sorted[sorted.length - 1].max === 100;
    };

    return (
        <Modal animationType="slide" transparent={false} visible={visible} onRequestClose={onClose}>
            <View style={styles.container}>
                {/* Header */}
                <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
                    <TouchableOpacity style={styles.backButton} onPress={onClose}>
                        <SimpleIcon name="arrow-back" size={24} color="#10B144" />
                    </TouchableOpacity>
                    <Text style={styles.title}>Grade Scale</Text>
                    <View style={{ width: 40 }} />
                </View>

                <ScrollView style={styles.content} showsVerticalScrollIndicator={false}
                  showsHorizontalScrollIndicator={false}
                >
                    {/* Add Grade */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Add New Grade</Text>

                        <View style={styles.inputRow}>
                            <View style={styles.inputContainer}>
                                <Text style={styles.inputLabel}>Grade Letter</Text>
                                <TextInput
                                    style={styles.textInput}
                                    placeholder="A, B+, C"
                                    value={newGrade.grade}
                                    onChangeText={text => setNewGrade(prev => ({ ...prev, grade: text }))}
                                    autoCapitalize="characters"
                                />
                            </View>
                        </View>

                        <View style={styles.inputRow}>
                            <View style={styles.inputContainer}>
                                <Text style={styles.inputLabel}>Min %</Text>
                                <TextInput
                                    style={styles.textInput}
                                    keyboardType="decimal-pad"
                                    value={newGrade.minInput}
                                    onChangeText={t => setNewGrade(prev => ({ ...prev, minInput: t }))}
                                />
                            </View>

                            <View style={styles.inputContainer}>
                                <Text style={styles.inputLabel}>Max %</Text>
                                <TextInput
                                    style={styles.textInput}
                                    keyboardType="decimal-pad"
                                    value={newGrade.maxInput}
                                    onChangeText={t => setNewGrade(prev => ({ ...prev, maxInput: t }))}
                                />
                            </View>
                        </View>

                        <View style={styles.buttonRow}>
                            <TouchableOpacity
                                style={[styles.addButton, isScaleComplete() && styles.addButtonDisabled]}
                                onPress={handleAddGrade}
                                disabled={isScaleComplete()}
                            >
                                <SimpleIcon name="add" size={20} color="#fff" />
                                <Text style={styles.addButtonText}>
                                    {isScaleComplete() ? 'Completed' : 'Add Grade'}
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
                                <SimpleIcon name="refresh" size={20} color="#10B144" />
                                <Text style={styles.resetButtonText}>Reset</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Existing Grades */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Grade Scale</Text>

                        {gradeScales.length === 0 ? (
                            <View style={styles.emptyContainer}>
                                <SimpleIcon name="clipboard-outline" size={48} color="#aaa" />
                                <Text style={styles.emptyText}>No grades added yet</Text>
                                <Text style={styles.emptySubtext}>Start by adding your first grade above</Text>
                            </View>
                        ) : (
                            gradeScales.map(item => (
                                <View key={item._id} style={styles.gradeRow}>
                                    <View style={styles.gradeBadge}>
                                        <Text style={styles.gradeText}>{item.grade}</Text>
                                    </View>

                                    <View style={styles.rangeTextContainer}>
                                        <Text style={styles.rangeText}>
                                            {item.min}% - {item.max}%
                                        </Text>
                                    </View>

                                    <View style={styles.progressBar}>
                                        <View
                                            style={[
                                                styles.progressFill,
                                                { width: `${getPercentageBarWidth(item.min, item.max)}%` },
                                            ]}
                                        />
                                    </View>
                                </View>
                            ))
                        )}

                        {isScaleComplete() && (
                            <View style={styles.completionContainer}>
                                <SimpleIcon name="check-circle" size={20} color="#10B144" />
                                <Text style={styles.completionText}>Perfect! Scale covers 0% to 100%</Text>
                            </View>
                        )}
                    </View>
                </ScrollView>

                {/* Save Button */}
                {isScaleComplete() && (
                    <View style={styles.footer}>
                        <TouchableOpacity style={styles.createButton} onPress={handleSave}>
                            <Text style={styles.createButtonText}>Create</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8f8f8' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingBottom: 15,
        paddingHorizontal: 20,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    backButton: { marginRight: 10 },
    title: { fontSize: 22, fontWeight: 'bold', color: '#10B144' },
    content: { padding: 16 },
    section: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 15 },
    inputRow: { flexDirection: 'row', marginBottom: 12 },
    inputContainer: { flex: 1, marginRight: 10 },
    inputLabel: { fontSize: 14, color: '#333', marginBottom: 6, fontWeight: '500' },
    textInput: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 10,
        fontSize: 16,
        backgroundColor: '#fff',
    },
    buttonRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#10B144',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 8,
        flex: 1,
        justifyContent: 'center',
        marginRight: 10,
    },
    addButtonText: { color: '#fff', fontSize: 16, fontWeight: '600', marginLeft: 6 },
    resetButton: {
        flexDirection: 'row',
        alignItems: 'center',
        borderColor: '#10B144',
        borderWidth: 1,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 8,
        flex: 1,
        justifyContent: 'center',
    },
    resetButtonText: { color: '#10B144', fontSize: 16, fontWeight: '600', marginLeft: 6 },
    gradeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    gradeBadge: {
        backgroundColor: '#10B144',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
    },
    gradeText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
    rangeTextContainer: { flex: 1, marginLeft: 10 },
    rangeText: { color: '#333', fontSize: 16 },
    progressBar: {
        height: 8,
        backgroundColor: '#e0e0e0',
        borderRadius: 4,
        overflow: 'hidden',
        width: 100,
    },
    progressFill: { height: '100%', backgroundColor: '#10B144' },
    emptyContainer: { alignItems: 'center', paddingVertical: 40 },
    emptyText: { fontSize: 18, fontWeight: '600', color: '#666', marginTop: 12 },
    emptySubtext: { fontSize: 14, color: '#999' },
    completionContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#e8f5e8',
        padding: 10,
        borderRadius: 8,
        marginTop: 10,
    },
    completionText: { color: '#10B144', marginLeft: 6, fontWeight: '600' },
    footer: {
        backgroundColor: '#fff',
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    createButton: {
        backgroundColor: '#10B144',
        padding: 14,
        borderRadius: 8,
        alignItems: 'center',
    },
    createButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
    addButtonDisabled: {
        backgroundColor: '#ccc',
    },
});

export default GradeScaleModal;