// @ts-nocheck
import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
    Image,
    Dimensions,
    Platform,
    KeyboardAvoidingView,
    ScrollView,
    TouchableWithoutFeedback,
    Keyboard,

} from 'react-native';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import Icon from 'react-native-vector-icons/Ionicons';
import SocialBtns from '../../components/SocialBtns';
import Button from '../../components/Button';

const { width, height } = Dimensions.get('window');



const fs = (size) => {
    return Math.sqrt((height * height) + (width * width)) * (size / 1000);
};

function Login({ navigation }) {
    const [userType, setUserType] = useState('user');
    const [name, setName] = useState('');
    const [emailOrPhone, setEmailOrPhone] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const insets = useSafeAreaInsets(); // ✅ handle top/bottom safe area

    const handleSignUp = () => {
        console.log('Signing up as:', userType);
        console.log('Name:', name);
        console.log('Email/Phone:', emailOrPhone);
        console.log('Password:', password);
        // Add your Sign in logic here
        navigation.navigate("MainTabs")
    };



    return (
        // <SafeAreaView

        // style={{ flex: 1,backgroundColor:"#FDD835"}}
        // >
        <TouchableWithoutFeedback
            onPress={Keyboard.dismiss}
            >
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >

            <StatusBar barStyle="dark-content" backgroundColor='#FDD835' />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Header Section */}
                <View style={styles.header}>
                    <View style={styles.logoContainer}>
                        <Image
                            source={require('../../assets/images/headLogo.png')}
                            style={styles.logo}
                            resizeMode="contain"
                        />
                    </View>
                </View>

                {/* Form Section */}
                <View style={styles.formContainer}>
                    <Text style={styles.title}>Sign In</Text>
                    <Text style={styles.subtitle}>Continue your journey with the Chaffeurs</Text>




                    {/* Email/Phone Input */}
                    <View style={styles.inputContainer}>
                        <Icon name="mail-outline" size={wp(5)} color="#999" style={styles.iconStyle} />
                        <TextInput
                            style={styles.input}
                            placeholder="Email Or Phone No."
                            placeholderTextColor="#999"
                            value={emailOrPhone}
                            onChangeText={setEmailOrPhone}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    </View>

                    {/* Password Input */}
                    <View style={styles.inputContainer}>
                        <Icon name="lock-closed-outline" size={wp(5)} color="#999" style={styles.iconStyle} />
                        <TextInput
                            style={styles.input}
                            placeholder="Password"
                            placeholderTextColor="#999"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry={!showPassword}
                        />
                        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                            <Icon
                                name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                                size={wp(5)}
                                color="#999"
                            />
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity onPress={() => navigation.navigate("Forgot")}>
                        <View style={styles.forgotContainer}>

                            <Text style={styles.forgotText}>Forget password?</Text>
                        </View>

                    </TouchableOpacity>


                    <Button title="Sign In" onPress={handleSignUp} />





                    {/* Social Sign in */}
                    <SocialBtns />


                    {/* Sign in Link */}
                    <View style={styles.signInContainer}>
                        <Text style={styles.signInText}>Don’t have an account? </Text>
                        <TouchableOpacity onPress={() => navigation.navigate("Signup")}>
                            <Text style={styles.signInLink}>Sign up</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
        // </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,

        backgroundColor: '#FDD835',
    },
    scrollContent: {
        flexGrow: 1,
    },
    header: {
        height: hp(25),
        backgroundColor: '#FDD835',
        paddingTop: Platform.OS === 'ios' ? hp(6) : hp(4),
        paddingHorizontal: wp(4),
    },
    logoContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
    },
    logo: {
    },
    formContainer: {
        flex: 1,
        backgroundColor: '#FFF',
        borderTopLeftRadius: wp(8),
        borderTopRightRadius: wp(8),
        paddingHorizontal: wp(6),
        paddingTop: hp(4),
    },
    title: {
        fontSize: fs(20),
        fontWeight: 'bold',
        color: '#000',
        marginBottom: hp(1),
    },
    subtitle: {
        fontSize: fs(14),
        color: '#666',
        marginBottom: hp(3),
    },
    toggleContainer: {
        flexDirection: 'row',
        borderWidth: 1,
        borderColor: '#ECECEC',
        borderRadius: wp(6),
        padding: wp(1),
        marginBottom: hp(3),
    },
    toggleButton: {
        flex: 1,
        paddingVertical: hp(1.5),
        alignItems: 'center',
        borderRadius: wp(5.5),
    },
    toggleButtonActive: {
        backgroundColor: '#000',
    },
    toggleText: {
        fontSize: fs(14),
        color: '#666',
    },
    toggleTextActive: {
        color: '#FFF',
        fontWeight: '600',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        // backgroundColor: '#F8F8F8',
        borderWidth: 1,
        borderColor: '#ECECEC',
        borderRadius: wp(3),
        paddingHorizontal: wp(4),
        marginBottom: hp(2),
        height: hp(7),
    },
    iconStyle: {
        marginRight: wp(3),
    },
    input: {
        flex: 1,
        fontSize: fs(16),
        color: '#000',
        paddingVertical: 0,
    },
    signUpButton: {
        backgroundColor: '#FDD835',
        borderRadius: wp(6),
        paddingVertical: hp(2),
        alignItems: 'center',
        marginTop: hp(1),
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
        fontWeight: '600',
        color: '#000',
    },
    divider: {
        textAlign: 'center',
        color: '#999',
        fontSize: fs(14),
        marginBottom: hp(2.5),
    },
    socialContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: hp(3),
    },
    socialButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F8F8F8',
        borderRadius: wp(3),
        paddingVertical: hp(1.8),
        paddingHorizontal: wp(4),
        flex: 0.48,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 2,
            },
            android: {
                elevation: 1,
            },
        }),
    },
    socialText: {
        fontSize: fs(14),
        color: '#000',
        fontWeight: '500',
        marginLeft: wp(2),
    },
    signInContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    signInText: {
        fontSize: fs(14),
        color: '#666',
    },
    signInLink: {
        fontSize: fs(14),
        color: '#000',
        fontWeight: '600',
        textDecorationLine: 'underline',
    },

    lineContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: hp(2.5),
    },
    line: {
        flex: 1,
        height: 1,
        backgroundColor: '#ccc',
    },
    text: {
        marginHorizontal: wp(2),
        color: '#999',
        fontSize: fs(14),
        textAlign: 'center',
    },

    forgotContainer: {
        width: `100%`,
        marginBottom: hp(2)
    },
    forgotText: {
        textAlign: "right"
    }
});
export default Login;