import React from 'react';
import {connect} from 'react-redux';

import {createPost, resetPostCreateForm} from '../redux/action-creators';
import {joinPostData, joinCreatePostData, postActions, userActions} from '../redux/select-utils';
import {getCurrentRouteName} from '../utils';
import UserProfile from './elements/user-profile';
import UserSubscribers from './elements/user-subscribers';
import UserSubscriptions from './elements/user-subscriptions';
import UserManageSubscribers from './elements/user-manage-subscribers';
import UserFeed from './elements/user-feed';

const User = (props) => {
  return (
    <div className="box">
      <UserProfile
        {...props.viewUser}
        {...props.userActions}
        isInUserPostFeed={props.isInUserPostFeed}
        user={props.user}
        sendTo={props.sendTo}
        createPost={props.createPost}
        resetPostCreateForm={props.resetPostCreateForm}
        createPostForm={props.createPostForm}
        addAttachmentResponse={props.addAttachmentResponse}
        removeAttachment={props.removeAttachment}/>

      {props.viewUser.isUserFound ? (
        props.currentRoute === 'userSubscribers' ? (
          <UserSubscribers {...props}/>
        ) : props.currentRoute === 'userSubscriptions' ? (
          <UserSubscriptions {...props}/>
        ) : props.currentRoute === 'userManageSubscribers' ? (
          <UserManageSubscribers {...props}/>
        ) : (
          <UserFeed
            {...props}
            isLoading={props.viewUser.isLoading}/>
        )
      ) : false}
    </div>
  );
};

function mapStateToProps(state, ownProps) {
  const user = state.user;
  const authenticated = state.authenticated;
  const visibleEntries = state.feedViewState.visibleEntries.map(joinPostData(state));
  const createPostForm = joinCreatePostData(state);
  const boxHeader = state.boxHeader;
  const requestedUsername = ownProps.params.userName;
  const foundUser = Object.getOwnPropertyNames(state.users)
    .map(key => state.users[key] || state.subscribers[key])
    .filter(user => user.username === requestedUsername)[0];

  const amIGroupAdmin = (
    authenticated &&
    foundUser &&
    foundUser.type === 'group' &&
    ((foundUser.administrators || []).indexOf(state.user.id) > -1)
  );

  const currentRoute = getCurrentRouteName(ownProps);
  const isInUserPostFeed = (currentRoute === 'userFeed');

  const statusExtension = {
    authenticated,
    isLoading: state.routeLoadingState,
    requestedUsername,
    isUserFound: !!foundUser,
    isItMe: (foundUser ? foundUser.username === user.username : false),
    userView: (foundUser && state.userViews[foundUser.id] || {}),
    amIGroupAdmin,
    amISubscribedToUser: authenticated && foundUser && (user.subscriptions.indexOf(foundUser.id) > -1),
    isUserSubscribedToMe: authenticated && foundUser && (_.findIndex(user.subscribers, {id: foundUser.id}) > -1),
    blocked: authenticated && foundUser && (user.banIds.indexOf(foundUser.id) > -1),
    hasRequestBeenSent: authenticated && foundUser && ((user.pendingSubscriptionRequests || []).indexOf(foundUser.id) > -1)
  };

  statusExtension.canISeeSubsList = statusExtension.isUserFound &&
    (foundUser.isPrivate === '0' || statusExtension.amISubscribedToUser || statusExtension.isItMe);

  statusExtension.showProfileControls = authenticated && statusExtension.isUserFound &&
    !statusExtension.isItMe && !statusExtension.blocked &&
    isInUserPostFeed && boxHeader.page < 2;

  const canIPostToGroup = statusExtension.amISubscribedToUser && (foundUser.isRestricted === '0' || amIGroupAdmin);

  statusExtension.canIPostHere = statusExtension.isUserFound && isInUserPostFeed &&
    (statusExtension.isItMe || (foundUser.type === 'group' && canIPostToGroup));

  const showPaginationHeader = !isInUserPostFeed || boxHeader.page > 1;

  const viewUser = {...(foundUser), ...statusExtension};

  const sendTo = {...state.sendTo, defaultFeed: (foundUser ? foundUser.username : null)};

  return { user, visibleEntries, createPostForm, boxHeader, viewUser, sendTo, currentRoute, isInUserPostFeed, showPaginationHeader };
}

function mapDispatchToProps(dispatch) {
  return {
    ...postActions(dispatch),
    createPost: (...args) => dispatch(createPost(...args)),
    resetPostCreateForm: (...args) => dispatch(resetPostCreateForm(...args)),
    userActions: userActions(dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(User);
