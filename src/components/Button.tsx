// @ts-nocheck
import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Platform, Dimensions } from 'react-native'
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
const { width, height } = Dimensions.get('window');

const fs = (size) => {
    return Math.sqrt((height * height) + (width * width)) * (size / 1000);
};

type ButtonProps = {
    title: string;
    onPress: () => void;
    color: string;
    textColor:string;
};

export default function Button({ title, onPress, color = "#FDD835" ,textColor = "#000"}: ButtonProps) {

    return (
        <View>
            <TouchableOpacity
                style={[{ backgroundColor: color ? color : "#FDD835" }, styles.signUpButton]}
                onPress={onPress}
                activeOpacity={0.8}
            >
                <Text style={[{color: textColor ? textColor : "#000"},styles.signUpButtonText]}>{title}</Text>
            </TouchableOpacity>

        </View>
    )



}


const styles = StyleSheet.create({
    signUpButton: {
        borderRadius: wp(6),
        paddingVertical: hp(2),
        alignItems: 'center',
        marginTop: hp(0.1),
        marginBottom: hp(2.5),
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
            },
            android: {
                elevation: 3,
            },
        }),
    },
    signUpButtonText: {
        fontSize: fs(16),
    },
})