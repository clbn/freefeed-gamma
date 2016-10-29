import React from 'react';
import classnames from 'classnames';

import {preventDefault} from '../../utils';
import throbber16 from 'assets/images/throbber-16.gif';

export default class UserSettingsForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      notReady: props.user.screenName === undefined,
      displayName: props.user.screenName || '',
      email: props.user.email || '',
      description: props.user.description,
      isPrivate: props.user.isPrivate
    };
  }

  componentWillReceiveProps(newProps) {
    if (this.state.notReady) {
      this.setState({
        notReady: newProps.user.screenName === undefined,
        displayName: newProps.user.screenName || '',
        email: newProps.user.email || '',
        description: newProps.user.description,
        isPrivate: newProps.user.isPrivate
      });
    }
  }

  changeInput = (name) => (event) => {
    this.setState({
      [name]: event.target.value
    });
  }

  changeCheckbox = (event) => {
    this.setState({
      isPrivate: (event.target.checked ? '1' : '0')
    });
  }

  updateUser = () => {
    if (this.props.status !== 'loading') {
      this.props.updateUser(
        this.props.user.id, this.state.displayName, this.state.email,
        this.state.isPrivate, this.state.description
      );
    }
  }

  componentWillUnmount() {
    this.props.resetUserSettingsForm();
  }

  render() {
    const displayNameClasses = classnames({
      'form-group': true,
      'has-feedback': true,
      'has-error': (this.state.displayName.length < 3 || this.state.displayName.length > 25)
    });

    return (
      <form onSubmit={preventDefault(this.updateUser)}>
        <div className={displayNameClasses}>
          <label htmlFor="displayName-input">Display name:</label>
          <input id="displayName-input" className="form-control" name="screenName" type="text" value={this.state.displayName} onChange={this.changeInput('displayName')}/>
          <span className="character-counter">{this.state.displayName.length} / 25</span>
        </div>

        <div className="form-group">
          <label htmlFor="email-input">Email:</label>
          <input id="email-input" className="form-control" name="email" ref="email" type="email" value={this.state.email} onChange={this.changeInput('email')}/>
        </div>

        <div className="form-group">
          <label htmlFor="description-textarea">Description:</label>
          <textarea id="description-textarea" className="form-control" name="description" ref="description" value={this.state.description} onChange={this.changeInput('description')} maxLength="1500"/>
        </div>

        <div className="checkbox">
          <label>
            <input type="checkbox" name="isPrivate" ref="isPrivate" checked={this.state.isPrivate === '1'} onChange={this.changeCheckbox}/>
            Private feed
            <small> (only let people I approve see my feed)</small>
          </label>
        </div>

        <div className="form-group">
          <button className="btn btn-default" type="submit">Update</button>

          {this.props.status === 'loading' ? (
            <span className="settings-throbber">
              <img width="16" height="16" src={throbber16}/>
            </span>
          ) : false}
        </div>

        {this.props.status === 'success' ? (
          <div className="alert alert-info" role="alert">Profile settings have been updated</div>
        ) : this.props.status === 'error' ? (
          <div className="alert alert-danger" role="alert">{this.props.errorMessage}</div>
        ) : false}
      </form>
    );
  }
}
