import * as ActionTypes from '../action-types';
import * as ActionHelpers from '../action-helpers';
import { frontendPreferences as frontendPrefsConfig } from '../../../config/app';

const { request, response, fail } = ActionHelpers;

export function userSettingsForm(state={}, action) {
  switch (action.type) {
    case request(ActionTypes.UPDATE_USER): {
      return { ...state, status: 'loading' };
    }
    case response(ActionTypes.UPDATE_USER): {
      return { ...state, status: 'success' };
    }
    case fail(ActionTypes.UPDATE_USER): {
      return { ...state, status: 'error', errorMessage: (action.payload || {}).err };
    }
    case ActionTypes.RESET_USER_SETTINGS_FORM: {
      return {};
    }
  }
  return state;
}

export function userPictureForm(state={}, action) {
  switch (action.type) {
    case request(ActionTypes.UPDATE_USER_PICTURE): {
      return { ...state, status: 'loading' };
    }
    case response(ActionTypes.UPDATE_USER_PICTURE): {
      return { ...state, status: 'success' };
    }
    case fail(ActionTypes.UPDATE_USER_PICTURE): {
      return { ...state, status: 'error', errorMessage: (action.payload || {}).err };
    }
    case ActionTypes.RESET_USER_SETTINGS_FORM: {
      return {};
    }
  }
  return state;
}

export function frontendPreferencesForm(state={}, action) {
  switch (action.type) {
    case response(ActionTypes.WHO_AM_I): {
      return { ...state, ...action.payload.users.frontendPreferences[frontendPrefsConfig.clientId] };
    }
    case request(ActionTypes.UPDATE_FRONTEND_PREFERENCES): {
      return { ...state, status: 'loading' };
    }
    case response(ActionTypes.UPDATE_FRONTEND_PREFERENCES): {
      return { ...state, status: 'success' };
    }
    case fail(ActionTypes.UPDATE_FRONTEND_PREFERENCES): {
      return { ...state, status: 'error', errorMessage: (action.payload || {}).err };
    }
    case ActionTypes.RESET_USER_SETTINGS_FORM: {
      return {};
    }
  }
  return state;
}

export function passwordForm(state={}, action) {
  switch (action.type) {
    case request(ActionTypes.UPDATE_PASSWORD): {
      return { ...state, status: 'loading' };
    }
    case response(ActionTypes.UPDATE_PASSWORD): {
      return { ...state, status: 'success' };
    }
    case fail(ActionTypes.UPDATE_PASSWORD): {
      return { ...state, status: 'error', errorMessage: (action.payload || {}).err };
    }
    case ActionTypes.RESET_USER_SETTINGS_FORM: {
      return {};
    }
  }
  return state;
}
