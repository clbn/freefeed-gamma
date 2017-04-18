import React from 'react';

const UserFeedStatus = (props) => (
  <span>
    {props.isPrivate === '1' ? (
      <span><i className="fa fa-lock"></i> Private</span>
    ) : props.isProtected === '1' ? (
      <span><i className="icon-protected">
        <i className="icon-protected-bg fa fa-user"></i>
        <i className="icon-protected-shadow fa fa-user-o fa-inverse"></i>
        <i className="icon-protected-fg fa fa-user"></i>
      </i> Protected</span>
    ) : (
      <span><i className="fa fa-globe"></i> Public</span>
    )}
    {props.isRestricted === '1' ? ' restricted' : false}
    {props.type === 'user' ? ' feed' : ' group'}
  </span>
);

UserFeedStatus.propTypes = {
  isPrivate: React.PropTypes.string.isRequired,
  isProtected: React.PropTypes.string.isRequired,
  isRestricted: React.PropTypes.string,
  type: React.PropTypes.string.isRequired
};

export default UserFeedStatus;
