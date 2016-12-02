import React from 'react';

import {preventDefault} from '../../utils';
import throbber16 from 'assets/images/throbber-16.gif';
import GroupFeedTypePicker from './group-feed-type-picker';

export default class GroupSettingsForm extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      screenName: this.props.group.screenName,
      description: this.props.group.description,
      isPrivate: this.props.group.isPrivate,
      isProtected: this.props.group.isProtected,
      isRestricted:  this.props.group.isRestricted
    };
  }

  componentWillReceiveProps = (newProps) => {
    if (newProps.status !== "loading") {
      this.setState({
        screenName: newProps.group.screenName,
        description: newProps.group.description,
        isPrivate: newProps.group.isPrivate,
        isProtected: newProps.group.isProtected,
        isRestricted: newProps.group.isRestricted
      });
    }
  }

  handleChange = (property) => (event) => {
    const newState = {};
    newState[property] = event.target.value;
    this.setState(newState);
  }

  changeGroupType = (newType) => {
    this.setState(newType);
  };

  saveSettings = () => {
    if (this.props.status !== 'loading') {
      this.props.updateGroup(this.props.group.id, this.state);
    }
  }

  componentWillUnmount() {
    this.props.resetGroupUpdateForm();
  }

  render() {
    return (
      <form onSubmit={preventDefault(this.saveSettings)}>
        <div className="form-group">
          <label htmlFor="screenName">Display name:</label>
          <input id="screenName" className="form-control" name="screenName" type="text" value={this.state.screenName} onChange={this.handleChange('screenName')}/>
        </div>

        <div className="form-group">
          <label htmlFor="description">Description:</label>
          <textarea id="description" className="form-control" name="description" value={this.state.description} onChange={this.handleChange('description')} maxLength="1500"/>
        </div>

        <GroupFeedTypePicker
          originalState={this.props.group}
          currentState={this.state}
          changeGroupType={this.changeGroupType}/>

        <p>
          <button className="btn btn-default" type="submit">Update</button>

          {this.props.status === 'loading' ? (
            <span className="settings-throbber">
              <img width="16" height="16" src={throbber16}/>
            </span>
          ) : false}
        </p>

        {this.props.status === 'success' ? (
          <div className="alert alert-info" role="alert">Updated!</div>
        ) : this.props.status === 'error' ? (
          <div className="alert alert-danger" role="alert">{this.props.errorMessage}</div>
        ) : false}
      </form>);
  }
}
