import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from './screen/home';
import WebviewScreen from './screen/webview';

const Stack = createNativeStackNavigator();

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{
            title: 'Gravito TCF CMP Demo',
            headerStyle: {
              backgroundColor: '#FF4010',
            },
            headerTintColor: '#fff',
          }}
        />
        <Stack.Screen
          name="cmp"
          component={WebviewScreen}
          options={{
            title: 'Consent Banner',
            headerStyle: {
              backgroundColor: '#FF4010',
            },
            headerTintColor: '#fff',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
