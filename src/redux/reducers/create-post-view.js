import * as ActionTypes from '../action-types';
import * as ActionHelpers from '../action-helpers';

const {request, response, fail} = ActionHelpers;

const CREATE_POST_ERROR = 'Something went wrong while creating the post...';

export default function createPostViewState(state = {}, action) {
  switch (action.type) {
    case response(ActionTypes.CREATE_POST): {
      return {
        isError: false,
        errorString: '',
        isPending: false
      };
    }
    case request(ActionTypes.CREATE_POST): {
      return {
        isError: false,
        errorString: '',
        isPending: true
      };
    }
    case fail(ActionTypes.CREATE_POST): {
      return {
        isError: true,
        errorString: CREATE_POST_ERROR,
        isPending: false
      };
    }
    case ActionTypes.RESET_POST_CREATE_FORM: {
      return {};
    }
  }
  return state;
}
