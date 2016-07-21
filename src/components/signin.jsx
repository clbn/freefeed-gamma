import React from 'react';
import {Link} from 'react-router';
import {connect} from 'react-redux';
import {signInChange, signIn, signInEmpty} from '../redux/action-creators';
import {preventDefault} from '../utils';

function signInFunc(props) {
  if (props.username && props.password) {
    props.signIn(props.username, props.password);
  } else {
    props.signInEmpty();
  }
}

function SignIn(props) {
  return (
    <div className="box">
      <div className="row">
        <div className="col-md-6">
          <h2>Sign in</h2>

          {props.error ? (
            <div className="alert alert-danger" role="alert">
              {props.error}
            </div>
          ) : false}

          <form onSubmit={preventDefault(() => signInFunc(props))}>
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input className="form-control" type="text" onChange={e => props.signInChange(e.target.value)}/>
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input className="form-control" type="password" onChange={e => props.signInChange(undefined, e.target.value)}/>
            </div>
            <div className="form-group">
              <button className="btn btn-default" type="submit">Sign in</button>
            </div>
          </form>

          <p>New to FreeFeed? <Link to="/signup">Create an account »</Link></p>
        </div>
      </div>
    </div>
  );
}

function mapStateToProps(state) {
  return {...state.signInForm};
}

function mapDispatchToProps(dispatch) {
  return {
    signInChange: (...args) => dispatch(signInChange(...args)),
    signIn: (...args) => dispatch(signIn(...args)),
    signInEmpty: (...args) => dispatch(signInEmpty(...args)),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(SignIn);
