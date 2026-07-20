
import React, { SetStateAction } from "react";
import { View, Text, StyleSheet, StyleProp, ViewStyle } from "react-native";
import DropDownPicker from "react-native-dropdown-picker";


// ========== DropdownFilter Component ==========
interface DropdownFilterProps {
    open: boolean;
    value: string | null;
    items: { label: string; value: string }[];
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setValue: React.Dispatch<SetStateAction<string | null>>;
    placeholder: string;
    zIndex: number;
    zIndexInverse?: number;
    disabled?: boolean;
    dropDownContainerStyle?: StyleProp<ViewStyle>;
    dropDownDirection?: "AUTO" | "TOP" | "BOTTOM";
    listMode?: "MODAL" | "SCROLLVIEW"; // optional
    style?: StyleProp<ViewStyle>;
}

export const DropdownFilter: React.FC<DropdownFilterProps> = ({
    open,
    value,
    items,
    setOpen,
    setValue,
    placeholder,
    zIndex,
    zIndexInverse = 0,
    disabled = false,
    dropDownContainerStyle,
    dropDownDirection = "BOTTOM",
    listMode = "SCROLLVIEW",
    style,
}) => {
    return (
        <View style={[styles.dropdownWrapper, { zIndex: open ? zIndex : 1 }]}>
            <DropDownPicker
                open={open}
                value={value}
                items={items}
                setOpen={setOpen}
                setValue={setValue}
                setItems={() => { }}
                placeholder={placeholder}
                disabled={disabled}
                style={[styles.dropdownPicker, style]}
                containerStyle={styles.dropdownContainerStyle}
                dropDownContainerStyle={[
                    styles.dropdownListStyle,
                    dropDownContainerStyle,
                ]}
                zIndex={zIndex}
                zIndexInverse={zIndexInverse}
                dropDownDirection={dropDownDirection}
                listMode={listMode}
            />
        </View>
    );
};


const styles = StyleSheet.create({
    // DropdownFilter styles
    dropdownWrapper: {
        // flex: 1,
        // backgroundColor: 'cyan',
        alignSelf: 'flex-end',
        width: "98%"
    },
    dropdownPicker: {
        // backgroundColor: "#fff",
        // backgroundColor: "pink",
        borderColor: "#10B144",
        borderRadius: 8,
        width: "100%",
    },
    dropdownContainerStyle: {
        // zIndex managed by wrapper View
    },
    dropdownListStyle: {
        borderColor: "#10B144",
    },
});