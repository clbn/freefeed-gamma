import React from 'react';
import {connect} from 'react-redux';

import {getUserFeed, getUserComments, getUserLikes} from '../redux/action-creators';
import PaginatedView from './paginated-view';
import Feed from './feed';
import throbber16 from 'assets/images/throbber-16.gif';

class UserFeed extends React.Component {
  componentWillReceiveProps(newProps) {
    if (newProps.pathname === this.props.pathname && newProps.offset !== this.props.offset) {
      if (this.props.currentRoute === 'userFeed') {
        this.props.getUserFeed(newProps.viewUser.username, newProps.offset);
      } else if (this.props.currentRoute === 'userComments') {
        this.props.getUserComments(newProps.viewUser.username, newProps.offset);
      } else if (this.props.currentRoute === 'userLikes') {
        this.props.getUserLikes(newProps.viewUser.username, newProps.offset);
      }
    }
  }

  render() {
    const props = this.props;

    return (
      <div>
        {props.viewUser.blocked ? (
          <div className="box-body feed-message">
            <p>You have blocked <b>{props.viewUser.screenName}</b>, so all of their posts and comments are invisible to you.</p>
            <p>
              {props.viewUser.userView.isBlocking ? 'Unblocking...' : <a onClick={()=>props.userActions.unban({username: props.viewUser.username, id: props.viewUser.id})}>Un-block</a>}

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
  }
}

function mapStateToProps(state) {
  return {
    pathname: state.routing.locationBeforeTransitions.pathname,
    offset: state.routing.locationBeforeTransitions.query.offset
  };
}

function mapDispatchToProps(dispatch) {
  return {
    getUserFeed: (...args) => dispatch(getUserFeed(...args)),
    getUserComments: (...args) => dispatch(getUserComments(...args)),
    getUserLikes: (...args) => dispatch(getUserLikes(...args))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(UserFeed);
