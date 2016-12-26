import React from 'react';

import { preventDefault } from '../../utils';

export default class UserChangePasswordForm extends React.Component {
  refCurrentPassword = (input) => { this.currentPassword = input; };
  refPassword = (input) => { this.password = input; };
  refPasswordConfirmation = (input) => { this.passwordConfirmation = input; };

  updatePassword = () => {
    if (!this.props.isSaving) {
      this.props.updatePassword({
        currentPassword: this.currentPassword.value,
        password: this.password.value,
        passwordConfirmation: this.passwordConfirmation.value
      });
    }
  };

  render() {
    return (
      <form onSubmit={preventDefault(this.updatePassword)}>
        <h3>Change password</h3>

        <div className="form-group">
          <label htmlFor="currentPassword">Current password:</label>
          <input id="currentPassword" className="form-control" ref={this.refCurrentPassword} type="password"/>
        </div>

        <div className="form-group">
          <label htmlFor="password">New password:</label>
          <input id="password" className="form-control" ref={this.refPassword} type="password"/>
        </div>

        <div className="form-group">
          <label htmlFor="passwordConfirmation">Confirm password:</label>
          <input id="passwordConfirmation" className="form-control" ref={this.refPasswordConfirmation} type="password"/>
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
