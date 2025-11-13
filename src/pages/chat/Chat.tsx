// @ts-nocheck
import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import EvilIcons from 'react-native-vector-icons/EvilIcons';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import TopHeader from '../../components/TopHeader';
import { useTabBarHeightHelper } from '../../utils/TabBarHeight';
import useActionMutation from '../../queryFunctions/useActionMutation';
import { showToast } from '../../utils/toastHelper';
import { useUserStore } from '../../stores/useUserStore';
import { useQuery } from '@tanstack/react-query';
import { fetchData } from '../../queryFunctions/queryFunctions';
import { joinUserRoom, socket } from '../../utils/socket';
import { useFocusEffect } from '@react-navigation/native';
import { useRideStore } from '../../stores/rideStore';

export default function ChatScreen({ navigation, route }) {
  const [message, setMessage] = useState('');
  const scrollViewRef = useRef(null);
  const [localMessages, setLocalMessages] = useState([]);

  const { userData, role } = useUserStore();
  const { rideId, driver_id, user_id } = route.params;
  const tabBarHeight = 0; // replace with useTabBarHeightHelper() if needed
  const { sethasUnreadMessages } = useRideStore();

  // ✅ Fetch chat messages
  const { data, isLoading } = useQuery({
    queryKey: ['chat', driver_id, user_id],
    queryFn: () => fetchData(`/chat?sender=${user_id}&receiver=${driver_id}`),
    keepPreviousData: true,
  });

  const { triggerMutation } = useActionMutation({
    onSuccessCallback: () => {},
    onErrorCallback: errmsg => {
      console.log('Message send failed', errmsg);
    },
  });

  // ✅ Send message with optimistic update
  const handleSend = () => {
    if (message.trim() === '') return;

    const tempId = Date.now().toString(); // unique temp id

    const newMessage = {
      id: tempId,
      text: message.trim(),
      sender: 'user',
      time: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
      status: 'sending',
    };

    setLocalMessages(prev => [...prev, newMessage]);

    const data_obj = {
      sender: role === 'User' ? user_id : driver_id,
      receiver: role === 'User' ? driver_id : user_id,
      message: message.trim(),
      ride: rideId,
    };

    setMessage('');

    triggerMutation({
      endPoint: '/chat/',
      body: data_obj,
      method: 'post',
      onSuccessCallback: res => {
        setLocalMessages(prev =>
          prev.map(m =>
            m.id === tempId ? { ...m, status: 'sent', id: res?.data?._id } : m,
          ),
        );
      },
      onErrorCallback: errmsg => {
        setLocalMessages(prev =>
          prev.map(m => (m.id === tempId ? { ...m, status: 'failed' } : m)),
        );
      },
    });

    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 300);
  };

  // ✅ Format fetched messages for UI
  const formattedMessages = useMemo(() => {
    if (!Array.isArray(data)) return [];
    return data
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
      .map((msg, index, arr) => ({
        id: msg._id,
        text: msg.message,
        sender: msg.sender?._id === userData?._id ? 'user' : 'driver',
        time: new Date(msg.createdAt).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
        showAvatar:
          index === 0 || msg.sender?._id !== arr[index - 1]?.sender?._id,
        status: 'sent',
      }));
  }, [data, userData?._id]);

  // ✅ Socket listener for incoming messages
  useFocusEffect(
    useCallback(() => {
      if (!userData?._id) return;

      const handleMessage = data => {
        const newMessage = {
          id: data?._id,
          text: data?.message.trim(),
          sender: data?.sender?._id === userData?._id ? 'user' : 'driver',
          time: new Date(data?.createdAt).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
          status: 'sent',
        };
        setLocalMessages(prev => [...prev, newMessage]);
      };

      socket.on('msg_received', handleMessage);

      return () => {
        socket.off('msg_received', handleMessage);
      };
    }, [userData?._id]),
  );

  // ✅ Combine API + local messages
  const allMessages = useMemo(
    () => [...formattedMessages, ...localMessages],
    [formattedMessages, localMessages],
  );

  // ✅ Auto-scroll
  useEffect(() => {
    if (allMessages.length) {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }
  }, [allMessages]);

  // ✅ Mark as read
  useEffect(() => {
    if (allMessages.length) sethasUnreadMessages(false);
  }, [allMessages, sethasUnreadMessages]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <TopHeader title="Chat" navigation={navigation} />

        <ScrollView
          ref={scrollViewRef}
          style={styles.chatContainer}
          contentContainerStyle={[
            styles.chatContent,
            { paddingBottom: tabBarHeight },
          ]}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() =>
            scrollViewRef.current?.scrollToEnd({ animated: true })
          }
        >
          {isLoading ? (
            <Text style={{ textAlign: 'center', marginTop: 20 }}>
              Loading chat...
            </Text>
          ) : allMessages.length === 0 ? (
            <Text style={{ textAlign: 'center', marginTop: 20 }}>
              No messages yet. Start chatting!
            </Text>
          ) : (
            allMessages.map(msg => (
              <View key={msg.id} style={styles.messageWrapper}>
                {msg.sender === 'driver' ? (
                  <View style={styles.driverMessageContainer}>
                    {msg.showAvatar && (
                      <View style={styles.avatar}>
                        <Image
                          source={{
                            uri:
                              msg?.sender === 'driver'
                                ? data?.[0]?.receiver?.profile_image
                                : data?.[0]?.sender?.profile_image,
                          }}
                          style={{
                            width: '100%',
                            height: '100%',
                            borderRadius: 50,
                          }}
                        />
                      </View>
                    )}
                    <View style={styles.messageContent}>
                      <View style={styles.driverBubble}>
                        <Text style={styles.driverText}>{msg.text}</Text>
                      </View>
                      <Text style={styles.timeText}>{msg.time}</Text>
                    </View>
                  </View>
                ) : (
                  <View style={styles.userMessageContainer}>
                    <View style={styles.messageContent}>
                      <View style={styles.userBubble}>
                        <Text style={styles.userText}>{msg.text}</Text>
                      </View>
                      <View style={styles.timeRow}>
                        {msg.status === 'sending' && (
                          <EvilIcons
                            name="clock"
                            size={wp('4%')}
                            color="#999"
                          />
                        )}
                        {msg.status === 'sent' && (
                          <Ionicons
                            name="checkmark-done"
                            size={wp('4%')}
                            color="#FFD700"
                          />
                        )}
                        {msg.status === 'failed' && (
                          <Ionicons
                            name="close-circle"
                            size={wp('4%')}
                            color="red"
                          />
                        )}
                        <Text style={styles.timeText}>{msg.time}</Text>
                      </View>
                    </View>
                  </View>
                )}
              </View>
            ))
          )}
        </ScrollView>

        {/* Input Box */}
        <View style={styles.inputContainer}>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons
              name="add-circle-outline"
              size={wp('6.5%')}
              color="#888"
            />
          </TouchableOpacity>

          <TextInput
            style={styles.input}
            placeholder="Type your message"
            placeholderTextColor="#999"
            value={message}
            onChangeText={setMessage}
            multiline
          />

          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="happy-outline" size={wp('6%')} color="#888" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
            <Ionicons name="send" size={wp('5%')} color="#FFD700" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    fontFamily: 'SF Pro',
  },
  chatContainer: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  chatContent: {
    padding: wp('4%'),
    paddingBottom: hp('2%'),
  },
  messageWrapper: {
    marginBottom: hp('2%'),
  },
  driverMessageContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: hp('1%'),
  },
  avatar: {
    width: wp('10%'),
    height: wp('10%'),
    borderRadius: wp('5%'),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp('2%'),
  },
  avatarIcon: {
    alignItems: 'center',
  },
  avatarHead: {
    width: wp('3%'),
    height: wp('3%'),
    borderRadius: wp('1.5%'),
    backgroundColor: '#4A90E2',
    marginBottom: 2,
  },
  avatarBody: {
    width: wp('4%'),
    height: wp('4%'),
    borderRadius: wp('2%'),
    backgroundColor: '#4A90E2',
  },
  avatarPlaceholder: {
    width: wp('10%'),
    marginRight: wp('2%'),
  },
  messageContent: {
    flex: 1,
  },
  driverBubble: {
    backgroundColor: '#FFD700',
    paddingHorizontal: wp('4%'),
    paddingVertical: hp('1.5%'),
    borderRadius: wp('4%'),
    borderTopLeftRadius: wp('1%'),
    maxWidth: '85%',
    alignSelf: 'flex-start',
  },
  driverText: {
    fontSize: wp('3.8%'),
    color: '#000',
    lineHeight: hp('2.5%'),
    fontFamily: 'SF Pro',
  },
  userMessageContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: hp('1%'),
  },
  userBubble: {
    backgroundColor: '#fff',
    paddingHorizontal: wp('4%'),
    paddingVertical: hp('1.5%'),
    borderRadius: wp('4%'),
    borderTopRightRadius: wp('1%'),
    maxWidth: '85%',
    alignSelf: 'flex-end',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  userText: {
    fontSize: wp('3.8%'),
    color: '#000',
    lineHeight: hp('2.5%'),
    fontFamily: 'SF Pro',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: hp('0.5%'),
    gap: wp('1%'),
  },
  timeText: {
    fontSize: wp('3%'),
    color: '#999',
    marginTop: hp('0.5%'),
    fontFamily: 'SF Pro',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp('4%'),
    paddingVertical: hp('1.5%'),
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    gap: wp('2%'),
    marginBottom: hp(15),
  },
  iconButton: {
    padding: wp('1%'),
  },
  input: {
    flex: 1,
    backgroundColor: '#F8F8F8',
    borderRadius: wp('6%'),
    paddingHorizontal: wp('4%'),
    paddingVertical: hp('1.2%'),
    fontSize: wp('3.8%'),
    color: '#000',
    maxHeight: hp('12%'),
    fontFamily: 'SF Pro',
  },
  sendButton: {
    width: wp('10%'),
    height: wp('10%'),
    borderRadius: wp('5%'),
    backgroundColor: '#F8F8F8',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
