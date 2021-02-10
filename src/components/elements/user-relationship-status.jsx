import React from 'react';
import PropTypes from 'prop-types';

import Icon from './icon';

const UserRelationshipStatus = (props) => (
  props.isUserBlockedByMe ? (
    <><Icon name="ban"/> You've blocked the user</>
  ) : props.amIBlockedByUser ? (
    <><Icon name="question-circle"/> User may have blocked you</>
  ) : props.hasRequestBeenSent ? (
    <><Icon name="clock"/> You've sent sub request</>
  ) : props.amISubscribedToUser ? (
    props.type === 'user' ? (
      props.isUserSubscribedToMe ? (
        <><Icon name="check-circle"/> Mutually subscribed</>
      ) : (
        <><Icon name="check-circle"/> You are subscribed</>
      )
    ) : props.amIGroupAdmin ? (
      <><Icon name="check-square"/> You are an admin</>
    ) : (
      <><Icon name="check-square"/> You are a member</>
    )
  ) : props.isUserSubscribedToMe ? (
    <><Icon name="check-circle-o"/> User subscribed to you</>
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
