import React from 'react';
import {connect} from 'react-redux';
import {signUpChange, signUp, signUpEmpty} from '../redux/action-creators';
import {preventDefault} from '../utils';
import {captcha as captchaConfig} from '../config';
import Recaptcha from 'react-google-recaptcha';
import validator from 'validator';

const USERNAME_STOP_LIST = [
  'anonymous', 'public', 'about', 'signin', 'logout',
  'signup', 'filter', 'settings', 'account', 'groups',
  'friends', 'list', 'search', 'summary', 'share', '404',
  'iphone', 'attachments', 'files', 'profilepics', 'people'
];

function isValidUsername(username) {
  let valid = username
        && username.length >= 3
        && username.length <= 25
        && username.match(/^[A-Za-z0-9]+$/)
        && USERNAME_STOP_LIST.indexOf(username) == -1;

  return valid;
}

function isValidEmail(email) {
  return email && validator.isEmail(email);
}

function isValidPassword(password) {
  return password && password.length > 4;
}

function capitalizeFirstLetter(str) {
  return str.replace(/^\w/g, l => l.toUpperCase());
}

function validate(props) {
  let errorMessages = [];

  if (!isValidUsername(props.username)) {
    errorMessages.push('invalid username');
  }

  if (!isValidPassword(props.password)) {
    errorMessages.push('invalid password');
  }

  if (!isValidEmail(props.email)) {
    errorMessages.push('invalid email');
  }

  if (captchaConfig.siteKey !== '' && !props.captcha) {
    errorMessages.push('captcha is not filled');
  }

  return errorMessages.length == 0 ? null : capitalizeFirstLetter(errorMessages.join(', '));
}

function signUpFunc(props) {
  let errorMessage = validate(props);

  if (!errorMessage) {
    props.signUp({...props});
  } else {
    props.signUpEmpty(errorMessage);
  }
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
              <input id="username-input" className="form-control" type="text" onChange={e => props.signUpChange({username: e.target.value})}/>
            </div>

            <div className="form-group">
              <label htmlFor="email-input">Email</label>
              <input id="email-input" className="form-control" type="email" onChange={e => props.signUpChange({email: e.target.value})}/>
            </div>

            <div className="form-group">
              <label htmlFor="password-input">Password</label>
              <input id="password-input" className="form-control" type="password" onChange={e => props.signUpChange({password: e.target.value})}/>
            </div>

            {captchaConfig.siteKey ? (
              <div className="form-group">
                <Recaptcha
                  sitekey={captchaConfig.siteKey}
                  theme="light"
                  type="image"
                  onChange={v => props.signUpChange({captcha: v})}
                  onExpired={v => props.signUpChange({captcha: null})} />
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
  return {...state.signUpForm};
}

function mapDispatchToProps(dispatch) {
  return {
    signUpChange: (...args) => dispatch(signUpChange(...args)),
    signUp: (...args) => dispatch(signUp(...args)),
    signUpEmpty: (...args) => dispatch(signUpEmpty(...args)),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(SignUp);
