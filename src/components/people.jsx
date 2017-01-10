import React from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';

import { pluralForm } from '../utils';
import { acceptUserRequest, rejectUserRequest, revokeSentRequest } from '../redux/action-creators';
import { tileUserListFactory, PLAIN, WITH_REQUEST_HANDLES, WITH_REVOKE_SENT_REQUEST } from './elements/tile-user-list';

const TileList = tileUserListFactory({ type: PLAIN, displayQuantity: true });
const TileListWithAcceptAndReject = tileUserListFactory({ type: WITH_REQUEST_HANDLES, displayQuantity: true });
const TileListWithRevoke = tileUserListFactory({ type: WITH_REVOKE_SENT_REQUEST, displayQuantity: true });

const People = (props) => {
  const feedRequestsHeader = `Subscription ${pluralForm(props.feedRequests.length, 'request', null, 'w')}`;
  const sentRequestsHeader = `Sent ${pluralForm(props.sentRequests.length, 'request', null, 'w')}`;

  return (
    <div className="box">
      <div className="box-header-timeline">
        People
      </div>
      <div className="box-body">
        <TileListWithAcceptAndReject
          header={feedRequestsHeader}
          users={props.feedRequests}
          acceptRequest={props.acceptUserRequest}
          rejectRequest={props.rejectUserRequest}/>

        <TileListWithRevoke
          header={sentRequestsHeader}
          users={props.sentRequests}
          revokeSentRequest={props.revokeSentRequest}/>

        <TileList {...props.mutualSubscriptions}/>

        <TileList {...props.otherSubscriptions}/>

        <TileList {...props.otherSubscribers}/>

        <TileList {...props.blockedByMe}/>
      </div>
    </div>
  );
};

function mapStateToProps(state) {
  const feedRequests = state.userRequests;

  const sentRequests = state.sentRequests;

  // Subscriptions are the list of IDs, not users.
  // Subscriptions are in chronological order, so we need to reverse them.
  const subscriptionsList = (state.user.subscriptions || [])
    .map((id) => state.users[id] || {})
    .filter((u) => u.type === 'user')
    .reverse();

  // Subscribers are the list of users, not IDs.
  // Subscribers are in reverse chronological order, so we don't need to sort them.
  const subscribersList = (state.user.subscribers || [])
    .map((u) => state.users[u.id] || {})
    .filter((u) => u.type === 'user');

  const mutualSubscriptionsList = _.intersectionWith(subscribersList, subscriptionsList, (a, b) => (a.id === b.id));
  const otherSubscriptionsList = _.differenceWith(subscriptionsList, mutualSubscriptionsList, (a, b) => (a.id === b.id));
  const otherSubscribersList = _.differenceWith(subscribersList, mutualSubscriptionsList, (a, b) => (a.id === b.id));

  const mutualSubscriptions = {
    header: 'Mutual subscriptions',
    sorting: [
      { key: null, label: 'date they subscribed (most recent first)' },
      { key: 'username', label: 'username' },
      { key: 'screenName', label: 'display name' }
    ],
    users: mutualSubscriptionsList
  };

  const otherSubscriptions = {
    header: 'Subscriptions',
    sorting: [
      { key: null, label: 'date you subscribed (most recent first)' },
      { key: 'username', label: 'username' },
      { key: 'screenName', label: 'display name' }
    ],
    users: otherSubscriptionsList
  };

  const otherSubscribers = {
    header: 'Subscribers',
    sorting: [
      { key: null, label: 'date they subscribed (most recent first)' },
      { key: 'username', label: 'username' },
      { key: 'screenName', label: 'display name' }
    ],
    users: otherSubscribersList
  };

  // Blocked users are in reverse chronological order, so we don't need to sort them.
  const blockedByMe = {
    header: 'Blocked users',
    users: state.usernameBlockedByMe.payload
  };

  return { feedRequests, sentRequests, mutualSubscriptions, otherSubscriptions, otherSubscribers, blockedByMe };
}

function mapDispatchToProps(dispatch) {
  return {
    acceptUserRequest: (...args) => dispatch(acceptUserRequest(...args)),
    rejectUserRequest: (...args) => dispatch(rejectUserRequest(...args)),
    revokeSentRequest: (...args) => dispatch(revokeSentRequest(...args))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(People);
