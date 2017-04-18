import React from 'react';

import * as PostVisibilityLevels from '../../utils/post-visibility-levels';
import { getPostVisibilityLevel } from '../../utils';

const PostVisibilityIcon = (props) => {
  const postLevel = getPostVisibilityLevel(props.recipients, props.authorId);

  switch (postLevel) {
    case PostVisibilityLevels.DIRECT: {
      return <i className="post-visibility-icon fa fa-envelope" title="This is direct message"></i>;
    }
    case PostVisibilityLevels.PRIVATE: {
      return <i className="post-visibility-icon fa fa-lock" title="This entry is private"></i>;
    }
    case PostVisibilityLevels.PROTECTED: {
      return (
        <i className="post-visibility-icon icon-protected" title="This entry is only visible to FreeFeed users">
          <i className="icon-protected-bg fa fa-user"></i>
          <i className="icon-protected-shadow fa fa-user-o fa-inverse"></i>
          <i className="icon-protected-fg fa fa-user"></i>
        </i>
      );
    }
  }
  return <i className="post-visibility-icon fa fa-globe" title="This entry is public"></i>;
};

export default PostVisibilityIcon;
