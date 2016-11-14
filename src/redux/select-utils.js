import _ from 'lodash';

import {
  // User actions
  subscribe, unsubscribe,
  sendSubscriptionRequest, revokeSentRequest,
  ban, unban,

  // Post actions
  showMoreComments, showMoreLikes,
  addAttachmentResponse, removeAttachment,
  likePost, unlikePost,
  hidePost, unhidePost,
  toggleModeratingComments,
  disableComments, enableComments,
  toggleEditingPost, cancelEditingPost, saveEditingPost,
  deletePost,

  // Comment actions
  toggleCommenting, addComment,
  toggleEditingComment, cancelEditingComment, saveEditingComment,
  startHighlightingComments, stopHighlightingComments,
  deleteComment
} from '../redux/action-creators';

const MAX_LIKES = 4;

const allFalse = _ => false;

const commentHighlighter = ({commentsHighlights, user, postViews}, commentsPostId, commentList) => {
  const {postId, author, arrows, baseCommentId} = commentsHighlights;
  const {comments} = user.frontendPreferences;
  const {omittedComments} = postViews[commentsPostId];
  if (!comments.highlightComments) {
    return allFalse;
  }

  if (commentsPostId !== postId) {
    return allFalse;
  }

  const baseIndex = commentList.indexOf(baseCommentId);
  const highlightIndex = (baseIndex + omittedComments) - arrows;
  const highlightCommentId = commentList[highlightIndex < baseIndex ? highlightIndex : -1];

  return (commentId, commentAuthor) => author === commentAuthor.username || highlightCommentId === commentId;
};

export function joinCreatePostData(state) {
  const createPostForm = state.createPostForm;
  return {...createPostForm,
    attachments: (createPostForm.attachments || []).map(attachmentId => state.attachments[attachmentId])
  };
}

export function postActions(dispatch) {
  return {
    showMoreComments: (postId) => dispatch(showMoreComments(postId)),
    showMoreLikes: (postId) => dispatch(showMoreLikes(postId)),
    toggleEditingPost: (postId) => dispatch(toggleEditingPost(postId)),
    cancelEditingPost: (postId) => dispatch(cancelEditingPost(postId)),
    saveEditingPost: (postId, newPost) => dispatch(saveEditingPost(postId, newPost)),
    deletePost: (postId) => dispatch(deletePost(postId)),
    toggleCommenting: (postId) => dispatch(toggleCommenting(postId)),
    addComment:(postId, commentText) => dispatch(addComment(postId, commentText)),
    likePost: (postId, userId) => dispatch(likePost(postId, userId)),
    unlikePost: (postId, userId) => dispatch(unlikePost(postId, userId)),
    hidePost: (postId) => dispatch(hidePost(postId)),
    unhidePost: (postId) => dispatch(unhidePost(postId)),
    toggleModeratingComments: (postId) => dispatch(toggleModeratingComments(postId)),
    disableComments: (postId) => dispatch(disableComments(postId)),
    enableComments: (postId) => dispatch(enableComments(postId)),
    addAttachmentResponse: (postId, attachments) => dispatch(addAttachmentResponse(postId, attachments)),
    removeAttachment: (postId, attachmentId) => dispatch(removeAttachment(postId, attachmentId)),
    commentEdit: {
      toggleEditingComment: (commentId) => dispatch(toggleEditingComment(commentId)),
      saveEditingComment: (commentId, newValue) => dispatch(saveEditingComment(commentId, newValue)),
      deleteComment: (commentId) => dispatch(deleteComment(commentId)),
      startHighlightingComments: (...args) => dispatch(startHighlightingComments(...args)),
      stopHighlightingComments: (...args) => dispatch(stopHighlightingComments(...args))
    },
  };
}

export function userActions(dispatch) {
  return {
    ban: (payload) => dispatch(ban(payload)),
    unban: (payload) => dispatch(unban(payload)),
    subscribe: (payload) => dispatch(subscribe(payload)),
    unsubscribe: (payload) => dispatch(unsubscribe(payload)),
    sendSubscriptionRequest: (payload) => dispatch(sendSubscriptionRequest(payload)),
    revokeSentRequest: (payload) => dispatch(revokeSentRequest(payload))
  };
}
