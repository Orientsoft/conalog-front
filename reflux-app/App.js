import React from 'react'
import ReactDom from 'react-dom'
import _ from 'lodash'

import AppActions from './actions/AppActions'
import AppStore from './stores/AppStore'

import Nav from './components/Common/Nav'
import Footer from './components/Common/Footer'

import Home from './components/Home'
import Collector from './components/Collector'
import Flow from './components/Flow'
import Parser from './components/Parser'
import Status from './components/Status'
import History from './components/History'
import Admin from './components/Admin'
import Login from './components/Login'
import Peg from './components/Peg'

class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      location: 'Login',
      collectorType: 'Active'
    }
  }

  componentDidMount() {
    this.unsubscribe = AppStore.listen(function(state) {
      this.setState(state)
    }.bind(this))
  }

  componentWillUnmount() {
    if (_.isFunction(this.unsubscribe))
      this.unsubscribe()
  }

  render() {
    let page
    console.log(this.state.location)
    switch (this.state.location)
    {
      case 'Login':
        page = <div><Login /></div>
      break;

      case 'Collector':
        page = <div>
          <Nav location={ this.state.location } />
          <Collector collectorType={ this.state.collectorType } />
          <Footer />
        </div>
      break;

      case 'Home':
        page = <div>
          <Nav location={ this.state.location } />
          <Home />
          <Footer />
        </div>
      break;

      case 'Flow':
        page = <div>
          <Nav location={ this.state.location } />
          <Flow />
          <Footer />
        </div>
      break;

      case 'Peg':
        page = <div>
          <Nav location={ this.state.location } />
          <Peg />
          <Footer />
        </div>
      break;

      case 'History':
        page = <div>
          <Nav location={ this.state.location } />
          <History />
          <Footer />
        </div>
      break;

      default:
        page = <div><Login /></div>
      break;
    }

    return (
      <div>
        { page }
      </div>
    )
  }
}

App.propTypes = {

}

App.defaultProps = {

}

export default App
