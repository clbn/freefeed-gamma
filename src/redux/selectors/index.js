import { getVisibleEntriesWithHidden, getHiddenEntriesWithHidden } from './feed';
import makeGetPost from './post';
import makeGetPostLikes from './post-likes';
import makeGetPostComments from './post-comments';
import makeGetPostComment from './post-comment';

export {
  // Feed
  getVisibleEntriesWithHidden,
  getHiddenEntriesWithHidden,

  // Post
  makeGetPost,
  makeGetPostLikes,
  makeGetPostComments,
  makeGetPostComment
};
