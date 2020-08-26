import React, { Component } from 'react'
import { connect } from 'react-redux'

class App extends Component {
  render() {
    const {children} = this.props;
    return (
        <div className="App">
            FUCK YOU REACT
            {children}
        </div>
    );
  }
}

export default connect(s => s)(App)
