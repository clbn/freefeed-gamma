import * as ActionTypes from './action-types';

export function serverError(error) {
  return {
    type: ActionTypes.SERVER_ERROR,
    error
  };
}

export function unauthenticated(payload) {
  return {
    type: ActionTypes.UNAUTHENTICATED,
    payload: { ...payload, authToken: '' },
  };
}

export function staticPage(title) {
  return {
    type: ActionTypes.STATIC_PAGE,
    payload: { title }
  };
}

import * as Api from '../services/api';

export function whoAmI() {
  return {
    type: ActionTypes.WHO_AM_I,
    apiRequest: Api.getWhoAmI,
  };
}

export function home(offset = 0) {
  return {
    type: ActionTypes.HOME,
    apiRequest: Api.getHome,
    payload: { offset },
  };
}

export function discussions(offset = 0) {
  return {
    type: ActionTypes.DISCUSSIONS,
    apiRequest: Api.getDiscussions,
    payload: { offset },
  };
}

export function direct(offset = 0) {
  return {
    type: ActionTypes.DIRECT,
    apiRequest: Api.getDirect,
    payload: { offset },
  };
}

export function getUserFeed(username, offset = 0) {
  return {
    type: ActionTypes.GET_USER_FEED,
    apiRequest: Api.getUserFeed,
    nonAuthRequest: true,
    payload: { username, offset },
  };
}

export function showMoreComments(postId) {
  return {
    type: ActionTypes.SHOW_MORE_COMMENTS,
    apiRequest: Api.getPost,
    nonAuthRequest: true,
    payload: { postId, maxComments: 'all' },
  };
}

export function showMoreLikes(postId) {
  return {
    type: ActionTypes.SHOW_MORE_LIKES,
    payload: { postId },
  };
}

export function showMoreLikesAsync(postId) {
  return {
    type: ActionTypes.SHOW_MORE_LIKES_ASYNC,
    apiRequest: Api.getLikesOnly,
    nonAuthRequest: true,
    payload: { postId },
  };
}

export function showMoreLikesSync(postId) {
  return {
    type: ActionTypes.SHOW_MORE_LIKES_SYNC,
    payload: { postId },
  };
}

export function toggleEditingPost(postId) {
  return {
    type: ActionTypes.TOGGLE_EDITING_POST,
    payload: { postId }
  };
}

export function cancelEditingPost(postId) {
  return {
    type: ActionTypes.CANCEL_EDITING_POST,
    payload: { postId }
  };
}

export function saveEditingPost(postId, newPost) {
  return {
    type: ActionTypes.SAVE_EDITING_POST,
    apiRequest: Api.updatePost,
    payload: { postId, newPost },
  };
}

export function deletePost(postId) {
  return {
    type: ActionTypes.DELETE_POST,
    apiRequest: Api.deletePost,
    payload: { postId },
  };
}

export function toggleCommenting(postId) {
  return {
    type: ActionTypes.TOGGLE_COMMENTING,
    postId,
  };
}

export function addComment(postId, commentText) {
  return {
    type: ActionTypes.ADD_COMMENT,
    apiRequest: Api.addComment,
    payload: {
      postId,
      commentText,
    }
  };
}

export function likePost(postId, userId) {
  return {
    type: ActionTypes.LIKE_POST,
    apiRequest: Api.likePost,
    payload: {
      postId,
      userId
    }
  };
}

export function unlikePost(postId, userId) {
  return {
    type: ActionTypes.UNLIKE_POST,
    apiRequest: Api.unlikePost,
    payload: {
      postId,
      userId
    }
  };
}

export function hidePost(postId) {
  return {
    type: ActionTypes.HIDE_POST,
    apiRequest: Api.hidePost,
    payload: {
      postId
    }
  };
}

export function unhidePost(postId) {
  return {
    type: ActionTypes.UNHIDE_POST,
    apiRequest: Api.unhidePost,
    payload: {
      postId
    }
  };
}

export function toggleModeratingComments(postId) {
  return {
    type: ActionTypes.TOGGLE_MODERATING_COMMENTS,
    postId
  };
}

export function disableComments(postId) {
  return {
    type: ActionTypes.DISABLE_COMMENTS,
    apiRequest: Api.disableComments,
    payload: {
      postId
    }
  };
}

export function enableComments(postId) {
  return {
    type: ActionTypes.ENABLE_COMMENTS,
    apiRequest: Api.enableComments,
    payload: {
      postId
    }
  };
}

