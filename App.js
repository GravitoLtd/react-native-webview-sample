import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  StatusBar,
  TouchableOpacity,
  Button,
} from 'react-native';

import {
  Header,
  LearnMoreLinks,
  Colors,
  DebugInstructions,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';
import {NavigationContainer} from '@react-navigation/native';
// import {createStackNavigator} from '@react-navigation/stack';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
var SharedPreferences = require('react-native-shared-preferences');
import DefaultPreference from 'react-native-default-preference';

import MyWeb from './container/WebView(functional)';

function HomeScreen(props) {
  function clearcookies() {
    // SharedPreferences.removeItem('cmpdata');
    DefaultPreference.clear('cmpdata');
  }
  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-evenly',
      }}>
      <Button
        color="orange"
        onPress={() => props.navigation.navigate('cmp')}
        title={'Gravito CMP'}
      />
      <Button color="orange" onPress={() => clearcookies()} title={'Clear'} />
    </View>
  );
}
const Stack = createNativeStackNavigator();
const App = () => {
  return (
    <>
      <NavigationContainer>
        <Stack.Navigator initialRouteName={'Home'}>
          <Stack.Screen
            name="cmp"
            component={MyWeb}
            options={{
              title: 'Gravito CMP',
              headerStyle: {
                backgroundColor: 'orange',
              },
              headerTintColor: '#fff',
            }}
          />
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{
              title: 'My home',
              headerStyle: {
                backgroundColor: 'orange',
              },
              headerTintColor: '#fff',
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    backgroundColor: Colors.lighter,
  },
  engine: {
    position: 'absolute',
    right: 0,
  },
  body: {
    backgroundColor: Colors.white,
  },
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.black,
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
    color: Colors.dark,
  },
  highlight: {
    fontWeight: '700',
  },
  footer: {
    color: Colors.dark,
    fontSize: 12,
    fontWeight: '600',
    padding: 4,
    paddingRight: 12,
    textAlign: 'right',
  },
});

export default App;
