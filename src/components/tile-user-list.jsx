import React from 'react';
import {Link} from 'react-router';
import classnames from 'classnames';
import _ from 'lodash';

import UserName from './user-name';
import {confirmFirst} from '../utils';
import throbber16 from 'assets/images/throbber-16.gif';

const renderUsers = (type) => (user) => {
  return (
    <li key={user.id} className="user-tile">
      {user.status === 'loading' ? (
        <div className="user-action user-action-throbber">
          <img width="16" height="16" src={throbber16}/>
        </div>
      ) : (
        <div>
          {type === WITH_REQUEST_HANDLES ? (
            <a className="user-action user-action-good" onClick={() => user.acceptRequest(user.username)}>
              <span>Accept</span>
              <i className="fa fa-thumbs-up fa-fw"></i>
            </a>
          ) : false}
          {type === WITH_REQUEST_HANDLES ? (
            <a className="user-action user-action-bad" onClick={() => user.rejectRequest(user.username)}>
              <i className="fa fa-thumbs-down fa-fw fa-flip-horizontal"></i>
              <span>Reject</span>
            </a>
          ) : false}

          {type == WITH_REVOKE_SENT_REQUEST ? (
            <a className="user-action user-action-bad" onClick={() => user.revokeSentRequest({username: user.username, id: user.id})} title="Revoke sent request">
              <i className="fa fa-times fa-fw"></i>
              <span>Revoke</span>
            </a>
          ) : false}

          {type == WITH_REMOVE_AND_MAKE_ADMIN_HANDLES ? (
            <a className="user-action user-action-good" onClick={() => user.makeAdmin(user)} title="Promote user to admin">
              <span>Promote</span>
              <i className="fa fa-level-up fa-fw"></i>
            </a>
          ) : false}
          {type == WITH_REMOVE_AND_MAKE_ADMIN_HANDLES ? (
            <a className="user-action user-action-bad" onClick={confirmFirst(() => user.remove(user.username))} title="Unsubscribe user from the group">
              <i className="fa fa-times fa-fw"></i>
              <span>Unsubscribe</span>
            </a>
          ) : false}

          {type == WITH_REMOVE_ADMIN_RIGHTS ? (
            <a className="user-action user-action-bad" onClick={confirmFirst(() => user.removeAdminRights(user))} title="Demote user from admin">
              <i className="fa fa-level-down fa-fw"></i>
              <span>Demote</span>
            </a>
          ) : false}
        </div>
      )}

      <div className="userpic">
        {type == PLAIN ? (
          <Link to={`/${user.username}`}>
            <img src={user.profilePictureUrl} width="50" height="50"/>
          </Link>
        ) : (
          <img src={user.profilePictureUrl} width="50" height="50"/>
        )}
      </div>

      <UserName user={user}/>
    </li>
  );
};

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
      'tile-list': true,
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
