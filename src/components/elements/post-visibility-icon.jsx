import React from 'react';

import * as PostVisibilityLevels from '../../utils/post-visibility-levels';
import { getPostVisibilityLevel } from '../../utils';
import Icon from './icon';

const PostVisibilityIcon = (props) => {
  if (props.isDirect) {
    return <Icon name="envelope" title="This is direct message"/>;
  }

  const postLevel = getPostVisibilityLevel(props.recipients, props.authorId);

  switch (postLevel) {
    case PostVisibilityLevels.DIRECT: {
      return <Icon name="envelope" title="This is direct message"/>;
    }
    case PostVisibilityLevels.PRIVATE: {
      return <Icon name="lock" title="This entry is private"/>;
    }
    case PostVisibilityLevels.PROTECTED: {
      return <Icon name="users" title="This entry is only visible to FreeFeed users"/>;
    }
  }
  return <Icon name="globe" title="This entry is public"/>;
};

export default PostVisibilityIcon;
