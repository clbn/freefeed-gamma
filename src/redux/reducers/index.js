import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';

import attachments from './attachments';
import authenticated from './authenticated';
import boxHeader from './box-header';
import comments from './comments';
import commentViews from './comment-views';
import commentLikesViews from './comment-likes-views';
import createPostForm from './create-post-form';
import feedViewState from './feed-view';
import { groupCreateForm, groupSettingsForm, groupPictureForm } from './group-forms';
import me from './me';
import posts from './posts';
import postViews from './post-views';
import { groupRequests, userRequests, sentRequests } from './requests';
import sendTo from './send-to';
import signInForm from './sign-in-form';
import signUpForm from './sign-up-form';
import subscribers from './subscribers';
import subscriptions from './subscriptions';
import title from './title';
import userCardView from './user-card-view';
import { userSettingsForm, userPictureForm, frontendPreferencesForm, passwordForm } from './user-forms';
import users from './users';
import userViews from './user-views';
import { serverError, userErrors, groupSettings, routeLoadingState, singlePostId,
  usernameSubscribers, usernameSubscriptions, usernameBlockedByMe } from './miscellanea';

export default combineReducers({
  routing: routerReducer,

  attachments,
  authenticated,
  boxHeader,
  comments,
  commentViews,
  commentLikesViews,
  createPostForm,
  feedViewState,
  groupCreateForm, groupSettingsForm, groupPictureForm,
  me,
  posts,
  postViews,
  groupRequests, userRequests, sentRequests,
  sendTo,
  signInForm,
  signUpForm,
  subscribers,
  subscriptions,
  title,
  userCardView,
  userSettingsForm, userPictureForm, frontendPreferencesForm, passwordForm,
  users,
  userViews,

  // Miscellanea
  serverError,
  userErrors,
  groupSettings,
  routeLoadingState,
  singlePostId,
  usernameSubscribers,
  usernameSubscriptions,
  usernameBlockedByMe
});
