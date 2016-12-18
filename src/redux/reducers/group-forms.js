import * as ActionTypes from '../action-types';
import * as ActionHelpers from '../action-helpers';

const { request, response, fail } = ActionHelpers;

export function groupCreateForm(state = {}, action) {
  switch (action.type) {
    case request(ActionTypes.CREATE_GROUP): {
      return { ...state, status: 'loading' };
    }
    case response(ActionTypes.CREATE_GROUP): {
      const groupUrl = '/' + action.payload.groups.username;
      return { ...state, status: 'success', groupUrl };
    }
    case fail(ActionTypes.CREATE_GROUP): {
      return { ...state, status: 'error', errorMessage: (action.payload || {}).err };
    }
    case ActionTypes.RESET_GROUP_CREATE_FORM: {
      return {};
    }
  }
  return state;
}

export function groupSettingsForm(state = {}, action) {
  switch (action.type) {
    case request(ActionTypes.UPDATE_GROUP): {
      return { ...state, status: 'loading' };
    }
    case response(ActionTypes.UPDATE_GROUP): {
      return { ...state, status: 'success' };
    }
    case fail(ActionTypes.UPDATE_GROUP): {
      return { ...state, status: 'error', errorMessage: (action.payload || {}).err };
    }
    case ActionTypes.RESET_GROUP_UPDATE_FORM: {
      return {};
    }
  }
  return state;
}

export function groupPictureForm(state = {}, action) {
  switch (action.type) {
    case request(ActionTypes.UPDATE_GROUP_PICTURE): {
      return { ...state, status: 'loading' };
    }
    case response(ActionTypes.UPDATE_GROUP_PICTURE): {
      return { ...state, status: 'success' };
    }
    case fail(ActionTypes.UPDATE_GROUP_PICTURE): {
      return { ...state, status: 'error', errorMessage: (action.payload || {}).err };
    }
    case ActionTypes.RESET_GROUP_UPDATE_FORM: {
      return {};
    }
  }
  return state;
}
