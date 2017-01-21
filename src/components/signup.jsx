import React from 'react';
import { connect } from 'react-redux';
import { signUpChange, signUp, signUpEmpty } from '../redux/action-creators';
import { preventDefault } from '../utils';
import { captcha as captchaConfig } from '../config';
import Recaptcha from 'react-google-recaptcha';

function signUpFunc(props) {
  props.signUp({ ...props });
}

function SignUp(props) {
  return (
    <div className="box">
      <div className="row">
        <div className="col-md-6">
          <h2>Sign up</h2>

          {props.error ? (
            <div className="alert alert-danger" role="alert">
              {props.error}
            </div>
          ) : false}

          <form onSubmit={preventDefault(() => signUpFunc(props))}>
            <div className="form-group">
              <label htmlFor="username-input">Username</label>
              <input id="username-input" className="form-control" type="text" onChange={e => props.signUpChange({ username: e.target.value })}/>
            </div>

            <div className="form-group">
              <label htmlFor="email-input">Email</label>
              <input id="email-input" className="form-control" type="email" onChange={e => props.signUpChange({ email: e.target.value })}/>
            </div>

            <div className="form-group">
              <label htmlFor="password-input">Password</label>
              <input id="password-input" className="form-control" type="password" onChange={e => props.signUpChange({ password: e.target.value })}/>
            </div>

            {captchaConfig.siteKey ? (
              <div className="form-group">
                <Recaptcha
                  sitekey={captchaConfig.siteKey}
                  theme="light"
                  type="image"
                  onChange={v => props.signUpChange({ captcha: v })}
                  onExpired={_ => props.signUpChange({ captcha: null })} />
              </div>
            ) : false}

            <div className="form-group">
              <button className="btn btn-default" type="submit">Sign up</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function mapStateToProps(state) {
  return { ...state.signUpForm };
}

function mapDispatchToProps(dispatch) {
  return {
    signUpChange: (...args) => dispatch(signUpChange(...args)),
    signUp: (...args) => dispatch(signUp(...args)),
    signUpEmpty: (...args) => dispatch(signUpEmpty(...args)),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(SignUp);
