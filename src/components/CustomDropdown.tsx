import React, { useState } from 'react';
import { View, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import { heightPercentageToDP as hp } from 'react-native-responsive-screen';

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

  const handleChange = (item: DropdownItem) => {
    setLocalValue(item[valueField]);
    if (onChange) onChange(item);
  };

  return (
    <View style={[styles.container, containerStyle]}>
      <Dropdown
        style={[styles.dropdown, style]}
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
    width:"100%",
    // marginBottom:hp(2)
  },
  dropdown: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
  },
});

export default CustomDropdown;
