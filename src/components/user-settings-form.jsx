import React from 'react';
import classnames from 'classnames';

import {preventDefault} from '../utils';
import throbber16 from 'assets/images/throbber-16.gif';

export default class UserSettingsForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      displayName: props.user.screenName
    };
  }

  changeDisplayName = (event) => {
    this.setState({
      displayName: event.target.value
    });
  }

  updateUser = () => {
    if (this.props.status !== 'loading') {
      this.props.updateUser(
        this.props.user.id, this.state.displayName, this.refs.email.value,
        (this.refs.isPrivate.checked ? '1' : '0'), this.refs.description.value
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
          <input id="displayName-input" className="form-control" name="screenName" type="text" value={this.state.displayName} onChange={this.changeDisplayName}/>
          <span className="character-counter">{this.state.displayName.length} / 25</span>
        </div>

        <div className="form-group">
          <label htmlFor="email-input">Email:</label>
          <input id="email-input" className="form-control" name="email" ref="email" type="email" defaultValue={this.props.user.email}/>
        </div>

        <div className="form-group">
          <label htmlFor="description-textarea">Description:</label>
          <textarea id="description-textarea" className="form-control" name="description" ref="description" defaultValue={this.props.user.description} maxLength="1500"/>
        </div>

        <div className="checkbox">
          <label>
            <input type="checkbox" name="isPrivate" ref="isPrivate" defaultChecked={this.props.user.isPrivate === '1'}/>
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