export function toggleEditingComment(commentId) {
  return {
    type: ActionTypes.TOGGLE_EDITING_COMMENT,
    commentId,
  };
}

export function saveEditingComment(commentId, newCommentBody) {
  return {
    type: ActionTypes.SAVE_EDITING_COMMENT,
    apiRequest: Api.updateComment,
    payload: { commentId, newCommentBody }
  };
}

export function deleteComment(commentId) {
  return {
    type: ActionTypes.DELETE_COMMENT,
    apiRequest: Api.deleteComment,
    payload: { commentId },
  };
}

export function createPost(feeds, postText, attachmentIds, more) {
  return {
    type: ActionTypes.CREATE_POST,
    apiRequest: Api.createPost,
    payload: { feeds, postText, attachmentIds, more },
  };
}

export function createBookmarkletPost(feeds, postText, imageUrls, commentText) {
  return {
    type: ActionTypes.CREATE_POST,
    apiRequest: Api.createBookmarkletPost,
    payload: { feeds, postText, imageUrls, commentText }
  };
}

export function addAttachmentResponse(postId, attachments) {
  return {
    type: ActionTypes.ADD_ATTACHMENT_RESPONSE,
    payload: { postId, attachments }
  };
}

export function removeAttachment(postId, attachmentId) {
  return {
    type: ActionTypes.REMOVE_ATTACHMENT,
    payload: { postId, attachmentId }
  };
}

export function signIn(username, password) {
  return {
    type: ActionTypes.SIGN_IN,
    apiRequest: Api.signIn,
    nonAuthRequest: true,
    payload: {
      username,
      password,
    },
  };
}

export function signUp(signUpData) {
  return {
    type: ActionTypes.SIGN_UP,
    apiRequest: Api.signUp,
    nonAuthRequest: true,
    payload: { ...signUpData },
  };
}

export function updateUser(id, screenName, email, description, isPrivate, isProtected) {
  return {
    type: ActionTypes.UPDATE_USER,
    apiRequest: Api.updateUser,
    payload: { id, screenName, email, description, isPrivate, isProtected },
  };
}

export function updateFrontendPreferences(userId, prefs) {
  return {
    type: ActionTypes.UPDATE_FRONTEND_PREFERENCES,
    apiRequest: Api.updateFrontendPreferences,
    payload: { userId, prefs }
  };
}

export function updatePassword(payload) {
  return {
    type: ActionTypes.UPDATE_PASSWORD,
    apiRequest: Api.updatePassword,
    payload,
  };
}

export function updateUserPicture(picture) {
  return {
    type: ActionTypes.UPDATE_USER_PICTURE,
    apiRequest: Api.updateUserPicture,
    payload: { picture },
  };
}

export function getSinglePost(postId) {
  return {
    type: ActionTypes.GET_SINGLE_POST,
    apiRequest: Api.getPost,
    nonAuthRequest: true,
    payload: { postId, maxComments: 'all' },
  };
}

const userChangeAction = (type, apiRequest) => (payload) => {
  return {
    type,
    apiRequest,
    payload,
  };
};

export const ban = userChangeAction(ActionTypes.BAN, Api.ban);
export const unban = userChangeAction(ActionTypes.UNBAN, Api.unban);
export const subscribe = userChangeAction(ActionTypes.SUBSCRIBE, Api.subscribe);
export const unsubscribe = userChangeAction(ActionTypes.UNSUBSCRIBE, Api.unsubscribe);
export const sendSubscriptionRequest = userChangeAction(ActionTypes.SEND_SUBSCRIPTION_REQUEST, Api.sendSubscriptionRequest);

export function getUserComments(username, offset = 0) {
  return {
    type: ActionTypes.GET_USER_COMMENTS,
    apiRequest: Api.getUserComments,
    nonAuthRequest: true,
    payload: { username, offset },
  };
}

export function getUserLikes(username, offset = 0) {
  return {
    type: ActionTypes.GET_USER_LIKES,
    apiRequest: Api.getUserLikes,
    nonAuthRequest: true,
    payload: { username, offset },
  };
}

export function toggleHiddenPosts() {
  return {
    type: ActionTypes.TOGGLE_HIDDEN_POSTS
  };
}

export function getUserSubscribers(username) {
  return {
    type: ActionTypes.GET_USER_SUBSCRIBERS,
    apiRequest: Api.getUserSubscribers,
    nonAuthRequest: true,
    payload: { username },
  };
}

