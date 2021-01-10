import { getVisibleEntriesWithHidden, getHiddenEntriesWithHidden } from './feed';
import makeGetPost from './post';
import makeGetPostLikes from './post-likes';
import makeGetPostComments from './post-comments';
import makeGetComment from './comment';
import makeGetClikes from './comment-likes';
import getRecentGroups from './recent-groups';

export {
  // Feed
  getVisibleEntriesWithHidden,
  getHiddenEntriesWithHidden,

  // Post
  makeGetPost,
  makeGetPostLikes,
  makeGetPostComments,
  makeGetComment,
  makeGetClikes,

  // Recent Groups
  getRecentGroups
};
