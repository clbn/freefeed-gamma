import React from 'react';
import classnames from 'classnames';

import { preventDefault } from '../../utils';
import throbber16 from 'assets/images/throbber-16.gif';

class FeedVisibilitySelector extends React.Component {
  levels = {
    PUBLIC: 'PUBLIC',
    PROTECTED: 'PROTECTED',
    PRIVATE: 'PRIVATE'
  };

  descriptions = {
    PUBLIC: 'Public \u2014 anyone can see the posts in my feed',
    PROTECTED: 'Protected \u2014 anonymous visitors and search engines cannot see the posts in my feed',
    PRIVATE: 'Private \u2014 only people I approve can see the posts in my feed'
  };

  changeLevel = (event) => {
    if (event.target.value === this.levels.PUBLIC) {
      this.props.changeVisibility({ isPrivate: '0', isProtected: '0' });
    } else if (event.target.value === this.levels.PROTECTED) {
      this.props.changeVisibility({ isPrivate: '0', isProtected: '1' });
    } else if (event.target.value === this.levels.PRIVATE) {
      this.props.changeVisibility({ isPrivate: '1', isProtected: '0' });
    }
  };

  render() {
    let feedLevel;
    if (this.props.isPrivate === '1') {
      feedLevel = this.levels.PRIVATE;
    } else if (this.props.isProtected === '1') {
      feedLevel = this.levels.PROTECTED;
    } else {
      feedLevel = this.levels.PUBLIC;
    }

    return (
      <div className="form-group">
        <label>Feed visibility:</label>

        {Object.keys(this.levels).map((level) => (
          <div className="radio radio-feedVisibility" key={level}>
            <label>
              <input
                type="radio"
                value={level}
                checked={feedLevel === level}
                onChange={this.changeLevel}/>
              {this.descriptions[level]}
            </label>
          </div>
        ))}
      </div>
    );
  };
};

export default class UserSettingsForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      notReady: props.user.screenName === undefined,
      displayName: props.user.screenName || '',
      email: props.user.email || '',
      description: props.user.description,
      isPrivate: props.user.isPrivate,
      isProtected: props.user.isProtected
    };
  }

  componentWillReceiveProps(newProps) {
    if (this.state.notReady) {
      this.setState({
        notReady: newProps.user.screenName === undefined,
        displayName: newProps.user.screenName || '',
        email: newProps.user.email || '',
        description: newProps.user.description,
        isPrivate: newProps.user.isPrivate,
        isProtected: newProps.user.isProtected
      });
    }
  }

  changeInput = (name) => (event) => {
    this.setState({
      [name]: event.target.value
    });
  }

  changeVisibility = (newState) => {
    this.setState(newState);
  };

  updateUser = () => {
    if (this.props.status !== 'loading') {
      this.props.updateUser(
        this.props.user.id, this.state.displayName, this.state.email,
        this.state.description, this.state.isPrivate, this.state.isProtected
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
          <input id="email-input" className="form-control" name="email" type="email" value={this.state.email} onChange={this.changeInput('email')}/>
        </div>

        <div className="form-group">
          <label htmlFor="description-textarea">Description:</label>
          <textarea id="description-textarea" className="form-control" name="description" value={this.state.description} onChange={this.changeInput('description')} maxLength="1500"/>
        </div>

        <FeedVisibilitySelector
          isPrivate={this.state.isPrivate}
          isProtected={this.state.isProtected}
          changeVisibility={this.changeVisibility}/>

        <div className="form-group">
          <button className="btn btn-default" type="submit">Update settings</button>

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
