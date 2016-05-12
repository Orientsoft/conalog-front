import { Input, Label, Button, Row, Col } from 'react-bootstrap'

import React from 'react'
import _ from 'lodash'

import PegActions from '../../actions/PegActions'
import PegStore from '../../stores/PegStore'

import AppActions from '../../actions/AppActions'
import AppStore from '../../stores/AppStore'

class Settings extends React.Component {
  constructor(props) {
    super(props)
    this.state = {

    }
  }

  componentDidMount() {
    this.unsubscribe = PegStore.listen(function(state) {
      this.setState(state);
    }.bind(this));
  }

  componentWillUnmount() {
    if (_.isFunction(this.unsubscribe))
      this.unsubscribe();
  }

  onOptimizeChange(e) {
    PegActions.setOptimize(e.target.value)
    e.preventDefault()
  }

  onCacheChange(e) {
    PegActions.setCache(e.target.checked)
    e.preventDefault()
  }

  onSaveClick(e) {
    PegActions.save(this.props.name)
    e.preventDefault()
  }

  render() {
    return (
      <div>
        <div className=" p-t-10">

          <button type="button"
            className="btn btn-warning waves-effect waves-light pull-left m-r-10 m-t-10">
            3
          </button>
          <h3> Generate the parser code</h3>

          <form className="form-horizontal p-l-r-10" role="form">
    	      <div className="form-group m-b-0" >
              <label>Optimize:</label>
              <select className="form-control" onChange={ this.onOptimizeChange } value={ this.props.optimize }>
                <option value='speed'>Parsing Speed</option>
                <option value='size'>Code Size</option>
              </select>
            </div>
            <div className="checkbox">
              <input id="checkbox3" type="checkbox" onChange={ this.onCacheChange } checked={ this.props.cache } />
              <label htmlFor="checkbox3"> Use result cache </label>
            </div>
            <button type="button"
              className="btn btn-default waves-effect waves-light pull-right"
              onClick={ this.onSaveClick }>
              Save
            </button>
          </form>
        </div>

      </div>
    )
  }
}

Settings.propTypes = {

}

Settings.defaultProps = {

}

export default Settings
