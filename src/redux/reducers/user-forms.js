import * as ActionTypes from '../action-types';
import * as ActionHelpers from '../action-helpers';
import {frontendPreferences as frontendPrefsConfig} from '../../config';

const {request, response, fail} = ActionHelpers;

const DEFAULT_PASSWORD_FORM_STATE = {
  isSaving: false,
  success: false,
  error: false,
  errorText: ''
};

export function userSettingsForm(state={saved: false}, action) {
  switch (action.type) {
    case ActionTypes.USER_SETTINGS_CHANGE: {
      return {...state, ...action.payload, success: false, error: false};
    }
    case request(ActionTypes.UPDATE_USER): {
      return {...state, isSaving: true, error: false};
    }
    case response(ActionTypes.UPDATE_USER): {
      return {...state, isSaving: false, success: true, error: false};
    }
    case fail(ActionTypes.UPDATE_USER): {
      return {...state, isSaving: false, success: false, error: true};
    }
  }
  return state;
}

export function userPictureForm(state={}, action) {
  switch (action.type) {
    case request(ActionTypes.UPDATE_USER_PICTURE): {
      return {...state, status: 'loading'};
    }
    case response(ActionTypes.UPDATE_USER_PICTURE): {
      return {...state, status: 'success'};
    }
    case fail(ActionTypes.UPDATE_USER_PICTURE): {
      return {...state, status: 'error', errorMessage: (action.payload || {}).err};
    }
  }
  return state;
}

export function frontendPreferencesForm(state={}, action) {
  switch (action.type) {
    case response(ActionTypes.WHO_AM_I): {
      return {...state, ...action.payload.users.frontendPreferences[frontendPrefsConfig.clientId]};
    }
    case request(ActionTypes.UPDATE_FRONTEND_PREFERENCES): {
      return {...state, status: 'loading'};
    }
    case response(ActionTypes.UPDATE_FRONTEND_PREFERENCES): {
      return {...state, status: 'success'};
    }
    case fail(ActionTypes.UPDATE_FRONTEND_PREFERENCES): {
      return {...state, status: 'error', errorMessage: (action.payload || {}).err};
    }
  }
  return state;
}

export function passwordForm(state = DEFAULT_PASSWORD_FORM_STATE, action) {
  switch (action.type) {
    case request(ActionTypes.UPDATE_PASSWORD): {
      return {...state, isSaving: true, error: false, success: false};
    }
    case response(ActionTypes.UPDATE_PASSWORD): {
      return {...state, isSaving: false, success: true, error: false};
    }
    case fail(ActionTypes.UPDATE_PASSWORD): {
      return {...state, isSaving: false, success: false, error: true, errorText: action.payload.err};
    }
  }
  return state;
}
