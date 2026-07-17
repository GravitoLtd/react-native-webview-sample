import React, {useEffect, useState} from 'react';
import {
  View,
  Button,
  ScrollView,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import JSONTree from 'react-native-json-tree';
// import AsyncStorage from '@react-native-async-storage/async-storage';
import DefaultPreference from 'react-native-default-preference';
import {useFocusEffect} from '@react-navigation/native';

export default function HomeScreen(props) {
  const [storedData, setStoredData] = useState(null);

  useFocusEffect(
    React.useCallback(() => {
      getStoredData();
    }, []),
  );

  function getStoredData() {
    DefaultPreference.get('cmpdata').then((value) => {
      console.log('value', value);
      if (value) {
        const {tcstring, googleConsents} = JSON.parse(value);
        setStoredData({
          tcString: tcstring,
          googleConsents: googleConsents,
        });
      } else {
        setStoredData(null);
      }
    });
  }

  function clearcookies() {
    DefaultPreference.clear('cmpdata');
    setStoredData(null);
  }

  return (
    <View
      style={{
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
      }}>
      <Text style={{fontSize: 20, fontWeight: 'bold', textAlign: 'center'}}>
        Stored CMP Data
      </Text>
      <JSONTree data={storedData} hideRoot shouldExpandNode={() => true} />

      <View style={{gap: 14, padding: 20}}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => props.navigation.navigate('cmp')}>
          <Text style={styles.text}>Open CMP</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => clearcookies()}>
          <Text style={styles.text}>Clear shared preferences</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    backgroundColor: '#FF4010',
    borderRadius: 5,
    padding: 10,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 16,
  },
});
