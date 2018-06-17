import React from 'react';
import PropTypes from 'prop-types';

const UserFeedStatus = (props) => (
  <span>
    {props.isPrivate === '1' ? (
      <span><svg className="icon-lock"><use xlinkHref="#icon-lock"></use></svg> Private</span>
    ) : props.isProtected === '1' ? (
      <span><svg className="icon-users"><use xlinkHref="#icon-users"></use></svg> Protected</span>
    ) : (
      <span><svg className="icon-globe"><use xlinkHref="#icon-globe"></use></svg> Public</span>
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
