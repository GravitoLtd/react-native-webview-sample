# Gravito WebView-based CMP Integration Guide

## Section 1: General Architecture – WebView-based CMP (Platform-agnostic)

### Overview
Gravito’s WebView-based CMP is a cross-platform solution designed for use in mobile apps. It allows apps to display and interact with the CMP using an embedded web browser (WebView), regardless of the native platform (React Native, Flutter, Native Android, or Native iOS).

### High-Level Flow

1. **CMP HTML Page**
   - Gravito provides an embeddable CMP HTML containing all configuration and JavaScript logic.
   - This page must be hosted by the developer (on a CDN or local server).

2. **WebView Integration**
   - The CMP HTML is loaded into the mobile app’s WebView component.
   - The URL must include `?platform={platformName}` query param (e.g., `reactnative`, `flutter`, `android`, `ios`).
   - This tells the CMP JavaScript how to handle communication for that specific platform.

3. **Communication Mechanism**
   - Communication between the CMP (JavaScript) and the native app occurs through:
     - `window.postMessage` from the CMP
     - Native event listener or handler (e.g., `onMessage`)
     - JavaScript injection (`evaluateJavascript`, `injectJavaScript`, etc.)
   - Based on the platform, different APIs are used to facilitate this message passing.

### Configuration
- In the webview based CMP config make sure you have set below property in config object:
```json
gravito.config.cmp.tcf.core.isWebView = true,
```

#### Showing the CMP UI even if the user has already given consent
- If you want to show the CMP UI even if the user has already given consent, you can set the `gravito.config.cmp.tcf.core.showUiWhenConsented` to `true` in the config object.
```json
gravito.config.cmp.tcf.core.showUiWhenConsented = true,
```

### Core Message Events

| Event Type   | Direction   | Purpose                                                                      |
|--------------|-------------|------------------------------------------------------------------------------|
| CMP-loaded   | CMP → App | CMP is ready and requests consent data                                       |
| cookieData   | App → CMP | App sends existing consent data (if any)                                     |
| save         | CMP → App | User saved consent; app must store this data                                 |
| config       | App → CMP | App configures display properties of CMP UI (optional)                       |
| load         | CMP → App | CMP sends version info (informational)                                       |
| close        | CMP → App | CMP UI closed (informational)                                                |

### App Responsibilities

- Host the CMP HTML provided by Gravito
- Load it in a WebView with the correct platform query param
- Listen to messages from CMP (`CMP-loaded`, `save`)
- Send stored consent data to CMP if available
- Store updated consent data received from CMP
- Optionally configure CMP UI behavior using a `config` message
- Store the tcf consents and related data in a persistent storage solution (e.g., SharedPreferences, UserDefaults, etc.) in the format mentioned in the [TC Data Format](https://github.com/InteractiveAdvertisingBureau/GDPR-Transparency-and-Consent-Framework/blob/master/TCFv2/IAB%20Tech%20Lab%20-%20CMP%20API%20v2.md#how-is-a-cmp-used-in-app).
- if use Google Additional Consent mode you should also store the AcString data in the same persistent storage solution against the key mentioned in the [Google Additional Consent Mode](https://support.google.com/admanager/answer/9681920?hl=en#store-ac-string:~:text=In-,%2D,-app).

Note: All the information about the CMP that needs to be stored in the app is available in the data received in the save event.

## Section 2: Platform-Specific Implementation

### React Native

#### Sample App
You can find a sample React Native app that integrates the Gravito CMP using WebView [here]()

#### Required Packages

```bash
npm install react-native-webview react-native-default-preference
```

#### Code Example

```tsx
import React, {useEffect, useState} from 'react';
import {ActivityIndicator} from 'react-native';
import {WebView} from 'react-native-webview';
import DefaultPreference from 'react-native-default-preference';

const CMPWebView = ({navigation}) => {
  const [cmpdata, setCmpdata] = useState(undefined);
  const [loading, setLoading] = useState(true);
  let webViewRef = null;

  useEffect(() => {
    DefaultPreference.get('cmpdata').then(value => setCmpdata(value));
  }, []);

  const goBack = () => navigation.pop();

  return (
    <>
      <WebView
        ref={ref => (webViewRef = ref)}
        source={{
          uri: 'https://yourhost.com/gravito-cmp.html?platform=reactnative',
        }}
        startInLoadingState={true}
        onLoadStart={() => setLoading(true)}
        onLoad={() => {
          setLoading(false);
          const configEvent = {
            type: 'config',
            backgroundColor: 'orange',
            logoUrl: 'https://cdn.gravito.net/logos/gravito_logo_white_background.png',
            displayPreferencesCloseBtn: true,
          };
          const configJS = `window.postMessage(${JSON.stringify(configEvent)}, "*");true;`;
          webViewRef.injectJavaScript(configJS);
        }}
        onMessage={event => {
          const {type} = JSON.parse(event.nativeEvent.data);
          switch (type) {
            case 'CMP-loaded':
              const payload = {
                type: 'cookieData',
                ...(cmpdata ? JSON.parse(cmpdata) : {}),
              };
              const postJS = `window.postMessage(${JSON.stringify(payload)}, "*");true;`;
              webViewRef.injectJavaScript(postJS);
              break;

            case 'save':
              DefaultPreference.set('cmpdata', event.nativeEvent.data);
              goBack();
              break;

            case 'load':
              console.log('CMP config/version info:', event.nativeEvent.data);
              break;

            case 'close':
              break;

            default:
              break;
          }
        }}
      />

      {loading && (
        <ActivityIndicator
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            justifyContent: 'center',
            alignItems: 'center',
          }}
          size="large"
        />
      )}
    </>
  );
};

export default CMPWebView;
```



#### Consent Storage

```tsx
// To store
DefaultPreference.set('cmpdata', jsonData);

// To retrieve
DefaultPreference.get('cmpdata').then(value => { ... });
```
Note: The `cmpdata` should be stored in the format mentioned in the [TC Data Format](https://github.com/InteractiveAdvertisingBureau/GDPR-Transparency-and-Consent-Framework/blob/master/TCFv2/IAB%20Tech%20Lab%20-%20CMP%20API%20v2.md#how-is-a-cmp-used-in-app) 


#### Opening the CMP UI from Apps

```tsx
webView.injectJavaScript(
  'window.gravito.cmp.openPreferences();',
  true,
);
```

---
Note: To Run the sample app, you need to have a Gravito CMP HTML hosted on a server or CDN. Replace `https://yourhost.com/gravito-cmp.html` with the actual URL where your Gravito CMP HTML is hosted.
