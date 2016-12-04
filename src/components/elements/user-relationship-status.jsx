import React from 'react';

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
  isBlocked: React.PropTypes.bool.isRequired,
  hasRequestBeenSent: React.PropTypes.bool.isRequired,
  amISubscribedToUser: React.PropTypes.bool.isRequired,
  isUserSubscribedToMe: React.PropTypes.bool.isRequired,
  amIGroupAdmin: React.PropTypes.bool.isRequired,
  type: React.PropTypes.string.isRequired
};

export default UserRelationshipStatus;
