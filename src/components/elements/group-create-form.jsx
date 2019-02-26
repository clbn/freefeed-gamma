import React from 'react';
import { Link } from 'react-router';

import { preventDefault } from '../../utils';
import GroupTypeSelector from './group-type-selector';
import Throbber from './throbber';

export default class GroupCreateForm extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      username: '',
      screenName: '',
      description: '',
      isPrivate: '0',
      isProtected: '0',
      isRestricted: '0'
    };
  }

  changeProperty = (property) => (event) => {
    const newState = {};
    newState[property] = event.target.value;
    this.setState(newState);
  };

  changeGroupType = (newType) => {
    this.setState(newType);
  };

  saveSettings = () => {
    if (this.props.status !== 'loading') {
      this.props.createGroup(this.state);
    }
  };

  componentWillUnmount() {
    this.props.resetGroupCreateForm();
  }

  render() {
    return <>
      {this.props.status !== 'success' ? (
        <form onSubmit={preventDefault(this.saveSettings)}>
          <div className="form-group">
            <label htmlFor="username">Username:</label>
            <input id="username" className="form-control" name="username" type="text" value={this.state.username} onChange={this.changeProperty('username')}/>
          </div>

          <div className="form-group">
            <label htmlFor="screenName">Display name:</label>
            <input id="screenName" className="form-control" name="screenName" type="text" value={this.state.screenName} onChange={this.changeProperty('screenName')}/>
          </div>

          <div className="form-group">
            <label htmlFor="description">Description:</label>
            <textarea id="description" className="form-control" name="description" value={this.state.description} onChange={this.changeProperty('description')} maxLength="1500"/>
          </div>

          <GroupTypeSelector
            originalState={{}}
            currentState={this.state}
            changeGroupType={this.changeGroupType}/>

          <p>
            <button className="btn btn-default" type="submit">Create</button>

            {this.props.status === 'loading' && (
              <Throbber name="settings"/>
            )}
          </p>
        </form>
      ) : false}

      {this.props.status === 'success' ? (
        <div className="alert alert-info" role="alert">
          Group has been created.{' '}
          <Link to={this.props.groupUrl}>Go to the group page »</Link>
        </div>
      ) : this.props.status === 'error' ? (
        <div className="alert alert-danger" role="alert">{this.props.errorMessage}</div>
      ) : false}
    </>;
  }
}
