import React from 'react'
import _ from 'lodash'

import Ace from 'react-ace'
import 'brace/mode/plain_text'
import 'brace/theme/github'

import PegActions from '../../actions/PegActions'
import PegStore from '../../stores/PegStore'

import AppActions from '../../actions/AppActions'
import AppStore from '../../stores/AppStore'

class CodeEditor extends React.Component {
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

  onGrammarChange(grammar) {
    PegActions.build(grammar)
  }

  render() {
    let opts = {
      mode: 'pegjs',
      lineNumbers: true
    }

    let alertClassName = 'alert m-t-10 alert-' + this.props.buildResult.status

    return (
      <div>
        <button type="button"
          className="btn btn-warning waves-effect waves-light pull-left m-r-10 m-t-10">
          1
        </button>
        <h3> Test the generated parser with some input</h3>
        <div className=" p-t-10">
          <Ace mode='plain_text'
            onChange={ this.onGrammarChange }
            theme='github'
            showGutter={true}
            showPrintMargin={true}
            value={ this.props.grammar }
            editorProps={{ $blockScrolling: true }}
          />
        </div>
        <div className={ alertClassName }>
          { this.props.buildResult.detail }
        </div>
      </div>
    )
  }
}

CodeEditor.propTypes = {

}

CodeEditor.defaultProps = {

}

export default CodeEditor
