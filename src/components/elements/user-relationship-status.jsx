import React from 'react';
import PropTypes from 'prop-types';

const UserRelationshipStatus = (props) => (
  <span>
    {props.isBlocked ? (
      <span><i className="fa fa-ban"></i> You've blocked the user</span>
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
    )}
  </span>
);

UserRelationshipStatus.propTypes = {
  isBlocked: PropTypes.bool.isRequired,
  hasRequestBeenSent: PropTypes.bool.isRequired,
  amISubscribedToUser: PropTypes.bool.isRequired,
  isUserSubscribedToMe: PropTypes.bool.isRequired,
  amIGroupAdmin: PropTypes.bool.isRequired,
  type: PropTypes.string.isRequired
};

export default UserRelationshipStatus;
