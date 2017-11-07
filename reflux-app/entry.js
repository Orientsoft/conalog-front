import 'source-map-support/register'
import React from 'react'
import ReactDom from 'react-dom'
import AppActions from './actions/AppActions'
import AppStore from './stores/AppStore'

import zh_CN from './locale/zh_CN';
import en_US from './locale/en_US';
import intl from 'intl';
import ReactIntl from 'react-intl';
import {IntlProvider, addLocaleData} from 'react-intl';
import en from 'react-intl/locale-data/en';
import zh from 'react-intl/locale-data/zh';
addLocaleData([...en, ...zh]);

import App from './App'

// ReactDom.render(
//   <IntlProvider
//     locale = {'zh'}
//     messages = {zh_CN}
//   >
//     <App />
//   </IntlProvider>,
//   document.getElementById('app_container')
// );

 class Entry extends React.Component{
  constructor(props) {
    super(props)
    this.state = {
      language:"english",
    }
  }
  componentDidMount(){
    this.unsubscribe = AppStore.listen(function(state) {
      this.setState(state)
    }.bind(this))

  }
  render(){
    if(this.state.language == "chinese"){
     return(<IntlProvider
        locale = {'zh'}
        messages = {zh_CN}
      >
        <App />
      </IntlProvider>)
    }else{
      return(
        <IntlProvider
          locale = {'en'}
          messages = {en_US}
        >
          <App />
        </IntlProvider>
      )
    }
  }

}
//
// if(language == "zh"){
//   ReactDom.render(
//     <IntlProvider
//       locale = {'zh'}
//       messages = {zh_CN}
//     >
//       <App />
//     </IntlProvider>,
//     document.getElementById('app_container')
//   );
// }else{
//   ReactDom.render(
//     <IntlProvider
//       locale = {'en'}
//       messages = {en_US}
//     >
//       <App />
//     </IntlProvider>,
//     document.getElementById('app_container')
//   );
// }
ReactDom.render(<Entry/>,document.getElementById('app_container'))

