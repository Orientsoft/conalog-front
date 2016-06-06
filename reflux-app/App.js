import React from 'react'
import ReactDom from 'react-dom'
import Modal from 'react-modal'
import _ from 'lodash'
// import 'antd/dist/antd.css'
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
import Management from './components/Management'

class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      location: 'Login',
      collectorType: 'Active',
      activeCollectorChecklist: [],
      activeCollectorDeleteModal: false
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

  deleteActiveCollector(e) {
    AppActions.deleteActiveCollector()
    AppActions.setActiveCollectorDeleteModal(false)
    e.preventDefault()
  }

  closeActiveCollectorDeleteModal(e) {
    AppActions.setActiveCollectorDeleteModal(false)
    e.preventDefault()
  }

  render() {
    let modalStyle = {
      overlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.75)'
      },
      content: {
        position: 'absolute',
        top: '40px',
        left: '40px',
        right: '40px',
        bottom: '40px',
        border: '1px solid #ccc',
        background: '#fff',
        overflow: 'auto',
        WebkitOverflowScrolling: 'touch',
        borderRadius: '4px',
        outline: 'none',
        padding: '20px'
      }
    }

    let page
    // console.log(this.state.location)
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

      case 'Management':
        page = <div>
          <Nav location= { this.state.location } />
          <Management />
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
        <Modal
          isOpen={this.state.activeCollectorDeleteModal}
          style= {modalStyle}
          >
          <h1>Confirm Delete Active Collector</h1>
          <div>
            <p>Are you sure to delete {this.state.activeCollectorChecklist.length} active collector(s)?</p>
          </div>
          <button type="submit" className="btn btn-primary waves-effect waves-light"
            onClick={this.deleteActiveCollector.bind(this)}> OK </button>
          <button type="reset" className="btn btn-default waves-effect waves-light m-l-5"
            onClick={this.closeActiveCollectorDeleteModal.bind(this)}> Cancel </button>
        </Modal>
      </div>
    )
  }
}

App.propTypes = {

}

App.defaultProps = {

}

export default App
