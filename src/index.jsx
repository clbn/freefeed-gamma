import 'styles/app.scss';

import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, IndexRoute, browserHistory } from 'react-router';
import { Provider } from 'react-redux';
import { syncHistoryWithStore } from 'react-router-redux';
import Autotrack from 'autotrack'; // eslint-disable-line no-unused-vars

import configureStore from './redux/configure-store';
import * as ActionCreators from './redux/action-creators';
import { toggleSidebar } from './utils';

import App from './components/app';
import Home from './components/home';
import Discussions from './components/discussions';
import Summary from './components/summary';
import Search from './components/search';
import About from './components/about';
import Terms from './components/terms';
import Donate from './components/donate';
import Dev from './components/dev';
import Signin from './components/signin';
import Signup from './components/signup';
import Settings from './components/settings';
import SinglePost from './components/single-post';
import User from './components/user';
import GroupSettings from './components/group-settings';
import GroupCreate from './components/group-create';
import Groups from './components/groups';
import People from './components/people';
import Bookmarklet from './components/bookmarklet';

const store = configureStore();

//request main info for user
if (store.getState().authenticated) {
  store.dispatch(ActionCreators.whoAmI());
} else {
  // just commented for develop sign up form
  store.dispatch(ActionCreators.unauthenticated());
}

import { bindRouteActions } from './redux/route-actions';

const boundRouteActions = bindRouteActions(store.dispatch);

// Set initial History state. Otherwise, there are problems with
// third-party components using History API (specifically, PhotoSwipe).
browserHistory.replace(location);

const history = syncHistoryWithStore(browserHistory, store);

const redirectFriendsToPeople = (nextState, replaceState) => {
  replaceState(null, '/people');
};

const enterStaticPage = (title) => () => {
  store.dispatch(ActionCreators.staticPage(title));
};

const getRouteHooks = (route) => ({
  onEnter: boundRouteActions(route),
  onChange: (prev, next) => boundRouteActions(route)(next)
});

// Only scroll to the top if it's not POP (i.e. likely cached) and there's no #hash in URL (i.e. comment anchor)
history.listen((location) => location.action === 'POP' || window.location.hash || scrollTo(0, 0));

history.listen(() => toggleSidebar(false));
history.listen(() => store.dispatch(ActionCreators.updateUserCard({ isHovered: false, isOpen: false })));

ReactDOM.render(
  <Provider store={store}>
    <Router history={history}>
      <Route name="bookmarklet" path="/bookmarklet" component={Bookmarklet}/>

      <Route path="/" component={App}>
        <IndexRoute name="home" component={Home} {...getRouteHooks('home')}/>

        <Route path="about">
          <IndexRoute name="about" component={About} onEnter={enterStaticPage('About')}/>
          <Route path="terms" component={Terms} onEnter={enterStaticPage('Terms')}/>
          <Route path="donate" component={Donate} onEnter={enterStaticPage('Donate')}/>
        </Route>

        <Route path="dev" component={Dev} onEnter={enterStaticPage('Developers')}/>
        <Route path="signin" component={Signin} onEnter={enterStaticPage('Sign in')}/>
        <Route path="signup" component={Signup} onEnter={enterStaticPage('Sign up')}/>

        <Route path="settings" component={Settings} onEnter={enterStaticPage('Settings')}/>
        <Route name="people" path="/people" component={People} {...getRouteHooks('people')}/>
        <Route name="friends" path="/friends" onEnter={redirectFriendsToPeople}/>
        <Route name="groups" path="/groups" component={Groups} onEnter={enterStaticPage('Groups')}/>
        <Route name="groupCreate" path="/groups/create" component={GroupCreate} onEnter={enterStaticPage('Create a group')}/>

        <Route name="direct" path="filter/direct" component={Discussions} {...getRouteHooks('direct')}/>
        <Route name="discussions" path="filter/discussions" component={Discussions} {...getRouteHooks('discussions')}/>
        <Route name="saves" path="filter/saves" component={Discussions} {...getRouteHooks('saves')}/>
        <Route name="summary" path="/summary(/:days)" component={Summary} {...getRouteHooks('summary')}/>
        <Route name="search" path="/search" component={Search} {...getRouteHooks('search')}/>

        <Route name="userFeed" path="/:userName" component={User} {...getRouteHooks('userFeed')}/>
        <Route name="userSummary" path="/:userName/summary(/:days)" component={User} {...getRouteHooks('userSummary')}/>
        <Route name="userSubscribers" path="/:userName/subscribers" component={User} {...getRouteHooks('userSubscribers')}/>
        <Route name="userSubscriptions" path="/:userName/subscriptions" component={User} {...getRouteHooks('userSubscriptions')}/>
        <Route name="userComments" path="/:userName/comments" component={User} {...getRouteHooks('userComments')}/>
        <Route name="userLikes" path="/:userName/likes" component={User} {...getRouteHooks('userLikes')}/>
        <Route name="groupSettings" path="/:userName/settings" component={GroupSettings} {...getRouteHooks('groupSettings')}/>
        <Route name="userManageSubscribers" path="/:userName/manage-subscribers" component={User} {...getRouteHooks('userSubscribers')}/>

        <Route name="post" path="/:userName/:postId" component={SinglePost} {...getRouteHooks('post')}/>
      </Route>
    </Router>
  </Provider>,
  document.getElementById('root')
);
