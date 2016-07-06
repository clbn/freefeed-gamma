import React from 'react';
import {Link} from 'react-router';
import {connect} from 'react-redux';

import {userActions} from './select-utils';
import {getUserInfo} from '../redux/action-creators';
import throbber16 from 'assets/images/throbber-16.gif';

class UserCard extends React.Component {
  constructor(props) {
    super(props);

    // Load this user's info if it's not in the store already
    if (!props.user.id && !props.user.errorMessage) {
      setTimeout(() => props.getUserInfo(props.username), 0);
    }
  }

  unsubscribe = () => {
    if (this.props.amIGroupAdmin) {
      alert('You are the Admin for this group. If you want to unsubscribe please drop administrative privileges first.');
    } else {
      this.props.unsubscribe({username: this.props.user.username, id: this.props.user.id});
    }
  }

  render() {
    const props = this.props;

    return (
      props.user.errorMessage ? (
        <div className="user-card">
          <div className="user-card-info">
            <div className="userpic userpic-large userpic-error">
              <i className="fa fa-exclamation"></i>
            </div>
            <div className="username">@{props.user.username}</div>
            <div className="description">{props.user.errorMessage}</div>
          </div>
        </div>
      ) : !props.user.id ? (
        <div className="user-card">
          <div className="user-card-info">
            <div className="userpic userpic-large userpic-loading"></div>
            <div className="username">
              <img width="16" height="16" src={throbber16}/>
            </div>
          </div>
        </div>
      ) : (
        <div className="user-card">
          <div className="user-card-info">
            <Link to={`/${props.user.username}`} className="userpic userpic-large">
              <img src={props.user.profilePictureLargeUrl} width="75" height="75"/>
            </Link>

            <div className="display-name">
              <Link to={`/${props.user.username}`}>{props.user.screenName}</Link>
            </div>

            {props.user.screenName !== props.user.username ? (
              <div className="username">@{props.user.username}</div>
            ) : false}

            {props.isItMe ? (
              <div className="description">It's you!</div>
            ) : (
              <div className="description">
                {props.user.isPrivate === '1' ? (
                  <span><i className="fa fa-lock"></i> Private</span>
                ) : (
                  <span><i className="fa fa-globe"></i> Public</span>
                )}
                {props.user.isRestricted === '1' ? ' restricted' : false}
                {props.user.type === 'user' ? ' feed' : ' group'}
              </div>
            )}
          </div>

          {props.blocked ? (
            <div className="user-card-actions">
              <span>Blocked user - </span>
              <a onClick={()=>props.unban({username: props.user.username, id: props.user.id})}>Un-block</a>
            </div>
          ) : !props.isItMe ? (
            <div className="user-card-actions">
              {props.user.isPrivate === '1' && !props.subscribed ? (
                props.hasRequestBeenSent ? (
                  <span>Subscription request sent</span>
                ) : (
                  <a onClick={()=>props.sendSubscriptionRequest({username: props.user.username, id: props.user.id})}>Request a subscription</a>
                )
              ) : (
                props.subscribed ? (
                  <a onClick={this.unsubscribe}>Unsubscribe</a>
                ) : (
                  <a onClick={()=>props.subscribe({username: props.user.username, id: props.user.id})}>Subscribe</a>
                )
              )}

              {props.userView.isSubscribing ? (
                <span className="user-card-actions-throbber">
                  <img width="15" height="15" src={throbber16}/>
                </span>
              ) : false}

              {props.user.type !== 'group' && !props.subscribed ? (
                <span> - <a onClick={()=>props.ban({username: props.user.username, id: props.user.id})}>Block</a></span>
              ) : props.amIGroupAdmin ? (
                <span> - <Link to={`/${props.user.username}/settings`}>Settings</Link></span>
              ) : false}

              {props.userView.isBlocking ? (
                <span className="user-card-actions-throbber">
                  <img width="15" height="15" src={throbber16}/>
                </span>
              ) : false}
            </div>
          ) : false}
        </div>
      )
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  const me = state.user;

  const user = (_.find(state.users, {username: ownProps.username}) || {});
  if (!user.id) {
    user.username = ownProps.username;
    user.errorMessage = state.userErrors[ownProps.username];
  }

  const userView = (state.userViews[user.id] || {});

  return {
    user,
    userView,
    isItMe: (me.username === user.username),
    subscribed: ((me.subscriptions || []).indexOf(user.id) > -1),
    hasRequestBeenSent: ((me.pendingSubscriptionRequests || []).indexOf(user.id) > -1),
    blocked: ((me.banIds || []).indexOf(user.id) > -1),
    amIGroupAdmin: (user.type === 'group' && (user.administrators || []).indexOf(me.id) > -1)
  };
};

function mapDispatchToProps(dispatch) {
  return {
    ...userActions(dispatch),
    getUserInfo: (username) => dispatch(getUserInfo(username))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(UserCard);
