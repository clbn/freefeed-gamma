import React from 'react';
import PropTypes from 'prop-types';
import Icon from "./icon";

const UserFeedStatus = (props) => (
  <span>
    {props.isPrivate === '1' ? (
      <span><Icon name="lock"/> Private</span>
    ) : props.isProtected === '1' ? (
      <span><Icon name="users"/> Protected</span>
    ) : (
      <span><Icon name="globe"/> Public</span>
    )}
    {props.isRestricted === '1' ? ' restricted' : false}
    {props.type === 'user' ? ' feed' : ' group'}
  </span>
);

UserFeedStatus.propTypes = {
  isPrivate: PropTypes.oneOf(['0', '1']).isRequired,
  isProtected: PropTypes.oneOf(['0', '1']).isRequired,
  isRestricted: PropTypes.oneOf(['0', '1']),
  type: PropTypes.oneOf(['user', 'group']).isRequired
};

export default UserFeedStatus;
