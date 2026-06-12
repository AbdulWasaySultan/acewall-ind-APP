// AssessmentSettingsModal.tsx

import React, { useState } from 'react';
import {
    View, Text, Modal, TouchableOpacity,
    StyleSheet, Switch, TextInput, FlatList,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SimpleIcon from '../SimpleIcon';

interface Props {
    visible: boolean;
    onClose: () => void;
}

// ─── Reusable inline dropdown ───────────────────────────────────────────────
interface DropdownPickerProps {
    label: string;
    options: string[];
    selected: string;
    onSelect: (value: string) => void;
}

const DropdownPicker: React.FC<DropdownPickerProps> = ({
    label, options, selected, onSelect,
}) => {
    const [open, setOpen] = useState(false);

    return (
        <View style={dp.wrapper}>
            <Text style={dp.label}>{label}</Text>
            <TouchableOpacity
                style={dp.trigger}
                onPress={() => setOpen(prev => !prev)}
                activeOpacity={0.7}
            >
                <Text style={dp.triggerText}>{selected}</Text>
                <SimpleIcon name={open ? 'chevron-up' : 'chevron-down'} size={16} color="#6B7280" />
            </TouchableOpacity>

            {open && (
                <View style={dp.listBox}>
                    {options.map(opt => (
                        <TouchableOpacity
                            key={opt}
                            style={[dp.option, opt === selected && dp.optionSelected]}
                            onPress={() => { onSelect(opt); setOpen(false); }}
                        >
                            <Text style={[dp.optionText, opt === selected && dp.optionTextSelected]}>
                                {opt}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            )}
        </View>
    );
};

const dp = StyleSheet.create({
    wrapper: { marginTop: 16 },
    label: { fontSize: 13, color: '#6B7280', marginBottom: 6 },
    trigger: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 11,
        backgroundColor: '#fff',
    },
    triggerText: { fontSize: 14, color: '#111827', flex: 1 },
    listBox: {
        marginTop: 4,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 8,
        backgroundColor: '#fff',
        overflow: 'hidden',
        zIndex: 99,
    },
    option: { paddingHorizontal: 12, paddingVertical: 11 },
    optionSelected: { backgroundColor: '#F0FDF4' },
    optionText: { fontSize: 14, color: '#374151' },
    optionTextSelected: { color: '#10B981', fontWeight: '600' },
});
// ─────────────────────────────────────────────────────────────────────────────

const FREQUENCY_OPTIONS = [
    'One-Time (Flat penalty)',
    'Daily (Per Day Late)',
];

const UNIT_OPTIONS = [
    'Fixed Points',
    'Percentage (%)',
];

const AssessmentSettingsModal: React.FC<Props> = ({ visible, onClose }) => {
    const insets = useSafeAreaInsets();

    const [allowResubmission, setAllowResubmission] = useState(true);
    const [latePenaltyEnabled, setLatePenaltyEnabled] = useState(true);
    const [frequency, setFrequency] = useState('One-Time (Flat penalty)');
    const [unit, setUnit] = useState('Fixed Points');
    const [penalty, setPenalty] = useState('3');

    // Derive label for "Penalty Amount" based on frequency selection
    const penaltyLabel = frequency === 'One-Time (Flat penalty)'
        ? 'Daily (per Day Late)'
        : 'One-Time (Flat penalty)';

    const unitSuffix = unit === 'Percentage (%)' ? '%' : 'pts';

    return (
        <Modal visible={visible} animationType="slide">
            <View style={[styles.container, { paddingTop: 20 }]}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backBtn} onPress={onClose}>
                        <Icon name="arrow-back" size={20} color="black" />
                    </TouchableOpacity>
                    <Text style={styles.title}>Setting</Text>
                    <View style={styles.headerSpacer} />
                </View>
                {/* Allow Resubmission */}
                <View style={styles.resubRow}>
                    <TouchableOpacity
                        style={[styles.checkbox, allowResubmission && styles.checkboxChecked]}
                        onPress={() => setAllowResubmission(prev => !prev)}
                        activeOpacity={0.7}
                    >
                        {allowResubmission && (
                            <Icon name="check" size={14} color="#fff" />
                        )}
                    </TouchableOpacity>
                    <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text style={styles.label}>Allow Resubmission</Text>
                        <Text style={styles.hintText}>Students can submit multiple times.</Text>
                    </View>
                </View>

                {/* Late Submission Penalty */}
                <View style={styles.card}>

                    {/* Header row */}
                    <View style={styles.row}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.cardTitle}>Late Submission Penalty</Text>
                            <Text style={styles.subText}>
                                Automatically deduct marks when students submit after the deadline.
                            </Text>
                        </View>
                        <View style={styles.toggleRow}>
                            <Switch
                                value={latePenaltyEnabled}
                                onValueChange={setLatePenaltyEnabled}
                                trackColor={{ true: '#111827' }}
                            />
                            <Text style={styles.toggleLabel}>
                                {latePenaltyEnabled ? 'Enabled' : 'Disabled'}
                            </Text>
                        </View>
                    </View>

                    {/* ── Fields shown only when enabled ─────────────────────────── */}
                    {latePenaltyEnabled && (
                        <>
                            {/* Two dropdowns side-by-side */}
                            <View style={styles.dropdownRow}>
                                <View style={{ flex: 1, marginRight: 8 }}>
                                    <DropdownPicker
                                        label="Deduction Frequency"
                                        options={FREQUENCY_OPTIONS}
                                        selected={frequency}
                                        onSelect={setFrequency}
                                    />
                                </View>
                                <View style={{ flex: 1, marginLeft: 8 }}>
                                    <DropdownPicker
                                        label="Deduction Unit"
                                        options={UNIT_OPTIONS}
                                        selected={unit}
                                        onSelect={setUnit}
                                    />
                                </View>
                            </View>

                            {/* Penalty amount + Save */}
                            <View style={styles.amountRow}>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.inputLabel}>{penaltyLabel}</Text>
                                    <View style={styles.inputWrapper}>
                                        <TextInput
                                            value={penalty}
                                            onChangeText={setPenalty}
                                            style={styles.input}
                                            keyboardType="numeric"
                                        />
                                        <Text style={styles.unitSuffix}>{unitSuffix}</Text>
                                    </View>
                                </View>
                                <TouchableOpacity style={styles.saveInlineBtn}>
                                    <SimpleIcon name="save" size={16} color="#fff" />
                                    <Text style={styles.saveInlineText}>Save Settings</Text>
                                </TouchableOpacity>
                            </View>

                            {/* Policy Preview */}
                            <View style={styles.previewBox}>
                                <View style={styles.previewHeader}>
                                    <SimpleIcon name="info" size={15} color="#6B7280" />
                                    <Text style={styles.previewTitle}>Policy Preview</Text>
                                </View>
                                <Text style={styles.previewText}>
                                    A student submitting{' '}
                                    <Text style={styles.bold}>3 days late</Text>
                                    {'\n'}will lose{'\n'}
                                    <Text style={styles.redBold}>
                                        {penalty} {unit === 'Percentage (%)' ? '%' : 'marks'}
                                    </Text>
                                    {'\n'}from their raw earned score.
                                </Text>
                            </View>
                        </>
                    )}
                </View>

            </View>
        </Modal>
    );
};

