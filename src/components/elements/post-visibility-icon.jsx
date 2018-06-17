import React from 'react';

import * as PostVisibilityLevels from '../../utils/post-visibility-levels';
import { getPostVisibilityLevel } from '../../utils';

const PostVisibilityIcon = (props) => {
  const postLevel = getPostVisibilityLevel(props.recipients, props.authorId);

  switch (postLevel) {
    case PostVisibilityLevels.DIRECT: {
      return <svg className="icon-envelope"><title>This is direct message</title><use xlinkHref="#icon-envelope"></use></svg>;
    }
    case PostVisibilityLevels.PRIVATE: {
      return <svg className="icon-lock"><title>This entry is private</title><use xlinkHref="#icon-lock"></use></svg>;
    }
    case PostVisibilityLevels.PROTECTED: {
      return <svg className="icon-users"><title>This entry is only visible to FreeFeed users</title><use xlinkHref="#icon-users"></use></svg>;
    }
  }
  return <svg className="icon-globe"><title>This entry is public</title><use xlinkHref="#icon-globe"></use></svg>;
};

export default PostVisibilityIcon;
