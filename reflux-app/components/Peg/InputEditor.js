import React from 'react'
import _ from 'lodash'

import PegActions from '../../actions/PegActions'
import PegStore from '../../stores/PegStore'

import AppActions from '../../actions/AppActions'
import AppStore from '../../stores/AppStore'

class InputEditor extends React.Component {
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

  onInputChange(e) {
    PegActions.parse(e.target.value)
    e.preventDefault()
  }

  render() {
    let inputClassName = 'alert m-t-10 alert-' + this.props.parseResult.status

    return (
      <div>

        <button type="button"
          className="btn btn-warning waves-effect waves-light pull-left m-r-10 m-t-10">
          2
        </button>
        <h3> Write your PEG.js grammar</h3>

        <div className=" p-t-10">
          <textarea className="form-control" rows="5" onChange={ this.onInputChange }></textarea>
          <div className={ inputClassName }>
            { this.props.parseResult.detail }
          </div>
        </div>

        <div className="portlet m-b-0">
          <div className="portlet-heading bg-custom">
            <h3 className="portlet-title">Output</h3>
            <div className="clearfix"></div>
          </div>
          <div id="bg-primary" className="panel-collapse collapse in">
            <div className="portlet-body">{ this.props.output.detail }</div>
          </div>
        </div>

      </div>
    )
  }
}

InputEditor.propTypes = {

}

InputEditor.defaultProps = {

}

export default InputEditor
