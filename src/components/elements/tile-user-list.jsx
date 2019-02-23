import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';
import classnames from 'classnames';
import _ from 'lodash';

import UserName from './user-name';
import { confirmFirst } from '../../utils';
import throbber16 from 'assets/images/throbber-16.gif';
import Icon from "./icon";
import Userpic from './userpic';

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
    const { type, user, altDisplay } = this.props;

    return (
      <li className={this.tileClasses}>
        <div className="userpic">
          <Link to={`/${user.username}`}>
            <Userpic id={user.id} size={50}/>
          </Link>
        </div>

        <div className="user-tile-name">
          <UserName id={user.id} display={user[altDisplay]}/>
        </div>

        {user.status === 'loading' ? (
          <div className="user-actions user-actions-throbber">
            <img width="16" height="16" src={throbber16}/>
          </div>
        ) : (
          <div className="user-actions">
            {type === WITH_REQUEST_HANDLES ? (
              <a className="user-action user-action-good" onClick={this.handleAcceptRequest}>
                <Icon name="thumbs-up"/>
                Accept
              </a>
            ) : false}
            {type === WITH_REQUEST_HANDLES ? (
              <a className="user-action user-action-bad" onClick={this.handleRejectRequest}>
                <Icon name="thumbs-down"/>
                Reject
              </a>
            ) : false}

            {type === WITH_REVOKE_SENT_REQUEST ? (
              <a className="user-action user-action-bad" onClick={this.handleRevokeSentRequest} title="Revoke sent request">
                <Icon name="times"/>
                Revoke
              </a>
            ) : false}

            {type === WITH_REMOVE_AND_MAKE_ADMIN_HANDLES ? (
              <a className="user-action user-action-good" onClick={this.handlePromote} title="Promote user to admin">
                <Icon name="level-up"/>
                Promote
              </a>
            ) : false}
            {type === WITH_REMOVE_AND_MAKE_ADMIN_HANDLES ? (
              <a className="user-action user-action-bad" onClick={this.handleUnsubscribe} title="Unsubscribe user from the group">
                <Icon name="times"/>
                Unsubscribe
              </a>
            ) : false}

            {type === WITH_REMOVE_ADMIN_RIGHTS ? (
              <a className="user-action user-action-bad" onClick={this.handleDemote} title="Demote user from admin">
                <Icon name="level-down"/>
                Demote
              </a>
            ) : false}
          </div>
        )}
      </li>
    );
  }
}

UserTile.propTypes = {
  type: PropTypes.string.isRequired,
  user: PropTypes.object.isRequired,
  altDisplay: PropTypes.string
};

const renderUsers = (type, altDisplay) => (user) => <UserTile key={user.id} type={type} user={user} altDisplay={altDisplay}/>;

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
        ..._.pick(user, ['id', 'status', 'updatedAt', 'username', 'screenName']),
        ...pickActions(config.type, props)
      };
    });

    if (this.state.selectedOrder) {
      usersData = _.sortBy(usersData, (user) => user[this.state.selectedOrder].toLowerCase());

      if (this.state.isReverse) {
        usersData = usersData.reverse();
      }
    }

    let altDisplay = null;
    if (['username', 'screenName'].indexOf(this.state.selectedOrder) > -1) {
      altDisplay = this.state.selectedOrder;
    }
    const users = usersData.map(renderUsers(config.type, altDisplay));

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
          <Fragment key={index}>
            {index > 0 ? ', ' : ' '}
            {option.key === this.state.selectedOrder ? (
              <b>{option.label}</b>
            ) : (
              <a onClick={this.switchOrder(option.key, !!option.isReverse)}>{option.label}</a>
            )}
          </Fragment>
        ))}
      </p>
    ) : false);

    return (users.length ? <>
      <h3>{header}</h3>

      {sortingOptions}

      <ul className={listClasses}>
        {users}
      </ul>
    </> : false);
  }
}

export const tileUserListFactory = (config) => (props) => <TileUserList config={config} {...props}/>;
