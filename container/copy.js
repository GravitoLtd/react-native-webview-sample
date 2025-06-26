import React, {Component} from 'react';
import {Text, View, ActivityIndicator} from 'react-native';
import {WebView} from 'react-native-webview';
var SharedPreferences = require('react-native-shared-preferences');

class MyWeb extends Component {
  state = {
    cmpdata: undefined,
    loading: false,
  };
  componentDidMount() {
    SharedPreferences.getItem('cmpdata', value => {
      this.setState({cmpdata: value});
    });
  }
  goBack = () => {
    this.props.navigation.pop();
  };

  render() {
    return (
      <>
        <WebView
          ref={webView => (this.webView = webView)}
          source={{
            uri: 'https://yourcdnurl/index.html?platform=reactnative',
          }}
          style={{marginTop: 0, backgroundColor: 'orange'}}
          scalesPageToFit={true}
          onLoadStart={() => this.setState({loading: true})}
          onLoad={() => {
            // use this hook to send data to CMP when html is loaded
          }}
          onMessage={event => {
            const {
              tcstring,
              type,
              currentstate,
              configversion,
              tcstringversion,
            } = JSON.parse(event.nativeEvent.data);
            console.log('type', type);
            switch (type) {
              case 'CMP-loaded':
                // here you know that CMP has been loaded in WebView and is waiting for Data to be send from WebView

                let dataToSend = {
                  type: 'cookieData',
                  tcstring: tcstring, // recived from save event  when user opted previously should be empty when user come for first time,
                  nontcfdata: nontcfdata, // recived from save event  when user opted previously should be empty when user come for first time
                };

                const clientResponseCode = `
                            window.postMessage(${JSON.stringify(
                              dataToSend,
                            )}, "*");
                             true;
                                `;
                if (this.webView) {
                  this.webView.injectJavaScript(clientResponseCode);
                }
                break;
              case 'save':
                // This event will be sent when user saves the consent on CMP UI, for eg Accept All,Reject All, or Accept Selected
                break;
              case 'load':
                //here you will get load event in which you will have config version and tcversion
                break;
              case 'close':
                //here you can handle modal close event
                console.log('close event occured');
                break;
              default:
                break;
            }
          }}
        />
        {this.state.loading && (
          <ActivityIndicator
            style={{
              flex: 1,
              left: 0,
              right: 0,
              top: 0,
              bottom: 0,
              position: 'absolute',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            size="large"
          />
        )}
      </>
    );
  }
}

export default MyWeb;
