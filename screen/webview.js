import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function WebviewScreen(props) {
  const [cmpdata, setCmpdata] = useState(undefined);
  let webView = null;

  useEffect(() => {
    AsyncStorage.getItem('cmpdata').then(value => {
      setCmpdata(value);
    });
  }, []);

  function goBack() {
    props.navigation.pop();
  }

  function saveCMPSpecificData(cmpType, cmpData) {
    switch (cmpType) {
      case 'tcf':
        let {
          tcstring,
          currentstate,
          nontcfdata,
          configversion,
          tcstringversion,
          inAppTCData,
          acstring,
        } = cmpData;
        // CMP sends the consent data as an object with the following structure for tcf CMP:
        // {
        //   type: String,                        // e.g., "save"
        //   cmpType: String,                 // tcf
        //   tcstring: String,                   // Encoded consent string (TCF)
        //   currentstate: Object,               // CMP core configuration details. all the information required to store in default storage and make it available to the vendors
        //   nontcfdata: Object,                 // Non-TCF consent-related data
        //   configversion: String,              // CMP configuration version identifier
        //   tcstringversion: String,            // Version of the TCF string
        //   inAppTCData: Object,                // Consent data relevant for in-app usage
        //   acString: String,                   // Additional consent string (optional)
        //   isRejectAll: Boolean,               // Indicates if user selected "Reject All"
        //   googleConsents: Object              // Google-formatted consent data

        // }

        // this is for demo purposes only
        // you need to save your data in the format shown at https://github.com/InteractiveAdvertisingBureau/GDPR-Transparency-and-Consent-Framework/blob/master/TCFv2/IAB%20Tech%20Lab%20-%20CMP%20API%20v2.md#how-is-a-cmp-used-in-app

        AsyncStorage.setItem('cmpdata', JSON.stringify(cmpData));
        break;
      case "standard":
        // CMP sends the consent data as an object with the following structure for tcf CMP:
        // {
        //   type: String,                        // e.g., "save"
        //   cmpType: String,                 // standard
        //   gcstring: String,                   // Encoded consent string 
        //   currentstate: Object,               // CMP core configuration details. all the information required to store in default storage and make it available to the vendors
        //   configversion: String,              // CMP configuration version identifier
        //   googleConsents: Object              // Google-formatted consent data
        // }

        AsyncStorage.setItem('cmpdata', JSON.stringify(cmpData));
        break;

      case "usprivacy":
         // CMP sends the consent data as an object with the following structure for tcf CMP:
        // {
        //   type: String,                        // e.g., "save"
        //   cmpType: String,                 // standard
        //   gppstring: String,                   // Encoded gpp consent string 
        //   googleConsents: Object              // Google-formatted consent data
        //   bannerRequired:Boolean   // flag to indicate wether to show banner or not
        //   gppData: Object.      // Consent data relevant for in-app usage
        // }

        AsyncStorage.setItem('cmpdata', JSON.stringify(cmpData));
        break;
      case "global":
         // CMP sends the consent data as an object with the following structure for tcf CMP:
        // {
        //   type: String,                        // e.g., "save"
        //   cmpType: String,                 // standard
        //   googleConsents: Object              // Google-formatted consent data
        //   bannerRequired:Boolean   // flag to indicate wether to show banner or not

        // }

        AsyncStorage.setItem('cmpdata', JSON.stringify(cmpData));
        break;



      default:
        console.log('unsupported or invalid CMP type');
    }
  }

  return (
    <WebView
    
      ref={refwebView => (webView = refwebView)}
      source={{
        // Enter the URL of hosted HTML file and add search param 'platform=<your_platform>' to identify the platform
        uri: 'http://127.0.0.1:5502/localServer/webviewgpptest.html?platform=reactnative&region=CL',
      }}
      webviewDebuggingEnabled={true}
      startInLoadingState={true}
      style={{ marginTop: 0 }}
      scalesPageToFit={true}
      onError={(err)=>{
        console.log(err,"eerr")
      }}
      onLoad={() => {

        let configObject = {
          type: 'config',
          backgroundColor: 'orange',
          logoUrl:
            'https://cdn.gravito.net/logos/gravito_logo_white_background.png',
          displayPreferencesCloseBtn: true,
        };
        const configEvent = `window.postMessage(${JSON.stringify(
          configObject,
        )}, "*");true;`;
        webView.injectJavaScript(configEvent, true);
      }}
      onMessage={event => {
        debugger
        const dataFromWebView= JSON.parse(event.nativeEvent.data);
        const {type,cmpType} =dataFromWebView
          
        switch (type) {
          case 'CMP-loaded':
            // cmp expects app to send tcstrinfg and nontcfdata in the object type.
            // {
            //   "type": "cookieData",
            //   "tcstring": cmpdata?["tcstring"],
            //   "nontcfdata": cmpdata?["nontcfdata"],
            //   "acstring": cmpdata?["acString"],
            // };
            var newcmpdata;
            if (cmpdata) {
              newcmpdata = {
                ...JSON.parse(cmpdata),
                type: 'cookieData',
              };
            } else {
              newcmpdata = {
                type: 'cookieData',
              };
            }

            // console.log(newcmpdata);
            const clientResponseCode = `
                            window.postMessage(${JSON.stringify(
                              newcmpdata,
                            )}, "*");
                             true;
                                `;

            if (webView) {
              webView.injectJavaScript(clientResponseCode, true);
            }
            break;
          case 'save':
            saveCMPSpecificData(cmpType,dataFromWebView)
            if (dataFromWebView.bannerRequired === false) {
              const receivedString =
                dataFromWebView.tcstring ??
                dataFromWebView.gppstring ??
                dataFromWebView.gcstring ??
                '<empty>';

              Alert.alert(
                'Consent Received',
                `bannerRequired=false\ncmpType=${cmpType}\nreceivedString=${receivedString}`,
                [{ text: 'OK', onPress: goBack }],
                { cancelable: false },
              );
            }
            break;
          case 'load':
            //here you will get load event in which you will have config version and tcversion
            console.log('load event', event.nativeEvent.data);
            
            break;
          case 'close':
            //here you can handle modal close event
            goBack();
            break;
          default:
            break;
        }
      }}
    />
  );
}
