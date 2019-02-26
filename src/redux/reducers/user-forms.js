import * as ActionTypes from '../action-types';
import * as ActionHelpers from '../action-helpers';

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

export function userPreferencesForm(state = {}, action) {
  switch (action.type) {
    case request(ActionTypes.UPDATE_USER_PREFERENCES): {
      return { ...state, status: 'loading' };
    }
    case response(ActionTypes.UPDATE_USER_PREFERENCES): {
      return { ...state, status: 'success' };
    }
    case fail(ActionTypes.UPDATE_USER_PREFERENCES): {
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
