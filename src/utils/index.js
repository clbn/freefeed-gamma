import _ from 'lodash';

import { frontendPreferences as frontendPrefsConfig } from '../../config/app';

export function getCookie(name) {
  const begin = document.cookie.indexOf(name);
  if (begin === -1) {
    return '';
  }
  const fromBegin = document.cookie.substr(begin);
  const tokenWithName = fromBegin.split(';');
  const tokenWithNameSplit = tokenWithName[0].split('=');
  const token = tokenWithNameSplit[1];
  return token.trim();
}

export function setCookie(name, value = '', expiresDays, path, domain) {
  const expiresDate = Date.now() + expiresDays * 24 * 60 * 60 * 1000;
  const expiresTime = new Date(expiresDate).toUTCString();
  const cookie = `${name}=${value}` +
    `;expires=${expiresTime}` +
    `;path=${path}` +
    (domain && domain !== 'localhost' ? `;domain=${domain}` : '');
  return document.cookie = cookie;
}

import moment from 'moment';

export function fromNowOrNow(date) {
  var now = moment(date);

  if (Math.abs(moment().diff(now)) < 1000) { // 1000 milliseconds
    return 'just now';
  }

  return now.fromNow();
}

export function getFullDate(date) {
  return moment(date).format('YYYY-MM-DD HH:mm:ss [UTC]Z');
}

import defaultUserpic50Path from 'assets/images/default-userpic-50.png';
import defaultUserpic75Path from 'assets/images/default-userpic-75.png';

const userDefaults = {
  profilePictureMediumUrl: defaultUserpic50Path,
  profilePictureLargeUrl: defaultUserpic75Path,
  frontendPreferences: frontendPrefsConfig.defaultValues
};

export function userParser(user) {
  const newUser = { ...user };

  // Missing display name
  if (!user.screenName) {
    newUser.screenName = user.username;
  }

  // Profile pictures
  newUser.profilePictureMediumUrl = user.profilePictureMediumUrl || userDefaults.profilePictureMediumUrl;
  newUser.profilePictureLargeUrl = user.profilePictureLargeUrl || userDefaults.profilePictureLargeUrl;

  // Frontend preferences (only use this client's subtree)
  const prefSubTree = user.frontendPreferences && user.frontendPreferences[frontendPrefsConfig.clientId];
  newUser.frontendPreferences = _.merge({}, userDefaults.frontendPreferences, prefSubTree);

  return newUser;
}

export function postParser(post) {
  post.commentsDisabled = (post.commentsDisabled === '1');
  return { ...post };
}

export function preventDefault(realFunction) {
  return (event) => {
    // Check if it's a "click" (not "submit", "keydown" etc).
    // Also, check if it's a "fancy" one (made with middle button, or with Shift pressed etc).
    // Then, if it's a "fancy click", don't prevent default action.
    // Prevent custom action ("realFunction") instead.
    if (event.type === 'click' && (event.button !== 0 || event.shiftKey || event.ctrlKey || event.altKey || event.metaKey)) {
      return true;
    }

    event.preventDefault();
    return realFunction && realFunction(event);
  };
}

export function stopPropagation(event) {
  event.stopPropagation();
}

export function confirmFirst(realFunction) {
  return () => {
    if (confirm('Are you sure?')) {
      return realFunction && realFunction();
    }
  };
}

export function getCurrentRouteName(router) {
  return router && router.routes && router.routes[router.routes.length - 1].name;
}

export function pluralForm(n, singular, plural = null, format = 'n w') {
  let w;

  if (n == 1) {
    w = singular;
  } else if (plural) {
    w = plural;
  } else {
    w = singular + 's';
  }

  return format.replace('n', n).replace('w', w);
}

export function isMobile() {
  const viewportWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
  return (viewportWidth <= 991);
}

export function toggleSidebar(val = null) {
  const elements = document.querySelectorAll('.sidebar-overlay, .mobile-sidebar-toggle');

  if (val === true || val === false) {
    [...elements].forEach(el => el.classList.toggle('mobile-sidebar-open', val)); // if true, then add class, if not, remove class
  } else {
    [...elements].forEach(el => el.classList.toggle('mobile-sidebar-open')); // if class exists, then remove it, if not, add it
  }
}
