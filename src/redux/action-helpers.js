import {
  HOME, DISCUSSIONS, DIRECT, GET_SUMMARY, GET_SEARCH_RESULTS,
  GET_USER_FEED, GET_USER_SUMMARY, GET_USER_COMMENTS, GET_USER_LIKES,
  SIGN_UP, SIGN_IN, WHO_AM_I, SUBSCRIBE, UNSUBSCRIBE,
  UPDATE_USER, UPDATE_USER_PREFERENCES
} from './action-types';

export const request = (type) =>`${type}_REQUEST`;
export const response = (type) => `${type}_RESPONSE`;
export const fail = (type) => `${type}_FAIL`;

const feedGeneratingActions = [HOME, DISCUSSIONS, DIRECT, GET_SUMMARY, GET_SEARCH_RESULTS, GET_USER_FEED, GET_USER_SUMMARY, GET_USER_COMMENTS, GET_USER_LIKES];
const feedRequests = feedGeneratingActions.map(request);
const feedResponses = feedGeneratingActions.map(response);
const feedFails = feedGeneratingActions.map(fail);
export const isFeedRequest = action => feedRequests.indexOf(action.type) !== -1;
export const isFeedResponse = action => feedResponses.indexOf(action.type) !== -1;
export const isFeedFail = action => feedFails.indexOf(action.type) !== -1;

const userChangeActions = [SIGN_UP, SIGN_IN, WHO_AM_I, SUBSCRIBE, UNSUBSCRIBE, UPDATE_USER, UPDATE_USER_PREFERENCES];
const userChangeResponses = userChangeActions.map(response);
export const isUserChangeResponse = action => userChangeResponses.indexOf(action.type) !== -1;

export function requiresAuth(action) {
  return action.apiRequest && !action.nonAuthRequest;
}
