import { applyMiddleware, compose, createStore } from 'redux';

import * as middlewares from './middlewares';
import reducer from './reducers';

// Order matters: we need to check for authentication before API calls
const middlewareChain = [
  middlewares.authMiddleware,
  middlewares.apiMiddleware,
  middlewares.highlightedCommentsMiddleware,
  middlewares.likesLogicMiddleware,
  middlewares.userPhotoLogicMiddleware,
  middlewares.groupPictureLogicMiddleware,
  middlewares.redirectionMiddleware,
  middlewares.directsMiddleware,
  middlewares.draftsMiddleware,
  middlewares.realtimeMiddleware
];

let enhancers = [applyMiddleware(...middlewareChain)];

// Tell webpack to include devtool enhancer in dev mode
const isDevelopment = process.env.NODE_ENV !== 'production';
if (isDevelopment && window.__REDUX_DEVTOOLS_EXTENSION__) {
  enhancers.push(window.__REDUX_DEVTOOLS_EXTENSION__());
}

const storeEnhancer = compose(...enhancers);
const createStoreWithMiddleware = storeEnhancer(createStore);

export default function configureStore(initialState) {
  return createStoreWithMiddleware(reducer, initialState);
}
