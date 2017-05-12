import React from 'react';
import { Link } from 'react-router';
import { connect } from 'react-redux';

import { signIn } from '../redux/action-creators';
import { preventDefault } from '../utils';
import throbber16 from 'assets/images/throbber-16.gif';

class SignIn extends React.Component {
  refUsername = (input) => { this.username = input; };
  refPassword = (input) => { this.password = input; };

  submitForm = () => {
    const username = this.username.value.trim();
    const password = this.password.value;
    this.props.signIn(username, password);
  };

  render() {
    return (
      <div className="box">
        <div className="row">
          <div className="col-md-6">
            <h2>Sign in</h2>

            <form onSubmit={preventDefault(this.submitForm)}>
              <div className="form-group">
                <label htmlFor="username-input">Username</label>
                <input id="username-input" className="form-control" type="text" ref={this.refUsername} autoFocus={true}/>
              </div>
              <div className="form-group">
                <label htmlFor="password-input">Password</label>
                <input id="password-input" className="form-control" type="password" ref={this.refPassword}/>
              </div>
              <div className="form-group">
                <button className="btn btn-default" type="submit">Sign in</button>

                {this.props.status === 'loading' ? (
                  <span className="settings-throbber">
                    <img width="16" height="16" src={throbber16}/>
                  </span>
                ) : false}
              </div>
            </form>

            {this.props.status === 'error' ? (
              <div className="alert alert-danger" role="alert">{this.props.errorMessage}</div>
            ) : false}

            <p>New to FreeFeed? <Link to="/signup">Create an account »</Link></p>
          </div>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return { ...state.signInForm };
}

function mapDispatchToProps(dispatch) {
  return {
    signIn: (...args) => dispatch(signIn(...args))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(SignIn);
