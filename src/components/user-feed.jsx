import React from 'react';

import PaginatedView from './paginated-view';
import Feed from './feed';
import throbber16 from 'assets/images/throbber-16.gif';

export default props => (
  <div>
    {props.viewUser.blocked ? (
      <div className="box-body feed-message">
        <p>You have blocked <b>{props.viewUser.screenName}</b>, so all of their posts and comments are invisible to you.</p>
        <p>
          <a onClick={()=>props.userActions.unban({username: props.viewUser.username, id: props.viewUser.id})}>Un-block</a>

          {props.viewUser.userView.isBlocking ? (
            <span className="feed-message-throbber">
              <img width="16" height="16" src={throbber16}/>
            </span>
          ) : false}
        </p>
      </div>
    ) : props.viewUser.isPrivate === '1' && !props.viewUser.amISubscribedToUser && !props.viewUser.isItMe ? (
      <div className="box-body feed-message">
        <p><b>{props.viewUser.screenName}</b> has a private feed.</p>
      </div>
    ) : (
      <PaginatedView {...props}>
        <Feed {...props}/>
      </PaginatedView>
    )}
  </div>
);
