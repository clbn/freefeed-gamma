import React from 'react';
import PropTypes from 'prop-types';

const UserRelationshipStatus = (props) => (
  props.isUserBlockedByMe ? (
    <span><svg className="icon-ban"><use xlinkHref="#icon-ban"></use></svg> You've blocked the user</span>
  ) : props.amIBlockedByUser ? (
    <span><svg className="icon-question-circle"><use xlinkHref="#icon-question-circle"></use></svg> User may have blocked you</span>
  ) : props.hasRequestBeenSent ? (
    <span><svg className="icon-clock"><use xlinkHref="#icon-clock"></use></svg> You've sent sub request</span>
  ) : props.amISubscribedToUser ? (
    props.type === 'user' ? (
      props.isUserSubscribedToMe ? (
        <span><svg className="icon-check-circle"><use xlinkHref="#icon-check-circle"></use></svg> Mutually subscribed</span>
      ) : (
        <span><svg className="icon-check-circle"><use xlinkHref="#icon-check-circle"></use></svg> You are subscribed</span>
      )
    ) : props.amIGroupAdmin ? (
      <span><svg className="icon-check-square"><use xlinkHref="#icon-check-square"></use></svg> You are an admin</span>
    ) : (
      <span><svg className="icon-check-square"><use xlinkHref="#icon-check-square"></use></svg> You are a member</span>
    )
  ) : props.isUserSubscribedToMe ? (
    <span><svg className="icon-check-circle-o"><use xlinkHref="#icon-check-circle-o"></use></svg> User subscribed to you</span>
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
