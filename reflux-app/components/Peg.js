import React from 'react'
import _ from 'lodash'
import $ from '../../public/js/jquery.min'
import constants from '../const'

import PegActions from '../actions/PegActions'
import PegStore from '../stores/PegStore'

import CodeEditor from './Peg/CodeEditor'
import InputEditor from './Peg/InputEditor'
import Settings from './Peg/Settings'

import AppActions from '../actions/AppActions'
import AppStore from '../stores/AppStore'

class Peg extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      grammar: '',
      buildResult: {},
      input: '',
      parseResult: {},
      output: {},
      cache: false,
      optimize: 'speed',
      saveResult: {}
    }
  }

  componentDidMount() {
    this.unsubscribe = PegStore.listen(function(state) {
      this.setState(state)
    }.bind(this))

    // get grammar by name
    $.get(constants.CONALOG_URL, {name: name})
      .done((data, status) => {
        if (status === 'OK') {
          let grammar = data.grammar
          PegActions.setCache(data.cache)
          PegActions.setOptimize(data.optimize)
          PegActions.build(grammar)
        }
      })
      .fail((err) => {
        // nothing to do
      })
      .always(() => {
        PegActions.build(this.state.grammar)
        PegActions.parse(this.state.input)
      })
  }

  componentWillUnmount() {
    if (_.isFunction(this.unsubscribe))
      this.unsubscribe()
  }

  render() {
    let className
    if (this.state.saveResult.status !== '') {
      className = "collapse.in alert alert-dismissible alert-" +
        this.state.saveResult.status
    }
    else {
      className = "collapse"
    }

    return (
      <div className="container p-t-60">
        <div className="row p-t-10">
          <div className="col-lg-12">
            <div ref="banner" className={ className }>
              { this.state.saveResult.detail }
            </div>
          </div>
        </div>
        <div className="row p-t-10">
          <div className="col-lg-6">
            <CodeEditor
              grammar={ this.state.grammar }
              buildResult={ this.state.buildResult }
            />
          </div>
          <div className="col-lg-6">
            <InputEditor
              input={ this.state.input }
              parseResult={ this.state.parseResult }
              output={ this.state.output }
            />
            <Settings
              name={ this.props.name }
              cache={ this.state.cache }
              optimize={ this.state.optimize }
              buildResult={ this.state.buildResult }
            />
          </div>
        </div>
      </div>
    )
  }
}

Peg.propTypes = {

}

Peg.defaultProps = {

}

export default Peg
