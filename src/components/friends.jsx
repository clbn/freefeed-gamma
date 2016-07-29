import React from 'react';
import {connect} from 'react-redux';
import _ from 'lodash';

import {pluralForm} from '../utils';
import {acceptUserRequest, rejectUserRequest, revokeSentRequest} from '../redux/action-creators';
import {tileUserListFactory, PLAIN, WITH_REQUEST_HANDLES, WITH_REVOKE_SENT_REQUEST} from './tile-user-list';
import throbber100 from 'assets/images/throbber.gif';

const TileList = tileUserListFactory({type: PLAIN, displayQuantity: true});
const TileListWithAcceptAndReject = tileUserListFactory({type: WITH_REQUEST_HANDLES, displayQuantity: true});
const TileListWithRevoke = tileUserListFactory({type: WITH_REVOKE_SENT_REQUEST, displayQuantity: true});

const Friends = (props) => {
  const feedRequestsHeader = `Subscription ${pluralForm(props.feedRequests.length, 'request', null, 'w')}`;
  const sentRequestsHeader = `Sent ${pluralForm(props.sentRequests.length, 'request', null, 'w')}`;

  return (
    <div className="box">
      <div className="box-header-timeline">
        Friends
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

  const subscriptionsList = (state.user.subscriptions || [])
    .map((id) => state.users[id] || {})
    .filter((u) => u.type === 'user');

  const subscribersList = (state.user.subscribers || [])
    .map((u) => state.users[u.id] || {})
    .filter((u) => u.type === 'user');

  const mutualSubscriptionsList = _.intersectionWith(subscriptionsList, subscribersList, (a, b) => (a.id === b.id));
  const otherSubscriptionsList = _.differenceWith(subscriptionsList, mutualSubscriptionsList, (a, b) => (a.id === b.id));
  const otherSubscribersList = _.differenceWith(subscribersList, mutualSubscriptionsList, (a, b) => (a.id === b.id));

  const mutualSubscriptions = {
    header: 'Mutual subscriptions',
    users: _.sortBy(mutualSubscriptionsList, 'username')
  };

  const otherSubscriptions = {
    header: 'Subscriptions',
    users: _.sortBy(otherSubscriptionsList, 'username')
  };

  const otherSubscribers = {
    header: 'Subscribers',
    users: _.sortBy(otherSubscribersList, 'username')
  };

  const blockedByMe = {
    header: 'Blocked users',
    users: _.sortBy(state.usernameBlockedByMe.payload, 'username')
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

export default connect(mapStateToProps, mapDispatchToProps)(Friends);
