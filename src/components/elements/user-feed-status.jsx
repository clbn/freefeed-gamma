import React from 'react';
import PropTypes from 'prop-types';
import Icon from './icon';

const UserFeedStatus = (props) => <>
  {props.isGone ? (
    <><Icon name="archive"/> Deleted</>
  ) : props.isPrivate === '1' ? (
    <><Icon name="lock"/> Private</>
  ) : props.isProtected === '1' ? (
    <><Icon name="users"/> Protected</>
  ) : (
    <><Icon name="globe"/> Public</>
  )}
  {props.isRestricted === '1' ? ' restricted' : false}
  {props.type === 'user' ? ' feed' : ' group'}
</>;

UserFeedStatus.propTypes = {
  isGone: PropTypes.bool,
  isPrivate: PropTypes.oneOf(['0', '1']).isRequired,
  isProtected: PropTypes.oneOf(['0', '1']).isRequired,
  isRestricted: PropTypes.oneOf(['0', '1']),
  type: PropTypes.oneOf(['user', 'group']).isRequired
};

export default UserFeedStatus;
