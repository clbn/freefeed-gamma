import React from 'react';
import PropTypes from 'prop-types';

import Icon from "./icon";

const UserRelationshipStatus = (props) => (
  props.isUserBlockedByMe ? (
    <span><Icon name="ban"/> You've blocked the user</span>
  ) : props.amIBlockedByUser ? (
    <span><Icon name="question-circle"/> User may have blocked you</span>
  ) : props.hasRequestBeenSent ? (
    <span><Icon name="clock"/> You've sent sub request</span>
  ) : props.amISubscribedToUser ? (
    props.type === 'user' ? (
      props.isUserSubscribedToMe ? (
        <span><Icon name="check-circle"/> Mutually subscribed</span>
      ) : (
        <span><Icon name="check-circle"/> You are subscribed</span>
      )
    ) : props.amIGroupAdmin ? (
      <span><Icon name="check-square"/> You are an admin</span>
    ) : (
      <span><Icon name="check-square"/> You are a member</span>
    )
  ) : props.isUserSubscribedToMe ? (
    <span><Icon name="check-circle-o"/> User subscribed to you</span>
  ) : (
    false
  )
);

UserRelationshipStatus.propTypes = {
  isUserBlockedByMe: PropTypes.bool.isRequired,
  amIBlockedByUser: PropTypes.bool,
  hasRequestBeenSent: PropTypes.bool.isRequired,
  amISubscribedToUser: PropTypes.bool.isRequired,
  isUserSubscribedToMe: PropTypes.bool.isRequired,
  amIGroupAdmin: PropTypes.bool.isRequired,
  type: PropTypes.oneOf(['user', 'group']).isRequired
};

export default UserRelationshipStatus;
