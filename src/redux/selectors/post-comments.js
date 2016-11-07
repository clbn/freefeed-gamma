import {createSelector} from 'reselect';

const emptyArray = [];
const falseFn = () => false;

const makeIsCommentHighlighted = (frontendPreferences, highlightedComments, omittedComments, currentPostId, commentList) => {
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
    (state, props) => state.posts[props.postId].comments || emptyArray,
    (state) => state.comments,
    (state) => state.commentViews,
    (state) => state.users,
    (state) => state.user.id,
    (state) => state.user.frontendPreferences
  ],
  (post, postView, commentIds, stateComments, stateCommentViews, stateUsers, myId, frontendPreferences) => {
    const postCombined = {
      ...post,
      ...postView,
      isEditable: (post.createdBy === myId)
    };

    const isCommentHighlighted = makeIsCommentHighlighted(frontendPreferences, postView.highlightedComments || {}, post.omittedComments, post.id, post.comments);

    const comments = commentIds.map(commentId => {
      const comment = stateComments[commentId];
      const commentView = stateCommentViews[commentId];
      const placeholderUser = {id: comment.createdBy};
      const author = stateUsers[comment.createdBy] || placeholderUser;
      if (author === placeholderUser) {
        console.log('We\'ve got comment with unknown author with id', placeholderUser.id);
      }
      const isEditable = (comment.createdBy === myId);
      const isDeletable = post.createdBy === myId;
      const isHighlighted = isCommentHighlighted(commentId, author);

      return {...comment, ...commentView, user: author, isEditable, isDeletable, isHighlighted};
    });

    return {
      post: postCombined,
      comments
    };
  }
);

export default makeGetPostComments;
