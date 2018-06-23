import React from 'react';
import PropTypes from 'prop-types';

const UserRelationshipStatus = (props) => (
  props.isUserBlockedByMe ? (
    <span><i className="fa fa-ban"></i> You've blocked the user</span>
  ) : props.amIBlockedByUser ? (
    <span><i className="fa fa-question-circle"></i> User may have blocked you</span>
  ) : props.hasRequestBeenSent ? (
    <span><i className="fa fa-clock-o"></i> You've sent sub request</span>
  ) : props.amISubscribedToUser ? (
    props.type === 'user' ? (
      props.isUserSubscribedToMe ? (
        <span><i className="fa fa-check-circle"></i> Mutually subscribed</span>
      ) : (
        <span><i className="fa fa-check-circle"></i> You are subscribed</span>
      )
    ) : props.amIGroupAdmin ? (
      <span><i className="fa fa-check-square"></i> You are an admin</span>
    ) : (
      <span><i className="fa fa-check-square"></i> You are a member</span>
    )
  ) : props.isUserSubscribedToMe ? (
    <span><i className="fa fa-check-circle-o"></i> User subscribed to you</span>
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
