import React from 'react';
import {connect} from 'react-redux';

import {createPost, resetPostCreateForm} from '../redux/action-creators';
import {joinPostData, joinCreatePostData, postActions, userActions} from './select-utils';
import {getCurrentRouteName} from '../utils';
import Breadcrumbs from './breadcrumbs';
import UserProfile from './user-profile';
import UserFeed from './user-feed';

const UserHandler = (props) => {
  return (
    <div className="box">
      <div className="box-body">
        {props.breadcrumbs.shouldShowBreadcrumbs ? <Breadcrumbs {...props.breadcrumbs}/> : false}

        <UserProfile
          {...props.viewUser}
          {...props.userActions}
          user={props.user}
          sendTo={props.sendTo}
          createPost={props.createPost}
          resetPostCreateForm={props.resetPostCreateForm}
          createPostForm={props.createPostForm}
          addAttachmentResponse={props.addAttachmentResponse}
          removeAttachment={props.removeAttachment}/>
      </div>

      <UserFeed
        {...props}
        isLoading={props.viewUser.isLoading}/>
    </div>
  );
};

function selectState(state, ownProps) {
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

  const currentRouteName = getCurrentRouteName(ownProps);
  const isInUserPostFeed = ['userComments', 'userLikes'].indexOf(currentRouteName) === -1;

  const statusExtension = {
    authenticated,
    isLoading: state.routeLoadingState,
    requestedUsername,
    isUserFound: !!foundUser,
    isItMe: (foundUser ? foundUser.username === user.username : false),
    userView: (foundUser && state.userViews[foundUser.id] || {}),
    isInUserPostFeed,
    amIGroupAdmin,
    subscribed: authenticated && foundUser && (user.subscriptions.indexOf(foundUser.id) > -1),
    blocked: authenticated && foundUser && (user.banIds.indexOf(foundUser.id) > -1),
    hasRequestBeenSent: authenticated && foundUser && ((user.pendingSubscriptionRequests || []).indexOf(foundUser.id) > -1)
  };

  statusExtension.canISeeSubsList = statusExtension.isUserFound &&
    (foundUser.isPrivate === '0' || statusExtension.subscribed || statusExtension.isItMe);

  const canIPostToGroup = statusExtension.subscribed && (foundUser.isRestricted === '0' || amIGroupAdmin);

  statusExtension.canIPostHere = statusExtension.isUserFound &&
    ((statusExtension.isItMe && isInUserPostFeed) || (foundUser.type === 'group' && canIPostToGroup));

  const viewUser = {...(foundUser), ...statusExtension};

  const breadcrumbs = {
    shouldShowBreadcrumbs: !isInUserPostFeed,
    user: viewUser,
    breadcrumb: currentRouteName.replace('user','')
  };

  const sendTo = {...state.sendTo, defaultFeed: (foundUser ? foundUser.username : null)};

  return { user, visibleEntries, createPostForm, boxHeader, viewUser, breadcrumbs, sendTo, isInUserPostFeed };
}

function selectActions(dispatch) {
  return {
    ...postActions(dispatch),
    createPost: (...args) => dispatch(createPost(...args)),
    resetPostCreateForm: (...args) => dispatch(resetPostCreateForm(...args)),
    userActions: userActions(dispatch),
  };
}

export default connect(selectState, selectActions)(UserHandler);
