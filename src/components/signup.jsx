import React from 'react';
import { connect } from 'react-redux';
import Recaptcha from 'react-google-recaptcha';

import { signUp } from '../redux/action-creators';
import { preventDefault } from '../utils';
import { captcha as captchaConfig } from '../../config/app';
import throbber16 from 'assets/images/throbber-16.gif';

class SignUp extends React.Component {
  refUsername = (input) => { this.username = input; };
  refEmail = (input) => { this.email = input; };
  refPassword = (input) => { this.password = input; };

  handleCaptcha = (value) => { this.captcha = value; };

  submitForm = () => {
    const username = this.username.value;
    const email = this.email.value;
    const password = this.password.value;
    const captcha = this.captcha || null;

    this.props.signUp({ username, email, password, captcha });
  };

  render() {
    return (
      <div className="box">
        <div className="row">
          <div className="col-md-6">
            <h2>Sign up</h2>

            <form onSubmit={preventDefault(this.submitForm)}>
              <div className="form-group">
                <label htmlFor="username-input">Username</label>
                <input id="username-input" className="form-control" type="text" ref={this.refUsername} autoFocus={true}/>
              </div>

              <div className="form-group">
                <label htmlFor="email-input">Email</label>
                <input id="email-input" className="form-control" type="email" ref={this.refEmail}/>
              </div>

              <div className="form-group">
                <label htmlFor="password-input">Password</label>
                <input id="password-input" className="form-control" type="password" ref={this.refPassword}/>
              </div>

              {captchaConfig.siteKey ? (
                <div className="form-group">
                  <Recaptcha
                    sitekey={captchaConfig.siteKey}
                    theme="light"
                    type="image"
                    onChange={this.handleCaptcha}/>
                </div>
              ) : false}

              <div className="form-group">
                <button className="btn btn-default" type="submit">Sign up</button>

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
          </div>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return { ...state.signUpForm };
}

function mapDispatchToProps(dispatch) {
  return {
    signUp: (...args) => dispatch(signUp(...args))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(SignUp);
