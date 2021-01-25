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
    SharedPreferences.getItem('cmpdata', (value) => {
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
          ref={(webView) => (this.webView = webView)}
          source={{
            uri:
              'https://cdn.gravito.net/webview/index.html?platform=reactnative',
          }}
          style={{marginTop: 0, backgroundColor: 'orange'}}
          scalesPageToFit={true}
          onLoadStart={() => this.setState({loading: true})}
          onLoad={() => {
            this.setState({loading: false});

            let configObject = {
              type: 'config',
              backgroundColor: 'orange',
              logoUrl:
                'https://cdn.gravito.net/logos/gravito_logo_white_background.png',
              displayPreferencesCloseBtn: true,
            };
            const configEvent = `window.postMessage(${JSON.stringify(
              configObject,
            )}, "*");
                        true;`;
            this.webView.injectJavaScript(configEvent);
          }}
          onMessage={(event) => {
            const {
              tcstring,
              type,
              currentstate,
              configversion,
              tcstringversion,
            } = JSON.parse(event.nativeEvent.data);
            console.log('type', type);
            debugger;
            switch (type) {
              case 'CMP-loaded':
                var cmpdata;
                cmpdata = {
                  ...JSON.parse(this.state.cmpdata),
                  type: 'cookieData',
                };
                console.log(cmpdata);
                const clientResponseCode = `
                            window.postMessage(${JSON.stringify(cmpdata)}, "*");
                             true;
                                `;
                if (this.webView) {
                  this.webView.injectJavaScript(clientResponseCode);
                }
                break;
              case 'save':
                SharedPreferences.setItem('cmpdata', event.nativeEvent.data);
                this.goBack();
                break;
              case 'load':
                //here you will get load event in which you will have config version and tcversion
                break;
              case 'close':
                //here you can handle modal close event
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
