import React from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';

import { getVisibleEntriesWithHidden } from '../redux/selectors';
import { userActions } from '../redux/select-utils';
import { getCurrentRouteName } from '../utils';
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
        defaultRecipient={props.defaultRecipient}/>

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
  const me = state.me;
  const authenticated = state.authenticated;
  const visibleEntries = getVisibleEntriesWithHidden(state);
  const boxHeader = state.boxHeader;
  const offset = +state.routing.locationBeforeTransitions.query.offset || 0;
  const requestedUsername = ownProps.params.userName;
  const foundUser = _.find(state.users, { username: requestedUsername });

  const amIGroupAdmin = (
    authenticated &&
    foundUser &&
    foundUser.type === 'group' &&
    ((foundUser.administrators || []).indexOf(me.id) > -1)
  );

  const currentRoute = getCurrentRouteName(ownProps);
  const isInUserPostFeed = (currentRoute === 'userFeed');

  const statusExtension = {
    authenticated,
    isLoading: state.routeLoadingState,
    requestedUsername,
    isUserFound: !!foundUser,
    isItMe: (foundUser ? foundUser.username === me.username : false),
    userView: (foundUser && state.userViews[foundUser.id] || {}),
    amIGroupAdmin,
    amISubscribedToUser: authenticated && foundUser && (me.subscriptions.indexOf(foundUser.id) > -1),
    isUserSubscribedToMe: authenticated && foundUser && (_.findIndex(me.subscribers, { id: foundUser.id }) > -1),
    isUserBlockedByMe: authenticated && foundUser && (me.banIds.indexOf(foundUser.id) > -1),
    hasRequestBeenSent: authenticated && foundUser && ((me.pendingSubscriptionRequests || []).indexOf(foundUser.id) > -1)
  };

  statusExtension.amIBlockedByUser = authenticated && statusExtension.isUserFound &&
    !statusExtension.isItMe && !statusExtension.isLoading &&
    foundUser.isPrivate === '0' && foundUser.statistics.posts !== '0' && visibleEntries.length === 0 && offset === 0;

  statusExtension.canISeeSubsList = statusExtension.isUserFound &&
    (foundUser.isPrivate === '0' || statusExtension.amISubscribedToUser || statusExtension.isItMe);

  statusExtension.showProfileControls = authenticated && statusExtension.isUserFound &&
    !statusExtension.isItMe && isInUserPostFeed && boxHeader.page < 2;

  const canIPostToGroup = statusExtension.amISubscribedToUser && (foundUser.isRestricted === '0' || amIGroupAdmin);

  statusExtension.canIPostHere = statusExtension.isUserFound && isInUserPostFeed &&
    (statusExtension.isItMe || (foundUser.type === 'group' && canIPostToGroup));

  const showSummaryHeader = (currentRoute === 'userSummary');
  const showPaginationHeader = !isInUserPostFeed || boxHeader.page > 1;

  const viewUser = { ...(foundUser), ...statusExtension };

  const defaultRecipient = (foundUser ? foundUser.username : null);

  return { visibleEntries, boxHeader, viewUser, currentRoute, isInUserPostFeed, showSummaryHeader, showPaginationHeader, defaultRecipient };
}

function mapDispatchToProps(dispatch) {
  return {
    userActions: userActions(dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(User);
