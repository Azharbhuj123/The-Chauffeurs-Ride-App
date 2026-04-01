import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';

interface DropdownItem {
  [key: string]: any;
}

interface CustomDropdownProps {
  data: DropdownItem[];
  placeholder?: string;
  value?: string | number | null;
  onChange?: (item: DropdownItem) => void;
  labelField?: string;
  valueField?: string;
  style?: ViewStyle;
  containerStyle?: ViewStyle;
}

const CustomDropdown: React.FC<CustomDropdownProps> = ({
  data = [],
  placeholder = 'Select option',
  value,
  onChange,
  labelField = 'label',
  valueField = 'value',
  style = {},
  containerStyle = {},
}) => {
  const [localValue, setLocalValue] = useState<string | number | null>(value || null);

  // Sync internal state if prop value changes
  useEffect(() => {
    setLocalValue(value || null);
  }, [value]);

  const handleChange = (item: DropdownItem) => {
    setLocalValue(item[valueField]);
    if (onChange) onChange(item);
  };

  return (
    <View style={[styles.container, containerStyle]}>
      <Dropdown
        style={[styles.dropdown, style]}
        containerStyle={styles.listContainer} 
        itemTextStyle={styles.itemText}      
        selectedTextStyle={styles.itemText}  
        placeholderStyle={styles.placeholder} 
        
        // --- SCREEN OVERLAP FIXES ---
        dropdownPosition="auto"      // Automatic top/bottom adjustment
        maxHeight={220}             // List ki height kam rakhi hai taake buttons tak na pohnche
        statusBarTranslucent={true} // Status bar ke overlap ko handle karta hai
        
        flatListProps={{
          contentContainerStyle: {
            paddingBottom: 10,      // List ke andar niche thori jagah
          },
          bounces: false,           // Faltu ki scrolling rokne ke liye
        }}
        // ---------------------------

        data={data}
        labelField={labelField}
        valueField={valueField}
        placeholder={placeholder}
        value={localValue}
        onChange={handleChange}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  dropdown: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
  },
  listContainer: {
    backgroundColor: '#fff', 
    borderRadius: 8,
    // Agar list abhi bhi buttons ke peeche ho, to niche wali line uncomment karein:
    // bottom: 10, 
    elevation: 5, // Android shadow taake list alag nazar aaye
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  itemText: {
    color: '#000', 
    fontSize: 14,
    fontFamily: "Poppins-Regular",
  },
  placeholder: {
    color: '#666', 
    fontSize: 15,
    fontFamily: "Poppins-Regular",
  }
});

export default CustomDropdown;