export default AssessmentSettingsModal;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9fafb',
        paddingHorizontal: 16,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 19,
        backgroundColor: '#ffffff',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowRadius: 4,
        shadowOpacity: 0.12,
        elevation: 3,
    },
    title: {
        flex: 1,
        textAlign: 'center',
        fontSize: 20,
        fontWeight: 'bold',
        color: '#111827',
    },
    headerSpacer: {
        width: 38,
    },

    // Allow Resubmission row
    resubRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 14,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        marginBottom: 4,
    },
    label: { fontSize: 15 },
    hintText: { fontSize: 13, color: '#9CA3AF', marginRight: 12 },

    // Card
    card: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        marginTop: 16,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    cardTitle: { fontSize: 17, fontWeight: 'bold' },
    subText: { marginTop: 4, color: '#6B7280', fontSize: 13 },
    toggleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 8,
    },
    toggleLabel: { marginLeft: 6, fontSize: 13, color: '#374151' },

    // Dropdowns
    dropdownRow: {
        flexDirection: 'row',
        marginTop: 4,
    },

    // Amount row
    amountRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        marginTop: 16,
        gap: 12,
    },
    inputLabel: { fontSize: 13, color: '#6B7280', marginBottom: 6 },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 8,
        paddingHorizontal: 12,
        backgroundColor: '#fff',
    },
    checkbox: {
        width: 22,
        height: 22,
        borderRadius: 5,
        borderWidth: 2,
        borderColor: '#3B82F6',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
    },
    checkboxChecked: {
        backgroundColor: '#3B82F6',
        borderColor: '#3B82F6',
    },
    input: {
        flex: 1,
        paddingVertical: 7,
        fontSize: 14,
        color: '#111827',
    },
    unitSuffix: { fontSize: 13, color: '#9CA3AF', marginLeft: 4 },

    saveInlineBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#111827',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 8,
        gap: 6,
    },
    saveInlineText: { color: '#fff', fontWeight: '600', fontSize: 14 },

    // Preview
    previewBox: {
        marginTop: 16,
        padding: 14,
        backgroundColor: '#F9FAFB',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    previewHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        gap: 6,
    },
    previewTitle: { fontWeight: '600', fontSize: 14 },
    previewText: { fontSize: 14, color: '#374151', lineHeight: 22 },
    bold: { fontWeight: 'bold' },
    redBold: { color: '#EF4444', fontWeight: 'bold' },
});