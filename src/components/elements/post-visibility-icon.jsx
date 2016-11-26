import React from 'react';

const PostVisibilityIcon = (props) => {
  // Visibility levels
  const levels = {
    DIRECT: 3,    // Direct message: recipient is a user (not a group), but not the same user as the author
    PRIVATE: 2,   // Private post: recipient is a private user or group
    PROTECTED: 1, // Protected post: recipient is a protected user or group
    PUBLIC: 0     // Public post
  };

  // Calculate individual levels for recipients
  const recipientLevels = props.recipients.map((recipient) => {
    if (recipient.type === 'user' && recipient.id !== props.authorId) {
      return levels.DIRECT;
    }
    if (recipient.isPrivate === '1') {
      return levels.PRIVATE;
    }
    if (recipient.isProtected === '1') {
      return levels.PROTECTED;
    }
    return levels.PUBLIC;
  });

  // Calculate combined level for post
  const postLevel = Math.min(...recipientLevels);

  // Render icon
  switch (postLevel) {
    case levels.DIRECT: {
      return <i className="post-visibility-icon fa fa-envelope" title="This is direct message"></i>;
    }
    case levels.PRIVATE: {
      return <i className="post-visibility-icon fa fa-lock" title="This entry is private"></i>;
    }
    case levels.PROTECTED: {
      return <i className="post-visibility-icon protected" title="This entry is only visible to FreeFeed users">&nbsp;</i>;
    }
  }
  return false;
};

export default PostVisibilityIcon;
