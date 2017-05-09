import { createSelector } from 'reselect';
import _ from 'lodash';

import ARCHIVE_WATERSHED_TIMESTAMP from '../../utils/archive-timestamps';

const emptyArray = [];

const _calcArchiveRevivalPosition = (postCreatedAt, postOmittedComments, postCommentIds, stateComments) => {
  // Archive revival position is between old archive comments and the new stuff.
  let foundIndex = -1;

  // Find the first new comment in an archive post
  if (postCreatedAt < ARCHIVE_WATERSHED_TIMESTAMP) {
    const commentTimestamps = postCommentIds.map(commentId => stateComments[commentId].createdAt);
    for (let i=0; i < commentTimestamps.length; i++) {
      if (commentTimestamps[i] > ARCHIVE_WATERSHED_TIMESTAMP) {
        foundIndex = i;
        break;
      }
    }
  }

  // For collapsed comments, only show revival icon (bolt) if it's on the very
  // first comment. Otherwise, it must be hidden under "N more comments".
  if (postOmittedComments > 0 && foundIndex > 0) {
    foundIndex = -1;
  }

  return foundIndex;
};

const _getMemoizedArchiveRevivalPosition = _.memoize(
  // The function to have its output memoized
  _calcArchiveRevivalPosition,

  // The function to resolve the cache key
  (postCreatedAt, postOmittedComments, postCommentIds, stateComments) => postCommentIds // eslint-disable-line no-unused-vars

  // ^ So here we make the cache only rely on the list of comment IDs. It's
  // safe to do, since we only use it here for comment timestamps, which are
  // immutable. And it's important to keep this cache independent from
  // state.comments, because this way adding a comment to some post doesn't
  // cause re-rendering of other cached posts.
);

const getArchiveRevivalPosition = createSelector(
  [
    (state, props) => state.posts[props.postId].createdAt,
    (state, props) => state.posts[props.postId].omittedComments || 0,
    (state, props) => state.posts[props.postId].comments || emptyArray,
    (state) => state.comments || emptyArray
  ],
  (postCreatedAt, postOmittedComments, postCommentIds, stateComments) => {
    return _getMemoizedArchiveRevivalPosition(postCreatedAt, postOmittedComments, postCommentIds, stateComments);
  }
);

const makeGetPostComments = () => createSelector(
  [
    (state, props) => state.posts[props.postId].id,
    (state, props) => state.posts[props.postId].comments || emptyArray,
    (state, props) => state.posts[props.postId].omittedComments || 0,
    (state, props) => state.posts[props.postId].commentsDisabled,

    (state, props) => state.postViews[props.postId].isLoadingComments,
    (state, props) => state.postViews[props.postId].isModeratingComments,
    (state, props) => state.postViews[props.postId].isCommenting,
    (state, props) => state.postViews[props.postId].isSavingComment,
    (state, props) => state.postViews[props.postId].commentError,

    (state, props) => (state.posts[props.postId].createdBy === state.user.id),

    getArchiveRevivalPosition
  ],
  (
    id, comments, omittedComments, commentsDisabled,
    isLoadingComments, isModeratingComments, isCommenting, isSavingComment, commentError,
    isEditable,
    archiveRevivalPosition
  ) => {
    const granularPostData = {
      id,
      comments,
      omittedComments,
      commentsDisabled,

      isLoadingComments,
      isModeratingComments,
      isCommenting,
      isSavingComment,
      commentError,

      isEditable,

      archiveRevivalPosition
    };

    return {
      post: granularPostData
    };
  }
);

export default makeGetPostComments;
