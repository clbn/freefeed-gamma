import {createSelector} from 'reselect';

const emptyArray = [];
const falseFn = () => false;

const makeCheckIfCommentHighlighted = (frontendPreferences, highlightedComments, omittedComments, currentPostId, commentList) => {
  const {postId, baseCommentId, username, arrows} = highlightedComments;

  if (currentPostId !== postId || !frontendPreferences.comments.highlightComments) {
    return falseFn;
  }

  const baseCommentIndex = commentList.indexOf(baseCommentId);
  const targetedCommentIndex = (baseCommentIndex + omittedComments) - arrows;
  const targetedCommentId = commentList[targetedCommentIndex < baseCommentIndex ? targetedCommentIndex : -1];

  return (commentId, commentAuthor) => (commentAuthor.username === username || commentId === targetedCommentId);
};

const makeGetPostComments = () => createSelector(
  [
    (state, props) => state.posts[props.postId],
    (state, props) => state.postViews[props.postId],
    (state) => state.user.id,
    (state) => state.user.frontendPreferences
  ],
  (post, postView, myId, frontendPreferences) => {
    const postCombined = {
      comments: emptyArray,
      ...post,
      ...postView,
      isEditable: (post.createdBy === myId)
    };

    const checkIfCommentHighlighted = makeCheckIfCommentHighlighted(frontendPreferences, postView.highlightedComments || {}, post.omittedComments, post.id, post.comments);

    return {
      post: postCombined,
      checkIfCommentHighlighted
    };
  }
);

export default makeGetPostComments;
