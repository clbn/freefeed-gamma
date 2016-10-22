import React from 'react';

import {preventDefault} from '../utils';

export default class UserChangePasswordForm extends React.Component {
  updatePassword = () => {
    if (!this.props.isSaving) {
      this.props.updatePassword({
        currentPassword: this.refs.currentPassword.value,
        password: this.refs.password.value,
        passwordConfirmation: this.refs.passwordConfirmation.value
      });
    }
  }

  render() {
    return (
      <form onSubmit={preventDefault(this.updatePassword)}>
        <h3>Change password</h3>

        <div className="form-group">
          <label htmlFor="currentPassword">Current password:</label>
          <input id="currentPassword" className="form-control" ref="currentPassword" type="password"/>
        </div>

        <div className="form-group">
          <label htmlFor="password">New password:</label>
          <input id="password" className="form-control" ref="password" type="password"/>
        </div>

        <div className="form-group">
          <label htmlFor="passwordConfirmation">Confirm password:</label>
          <input id="passwordConfirmation" className="form-control" ref="passwordConfirmation" type="password"/>
        </div>

        <p>
          <button className="btn btn-default" type="submit">Update Password</button>
        </p>

        {this.props.success ? (
          <div className="alert alert-info" role="alert">Your password has been changed</div>
        ) : false}

        {this.props.error ? (
          <div className="alert alert-danger" role="alert">{this.props.errorText}</div>
        ) : false}
      </form>
    );
  }
}
