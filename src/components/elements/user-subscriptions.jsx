import React from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';

import { tileUserListFactory, PLAIN } from './tile-user-list';
import throbber100 from 'assets/images/throbber.gif';

const TileList = tileUserListFactory({ type: PLAIN });

const UserSubscriptions = (props) => {
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
      </h4>

      {props.isLoading ? (
        <img width="100" height="100" src={throbber100}/>
      ) : (
        <TileList users={props.users} sorting={props.sorting}/>
      )}
    </div>
  );
};

function mapStateToProps(state, ownProps) {
  const isItMe = (state.user.username === ownProps.params.userName);
  let users = [];
  let sorting = null;

  if (isItMe) {
    // Subscriptions are the list of IDs, not users.
    // Subscriptions are in chronological order, so we need to reverse them.
    users = (state.user.subscriptions || [])
      .map((id) => state.users[id] || {})
      .filter((u) => !!u.type)
      .reverse();

    sorting = [
      { 'key': null, 'label': 'date you subscribed (most recent first)' },
      { 'key': 'username', 'label': 'username' },
      { 'key': 'screenName', 'label': 'display name' }
    ];
  } else {
    users = _.sortBy(state.usernameSubscriptions.payload, 'username');
  }

  return {
    isItMe,
    users,
    sorting,
    isLoading: !isItMe && state.usernameSubscriptions.isPending
  };
}

export default connect(mapStateToProps)(UserSubscriptions);
