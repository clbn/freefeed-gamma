import React from 'react';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import _ from 'lodash';

import { tileUserListFactory, PLAIN } from './tile-user-list';
import throbber100 from 'assets/images/throbber.gif';

const TileList = tileUserListFactory({ type: PLAIN });

const UserSubscribers = (props) => {
  if (props.viewUser.isPrivate === '1' && !props.viewUser.amISubscribedToUser && !props.viewUser.isItMe) {
    return (
      <div className="box-body feed-message">
        <p><b>{props.viewUser.screenName}</b> has a private feed.</p>
      </div>
    );
  }

  return (
    <div className="box-body">
      <h4 className="user-subheader">
        {props.boxHeader.title}

        {props.viewUser.amIGroupAdmin ? (
          <div className="user-subheader-sidelinks">
            <Link to={`/${props.viewUser.username}/manage-subscribers`}>Manage subscribers</Link>
          </div>
        ) : false}
      </h4>

      {props.isLoading ? (
        <img width="100" height="100" src={throbber100}/>
      ) : (
        props.groupAdmins.length > 0 ? (
          <div>
            <TileList header="Admins" users={props.groupAdmins} sorting={props.sorting}/>

            {props.users.length === 0 ? (
              <div>
                <h3>Other subscribers</h3>
                <div>There are none. Everyone is admin.</div>
              </div>
            ) : (
              <TileList header="Other subscribers" users={props.users} sorting={props.sorting}/>
            )}
          </div>
        ) : (
          <TileList users={props.users} sorting={props.sorting}/>
        )
      )}
    </div>
  );
};

function mapStateToProps(state, ownProps) {
  const isItMe = (state.user.username === ownProps.params.userName);
  let groupAdmins = [];
  let users = [];
  let sorting = null;

  if (isItMe) {
    // Subscribers are the list of users, not IDs.
    // Subscribers are in reverse chronological order, so we don't need to sort them.
    users = (state.user.subscribers || [])
      .map((u) => state.users[u.id] || {})
      .filter((u) => u.type === 'user');

    sorting = [
      { 'key': null, 'label': 'date they subscribed (most recent first)' },
      { 'key': 'username', 'label': 'username' },
      { 'key': 'screenName', 'label': 'display name' }
    ];
  } else {
    users = _.sortBy(state.usernameSubscribers.payload, 'username');

    const group = ownProps.viewUser;
    if (group.type === 'group' && group.administrators) {
      groupAdmins = group.administrators.map((userId) => state.users[userId]);
      groupAdmins = _.sortBy(groupAdmins, 'username');

      users = _.filter(users, (user) => {
        return !groupAdmins.find(u => u.username === user.username);
      });
    }
  }

  return {
    isItMe,
    groupAdmins,
    users,
    sorting,
    isLoading: !isItMe && state.usernameSubscribers.isPending
  };
}

export default connect(mapStateToProps)(UserSubscribers);