export function getUserSubscriptions(username) {
  return {
    type: ActionTypes.GET_USER_SUBSCRIPTIONS,
    apiRequest: Api.getUserSubscriptions,
    nonAuthRequest: true,
    payload: { username },
  };
}

export function getUserInfo(username) {
  return {
    type: ActionTypes.GET_USER_INFO,
    apiRequest: Api.getUserInfo,
    nonAuthRequest: true,
    payload: { username },
  };
}

export function createGroup(groupSettings) {
  return {
    type: ActionTypes.CREATE_GROUP,
    payload: groupSettings,
    apiRequest: Api.createGroup
  };
}

export function updateGroup(id, groupSettings) {
  return {
    type: ActionTypes.UPDATE_GROUP,
    payload: { id, groupSettings },
    apiRequest: Api.updateGroup
  };
}

export function updateGroupPicture(groupName, file) {
  return {
    type: ActionTypes.UPDATE_GROUP_PICTURE,
    payload: { groupName, file },
    apiRequest: Api.updateGroupPicture
  };
}

export function acceptGroupRequest(groupName, userName) {
  return {
    type: ActionTypes.ACCEPT_GROUP_REQUEST,
    payload: { groupName, userName },
    apiRequest: Api.acceptGroupRequest
  };
}

export function rejectGroupRequest(groupName, userName) {
  return {
    type: ActionTypes.REJECT_GROUP_REQUEST,
    payload: { groupName, userName },
    apiRequest: Api.rejectGroupRequest
  };
}

export function acceptUserRequest(userName) {
  return {
    type: ActionTypes.ACCEPT_USER_REQUEST,
    payload: { userName },
    apiRequest: Api.acceptUserRequest
  };
}

export function rejectUserRequest(userName) {
  return {
    type: ActionTypes.REJECT_USER_REQUEST,
    payload: { userName },
    apiRequest: Api.rejectUserRequest
  };
}

export function resetPostCreateForm() {
  return {
    type: ActionTypes.RESET_POST_CREATE_FORM
  };
}

export function resetGroupCreateForm() {
  return {
    type: ActionTypes.RESET_GROUP_CREATE_FORM
  };
}

export function resetGroupUpdateForm() {
  return {
    type: ActionTypes.RESET_GROUP_UPDATE_FORM
  };
}

export function resetUserSettingsForm() {
  return {
    type: ActionTypes.RESET_USER_SETTINGS_FORM
  };
}

export function unsubscribeFromGroup(groupName, userName) {
  return {
    type: ActionTypes.UNSUBSCRIBE_FROM_GROUP,
    payload: { groupName, userName },
    apiRequest: Api.unsubscribeFromGroup
  };
}

export function promoteGroupAdmin(groupName, user) {
  return {
    type: ActionTypes.PROMOTE_GROUP_ADMIN,
    payload: { groupName, user },
    apiRequest: Api.promoteGroupAdmin
  };
}

export function demoteGroupAdmin(groupName, user, isItMe) {
  return {
    type: ActionTypes.DEMOTE_GROUP_ADMIN,
    payload: { groupName, user, isItMe },
    apiRequest: Api.demoteGroupAdmin
  };
}

export function revokeSentRequest(payload) {
  return {
    type: ActionTypes.REVOKE_USER_REQUEST,
    payload,
    apiRequest: Api.revokeSentRequest
  };
}

export function startHighlightingComments(payload) {
  return {
    type: ActionTypes.START_HIGHLIGHTING_COMMENTS,
    payload
  };
}

export function stopHighlightingComments(payload) {
  return {
    type: ActionTypes.STOP_HIGHLIGHTING_COMMENTS,
    payload
  };
}

export function blockedByMe() {
  return {
    type: ActionTypes.BLOCKED_BY_ME,
    apiRequest: Api.getBlockedByMe
  };
}

export function updateUserCard(payload) {
  return {
    type: ActionTypes.UPDATE_USER_CARD,
    payload
  };
}

export function getSearchResults(query, offset) {
  return {
    type: ActionTypes.GET_SEARCH_RESULTS,
    apiRequest: Api.getSearchResults,
    nonAuthRequest: true,
    payload: { query, offset }
  };
}

export function getUnreadDirects() {
  return {
    type: ActionTypes.GET_UNREAD_DIRECTS,
    apiRequest: Api.getUnreadDirects
  };
}

export function markDirectsAsRead() {
  return {
    type: ActionTypes.MARK_DIRECTS_AS_READ,
    apiRequest: Api.markDirectsAsRead
  };
}
