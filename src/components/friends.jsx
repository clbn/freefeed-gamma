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

function calculateMutual(subscriptions, subscribers) {
  if (!subscribers.isPending && !subscriptions.isPending &&
      !subscribers.errorString && !subscriptions.errorString) {
    return _.intersectionWith(
      subscriptions.payload,
      subscribers.payload,
      (a, b) => a.id == b.id
    );
  } else {
    return [];
  }
}

function calculateNonMutual(allSubscriptions, mutualSubscriptions) {
  if (!allSubscriptions.isPending && !allSubscriptions.errorString) {
    return _.differenceWith(
      allSubscriptions.payload,
      mutualSubscriptions.users,
      (a, b) => a.id == b.id
    );
  } else {
    return [];
  }
}

const Friends = (props) => {
  const feedRequestsHeader = `Subscription ${pluralForm(props.feedRequests.length, 'request', null, 'w')}`;
  const sentRequestsHeader = `Sent ${pluralForm(props.sentRequests.length, 'request', null, 'w')}`;

  return (
    <div className="box">
      <div className="box-header-timeline">
        Friends
      </div>

      {props.isLoading ? (
        <div className="box-body">
          <img width="100" height="100" src={throbber100}/>
        </div>
      ) : (
        <div className="box-body">
          <TileListWithAcceptAndReject
            header={feedRequestsHeader}
            users={props.feedRequests}
            acceptRequest={props.acceptUserRequest}
            rejectRequest={props.rejectUserRequest}/>

          <TileList {...props.mutualSubscriptions}/>

          <TileList {...props.otherSubscriptions}/>

          <TileList {...props.blockedByMe}/>

          <TileListWithRevoke
            header={sentRequestsHeader}
            users={props.sentRequests}
            revokeSentRequest={props.revokeSentRequest}/>
        </div>
      )}
    </div>
  );
};

function mapStateToProps(state) {
  const isLoading = (state.usernameSubscriptions.isPending || state.usernameSubscribers.isPending);

  const feedRequests = state.userRequests;

  const mutualSubscriptions = {
    header: 'Mutual subscriptions',
    users: _.sortBy(calculateMutual(state.usernameSubscriptions, state.usernameSubscribers), 'username')
  };

  const otherSubscriptions = {
    header: 'Subscriptions',
    users: _.sortBy(calculateNonMutual(state.usernameSubscriptions, mutualSubscriptions), 'username')
  };

  const blockedByMe = {
    header: 'Blocked users',
    users: _.sortBy(state.usernameBlockedByMe.payload, 'username')
  };

  const sentRequests = state.sentRequests;

  return { isLoading, feedRequests, mutualSubscriptions, otherSubscriptions, blockedByMe, sentRequests };
}

function mapDispatchToProps(dispatch) {
  return {
    acceptUserRequest: (...args) => dispatch(acceptUserRequest(...args)),
    rejectUserRequest: (...args) => dispatch(rejectUserRequest(...args)),
    revokeSentRequest: (...args) => dispatch(revokeSentRequest(...args))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Friends);
