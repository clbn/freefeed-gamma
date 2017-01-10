import React from 'react';

import PaginatedView from './paginated-view';
import Feed from './feed';

export default (props) => (
  <div>
    {props.viewUser.isBlocked ? (
      <div className="box-body feed-message">
        <p>You have blocked <b>{props.viewUser.screenName}</b>, so all of their posts and comments are invisible to you.</p>
      </div>
    ) : props.viewUser.isPrivate === '1' && !props.viewUser.amISubscribedToUser && !props.viewUser.isItMe ? (
      <div className="box-body feed-message">
        <p><b>{props.viewUser.screenName}</b> has a private feed.</p>
      </div>
    ) : props.viewUser.isProtected === '1' && !props.viewUser.authenticated ? (
      <div className="box-body feed-message">
        <p><b>{props.viewUser.screenName}</b> has a protected feed. It is only visible to FreeFeed users.</p>
      </div>
    ) : (
      <PaginatedView {...props}>
        <Feed {...props}/>
      </PaginatedView>
    )}
  </div>
);
