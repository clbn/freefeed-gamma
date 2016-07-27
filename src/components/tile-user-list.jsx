import React from 'react';
import {Link} from 'react-router';
import classnames from 'classnames';
import _ from 'lodash';

import UserName from './user-name';
import {confirmFirst} from '../utils';

const renderUsers = (type) => (user) => {
  return (
    <li key={user.id} className="user-tile">
      {type == WITH_REQUEST_HANDLES ? (
        <div>
          <a className="user-action user-action-good" onClick={() => user.acceptRequest(user.username)}>
            <span>Accept</span>
            <i className="fa fa-thumbs-up fa-fw"></i>
          </a>
          <a className="user-action user-action-bad" onClick={() => user.rejectRequest(user.username)}>
            <i className="fa fa-thumbs-down fa-fw fa-flip-horizontal"></i>
            <span>Decline</span>
          </a>
        </div>
      ) : false}

      {type == WITH_REVOKE_SENT_REQUEST ? (
        <div>
          <a className="user-action user-action-bad" onClick={() => user.revokeSentRequest({username: user.username, id: user.id})} title="Revoke sent request">
            <i className="fa fa-times fa-fw"></i>
            <span>Revoke</span>
          </a>
        </div>
      ) : false}

      {type == WITH_REMOVE_AND_MAKE_ADMIN_HANDLES ? (
        <div>
          <a className="user-action user-action-good" onClick={() => user.makeAdmin(user)} title="Promote user to admin">
            <span>Promote</span>
            <i className="fa fa-level-up fa-fw"></i>
          </a>
          <a className="user-action user-action-bad" onClick={confirmFirst(() => user.remove(user.username))} title="Unsubscribe user from the group">
            <i className="fa fa-times fa-fw"></i>
            <span>Unsubscribe</span>
          </a>
        </div>
      ) : false}

      {type == WITH_REMOVE_ADMIN_RIGHTS ? (
        <div>
          <a className="user-action user-action-bad" onClick={confirmFirst(() => user.removeAdminRights(user))} title="Demote user from admin">
            <i className="fa fa-level-down fa-fw"></i>
            <span>Demote</span>
          </a>
        </div>
      ) : false}

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

export const tileUserListFactory = (config) => (props) => {
  const usersData = props.users.map(user => {
    return {
      ..._.pick(user, ['id', 'screenName', 'username']),
      profilePictureUrl:
        (user.profilePictureUrl
          ? user.profilePictureUrl
          : (config.size === 'large'
            ? user.profilePictureLargeUrl
            : user.profilePictureMediumUrl)),
      ...pickActions(config.type, props)
    };
  });

  const users = usersData.map(renderUsers(config.type));

  const listClasses = classnames({
    'tile-list': true,
    'large-pics': config.size === 'large'
  });

  const header = props.header && config.displayQuantity ?
    props.header + ` (${props.users.length})` :
    props.header;

  return (
    <div>
      {users.length ? (
        <div>
          <h3>{header}</h3>
          <ul className={listClasses}>
            {users}
          </ul>
        </div>
      ) : false}
    </div>
  );
};
