import React from 'react';
import {Link} from 'react-router';
import {connect} from 'react-redux';
import _ from 'lodash';

import {tileUserListFactory, PLAIN} from './tile-user-list';
import throbber100 from 'assets/images/throbber.gif';

const TileList = tileUserListFactory({type: PLAIN});

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
        <TileList users={props.users}/>
      )}
    </div>
  );
};

function mapStateToProps(state) {
  return {
    users: _.sortBy(state.usernameSubscribers.payload, 'username'),
    isLoading: state.usernameSubscribers.isPending
  };
}

export default connect(mapStateToProps)(UserSubscribers);
