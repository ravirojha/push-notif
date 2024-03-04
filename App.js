import { StatusBar } from 'expo-status-bar';
import {Alert, Button, Platform, StyleSheet, Text, View} from 'react-native';
import * as Notifications from 'expo-notifications'
import {useEffect} from "react";
import Constants from "expo-constants";

Notifications.setNotificationHandler({
  handleNotification: async () => {
    return {
      shouldPlaySound: false,
      shouldSetBadge: false,
      shouldShowAlert: true
    }
  }
});

export default function App() {

  useEffect(() => {
    async function configurePushNotification() {
      const {status} = await Notifications.getPermissionsAsync();
      let finalStatus = status;

      if(finalStatus !== 'granted') {
        const {status} = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if(finalStatus !== 'granted') {
        Alert.alert(
            'Permission required',
            'Push notificaitons need the appropriate permissions.'
        );
        return;
      }


      const pushTokenData = (await Notifications.getExpoPushTokenAsync({ projectId: Constants.expoConfig.extra.eas.projectId })).data;
      console.log(pushTokenData)

      if(Platform.OS === 'android') {
        Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.DEFAULT
        })
      }
    }

    configurePushNotification()

  },[])

  useEffect(() => {
    const subscription1 = Notifications.addNotificationReceivedListener((notification) => {
      const userName = notification.request.content.data.userName;
      console.log(userName)
    })

    const subscription2 = Notifications.addNotificationResponseReceivedListener((response) => {
      const userName = response.notification.request.content.data.userName;
      console.log('RESPONSE', userName)
    })

    return () => {
      subscription1.remove()
      subscription2.remove()
    }
  }, [])

  async function scheduleNotificationHandler() {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'My fiest local notificaiton',
        body: 'This is the body of the notification.',
        data: { userName: 'Ravi' }
      },
      trigger: {
        seconds: 5
      }
    })
  }

  return (
    <View style={styles.container}>
      <Button title='Schedule Notification' onPress={scheduleNotificationHandler}/>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
