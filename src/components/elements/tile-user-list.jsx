import React from 'react';
import { Link } from 'react-router';
import classnames from 'classnames';
import _ from 'lodash';

import UserName from './user-name';
import { confirmFirst } from '../../utils';
import throbber16 from 'assets/images/throbber-16.gif';

class UserTile extends React.Component {
  handleAcceptRequest = () => this.props.user.acceptRequest(this.props.user.username);
  handleRejectRequest = () => this.props.user.rejectRequest(this.props.user.username);
  handleRevokeSentRequest = () => this.props.user.revokeSentRequest({ username: this.props.user.username, id: this.props.user.id });
  handlePromote = () => this.props.user.makeAdmin(this.props.user);
  handleDemote = confirmFirst(() => this.props.user.removeAdminRights(this.props.user));
  handleUnsubscribe = confirmFirst(() => this.props.user.remove(this.props.user.username));

  tileClasses = classnames({
    'user-tile': true,
    'col-xs-3': this.props.type === PLAIN,
    'col-sm-2': this.props.type === PLAIN,
    'col-xs-12': this.props.type !== PLAIN,
    'col-sm-6': this.props.type !== PLAIN
  });

  render() {
    const type = this.props.type;
    const user = this.props.user;

    return (
      <li className={this.tileClasses}>
        <div className="userpic">
          <Link to={`/${user.username}`}>
            <img src={user.profilePictureUrl} width="50" height="50"/>
          </Link>
        </div>

        <div className="user-tile-name">
          <UserName user={user}/>
        </div>

        {user.status === 'loading' ? (
          <div className="user-actions user-actions-throbber">
            <img width="16" height="16" src={throbber16}/>
          </div>
        ) : (
          <div className="user-actions">
            {type === WITH_REQUEST_HANDLES ? (
              <a className="user-action user-action-good" onClick={this.handleAcceptRequest}>
                <i className="fa fa-thumbs-up"></i>
                <span>Accept</span>
              </a>
            ) : false}
            {type === WITH_REQUEST_HANDLES ? (
              <a className="user-action user-action-bad" onClick={this.handleRejectRequest}>
                <i className="fa fa-thumbs-down fa-flip-horizontal"></i>
                <span>Reject</span>
              </a>
            ) : false}

            {type == WITH_REVOKE_SENT_REQUEST ? (
              <a className="user-action user-action-bad" onClick={this.handleRevokeSentRequest} title="Revoke sent request">
                <i className="fa fa-times"></i>
                <span>Revoke</span>
              </a>
            ) : false}

            {type == WITH_REMOVE_AND_MAKE_ADMIN_HANDLES ? (
              <a className="user-action user-action-good" onClick={this.handlePromote} title="Promote user to admin">
                <i className="fa fa-level-up fa-flip-horizontal"></i>
                <span>Promote</span>
              </a>
            ) : false}
            {type == WITH_REMOVE_AND_MAKE_ADMIN_HANDLES ? (
              <a className="user-action user-action-bad" onClick={this.handleUnsubscribe} title="Unsubscribe user from the group">
                <i className="fa fa-times"></i>
                <span>Unsubscribe</span>
              </a>
            ) : false}

            {type == WITH_REMOVE_ADMIN_RIGHTS ? (
              <a className="user-action user-action-bad" onClick={this.handleDemote} title="Demote user from admin">
                <i className="fa fa-level-down fa-flip-horizontal"></i>
                <span>Demote</span>
              </a>
            ) : false}
          </div>
        )}
      </li>
    );
  }
}

const renderUsers = (type) => (user) => <UserTile key={user.id} type={type} user={user}/>;

export const PLAIN = 'PLAIN';
export const WITH_REQUEST_HANDLES = 'WITH_REQUEST_HANDLES';
export const WITH_REMOVE_AND_MAKE_ADMIN_HANDLES = 'WITH_REMOVE_AND_MAKE_ADMIN_HANDLES';
export const WITH_REMOVE_ADMIN_RIGHTS = 'WITH_REMOVE_ADMIN_RIGHTS';
export const WITH_REVOKE_SENT_REQUEST = 'WITH_REVOKE_SENT_REQUEST';

function pickActions(type, props) {
  switch (type) {
    case WITH_REQUEST_HANDLES: {
      return _.pick(props, ['acceptRequest', 'rejectRequest']);
    }
    case WITH_REMOVE_AND_MAKE_ADMIN_HANDLES: {
      return _.pick(props, ['makeAdmin', 'remove']);
    }
    case WITH_REMOVE_ADMIN_RIGHTS: {
      return { removeAdminRights: props.removeAdminRights };
    }
    case WITH_REVOKE_SENT_REQUEST: {
      return { revokeSentRequest: props.revokeSentRequest };
    }
  }

  return {};
}

class TileUserList extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedOrder: props.sorting && props.sorting[0].key || null,
      isReverse: props.sorting && props.sorting[0].isReverse || false
    };
  }

  switchOrder = (key, isReverse) => () => {
    this.setState({
      selectedOrder: key,
      isReverse: isReverse
    });
  };

  render() {
    const props = this.props;
    const config = props.config;

    let usersData = props.users.map(user => {
      return {
        ..._.pick(user, ['id', 'screenName', 'username', 'status', 'updatedAt']),
        profilePictureUrl:
          (user.profilePictureUrl
            ? user.profilePictureUrl
            : (config.size === 'large'
                ? user.profilePictureLargeUrl
                : user.profilePictureMediumUrl)),
        ...pickActions(config.type, props)
      };
    });

    if (this.state.selectedOrder) {
      usersData = _.sortBy(usersData, (user) => user[this.state.selectedOrder].toLowerCase());

      if (this.state.isReverse) {
        usersData = usersData.reverse();
      }
    }

    const users = usersData.map(renderUsers(config.type));

    const listClasses = classnames({
      'row': true,
      'tile-list': true,
      'with-actions': config.type !== PLAIN,
      'large-pics': config.size === 'large'
    });

    const header = props.header && config.displayQuantity
      ? props.header + ` (${props.users.length})`
      : props.header;

    const sortingOptions = (props.sorting ? (
      <p>
        Ordered by:
        {props.sorting.map((option, index) => (
          <span key={index}>
            {index > 0 ? ', ' : ' '}
            {option.key === this.state.selectedOrder ? (
              <b>{option.label}</b>
            ) : (
              <a onClick={this.switchOrder(option.key, !!option.isReverse)}>{option.label}</a>
            )}
          </span>
        ))}
      </p>
    ) : false);

    return (users.length ? (
      <div>
        <h3>{header}</h3>

        {sortingOptions}

        <ul className={listClasses}>
          {users}
        </ul>
      </div>
    ) : <div/>);
  }
}

export const tileUserListFactory = (config) => (props) => <TileUserList config={config} {...props}/>;
