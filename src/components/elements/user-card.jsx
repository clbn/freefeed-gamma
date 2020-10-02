import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import _ from 'lodash';

import { userActions } from '../../redux/select-utils';
import { getUserInfo } from '../../redux/action-creators';
import { confirmFirst } from '../../utils';
import UserFeedStatus from './user-feed-status';
import UserRelationshipStatus from './user-relationship-status';
import Icon from './icon';
import Userpic from './userpic';
import Throbber from './throbber';

const UserCard = (props) => {
  const isLoading = useRef(false);
  const [isDescriptionOpen, setDescriptionOpen] = useState(false);

  useEffect(() => {
    if (props.username && !props.user.id && !props.user.errorMessage && !isLoading.current) {
      isLoading.current = true;
      props.getUserInfo(props.username);
    }
    if (props.user.id || props.user.errorMessage) {
      isLoading.current = false;
    }
  });

  const toggleDescription = useCallback(() => setDescriptionOpen(!isDescriptionOpen), [isDescriptionOpen]);
  const handleBlock = useCallback(() => props.ban({ username: props.user.username, id: props.user.id }), []);
  const handleUnblock = useCallback(() => props.unban({ username: props.user.username, id: props.user.id }), []);
  const handleSendSubRequest = useCallback(() => props.sendSubscriptionRequest({ username: props.user.username, id: props.user.id }), []);
  const handleRevokeSentRequest = useCallback(() => props.revokeSentRequest({ username: props.user.username, id: props.user.id }), []);
  const handleSubscribe = useCallback(() => props.subscribe({ username: props.user.username, id: props.user.id }), []);
  const handleUnsubscribe = useCallback(confirmFirst(() => {
    if (props.amIGroupAdmin) {
      alert('You are the Admin for this group. If you want to unsubscribe please drop administrative privileges first.');
    } else {
      props.unsubscribe({ username: props.user.username, id: props.user.id });
    }
  }), []);

  if (props.user.errorMessage) {
    return (
      <div className="user-card">
        <div className="user-card-info">
          <div className="userpic userpic-large userpic-error">
            <Icon name="exclamation"/>
          </div>
          <div className="username">@{props.user.username}</div>
          <div className="description">{props.user.errorMessage}</div>
        </div>
      </div>
    );
  }

  if (!props.user.id) {
    return (
      <div className="user-card">
        <div className="user-card-info">
          <div className="userpic userpic-large userpic-loading"></div>
          <div className="username">
            <Throbber/>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="user-card">
      <div className="user-card-info">
        <Link to={`/${props.user.username}`} className="userpic userpic-large">
          <Userpic id={props.user.id} size={75}/>
        </Link>

        <div className="display-name">
          <Link to={`/${props.user.username}`}>{props.user.screenName}</Link>
        </div>

        <div className="username">
          @{props.user.username}
          {props.user.description && (
            <span className="description-trigger" onClick={toggleDescription}>
              <Icon name={isDescriptionOpen ? 'chevron-up' : 'chevron-down'}/>
            </span>
          )}
        </div>

        {isDescriptionOpen && (
          <div className="description">{props.user.description}</div>
        )}

        {!props.isItMe && (
          <div className="feed-status">
            <UserFeedStatus {...props.user}/>
          </div>
        )}

        {props.isItMe ? (
          <div className="relationship-status">It's you!</div>
        ) : (
          <div className="relationship-status">
            <UserRelationshipStatus type={props.user.type} {...props}/>
          </div>
        )}
      </div>

      {props.isUserBlockedByMe ? (
        <div className="user-card-actions">
          {props.userView.isBlocking ? 'Unblocking...' : <a onClick={handleUnblock}>Un-block</a>}

          {props.userView.isBlocking && (
            <Throbber name="user-card" size={15}/>
          )}
        </div>
      ) : props.authenticated && !props.isItMe && (
        <div className="user-card-actions">
          {props.acceptsDirects && (
            <><Link to={`/filter/direct?to=${props.user.username}`}>Direct message</Link> - </>
          )}

          {props.user.isPrivate === '1' && !props.amISubscribedToUser ? (
            props.hasRequestBeenSent ? (
              props.userView.isSubscribing ? 'Revoking...' : <a onClick={handleRevokeSentRequest}>Revoke sub request</a>
            ) : (
              props.userView.isSubscribing ? 'Requesting...' : <a onClick={handleSendSubRequest}>Request a subscription</a>
            )
          ) : (
            props.amISubscribedToUser ? (
              props.userView.isSubscribing ? 'Unsubscribing...' : <a onClick={handleUnsubscribe}>Unsubscribe</a>
            ) : (
              props.userView.isSubscribing ? 'Subscribing...' : <a onClick={handleSubscribe}>Subscribe</a>
            )
          )}

          {props.userView.isSubscribing && (
            <Throbber name="user-card" size={15}/>
          )}

          {props.user.type !== 'group' && !props.amISubscribedToUser ? (
            props.userView.isBlocking ? ' - Blocking...' : <> - <a onClick={handleBlock}>Block</a></>
          ) : props.amIGroupAdmin ? (
            <> - <Link to={`/${props.user.username}/settings`}>Group settings</Link></>
          ) : false}

          {props.userView.isBlocking && (
            <Throbber name="user-card" size={15}/>
          )}
        </div>
      )}
    </div>
  );
};

const mapStateToProps = (state, ownProps) => {
  const me = state.me;

  const user = (_.find(state.users, { username: ownProps.username }) || {});
  if (!user.id) {
    user.username = ownProps.username;
    user.errorMessage = state.userErrors[ownProps.username];
  }

  const userView = (state.userViews[user.id] || {});

  const authenticated = state.authenticated;

  const amISubscribedToUser = ((me.subscriptions || []).indexOf(user.id) > -1);
  const isUserSubscribedToMe = (_.findIndex(me.subscribers, { id: user.id }) > -1);
  const acceptsDirects = (me.directAccepters.indexOf(user.id) > -1) || isUserSubscribedToMe;

  return {
    user,
    userView,
    authenticated,
    isItMe: (me.username === user.username),
    amISubscribedToUser,
    isUserSubscribedToMe,
    acceptsDirects,
    hasRequestBeenSent: ((me.pendingSubscriptionRequests || []).indexOf(user.id) > -1),
    isUserBlockedByMe: ((me.banIds || []).indexOf(user.id) > -1),
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
