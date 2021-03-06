import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';

import attachments from './attachments';
import authenticated from './authenticated';
import cachedPages from './cached-pages';
import comments from './comments';
import commentViews from './comment-views';
import commentLikesViews from './comment-likes-views';
import createPostForm from './create-post-form';
import feeds from './feeds';
import feedViewState from './feed-view';
import { groupCreateForm, groupSettingsForm, groupPictureForm } from './group-forms';
import me from './me';
import pageView from './page-view';
import posts from './posts';
import postViews from './post-views';
import { groupRequests, userRequests, sentRequests } from './requests';
import signInForm from './sign-in-form';
import signUpForm from './sign-up-form';
import { userSettingsForm, userPictureForm, userPreferencesForm, passwordForm } from './user-forms';
import users from './users';
import userViews from './user-views';
import { serverError, userErrors, groupSettings, routeLoadingState, singlePostId,
  usernameSubscribers, usernameSubscriptions, usernameBlockedByMe } from './miscellanea';

export default combineReducers({
  routing: routerReducer,
  cachedPages,

  attachments,
  authenticated,
  comments,
  commentViews,
  commentLikesViews,
  createPostForm,
  feedViewState,
  groupCreateForm, groupSettingsForm, groupPictureForm,
  me,
  pageView,
  posts,
  postViews,
  groupRequests, userRequests, sentRequests,
  signInForm,
  signUpForm,
  feeds,
  userSettingsForm, userPictureForm, userPreferencesForm, passwordForm,
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
