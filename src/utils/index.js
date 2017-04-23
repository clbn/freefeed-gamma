import _ from 'lodash';
import moment from 'moment';

import { frontendPreferences as frontendPrefsConfig } from '../../config/app';
import * as PostVisibilityLevels from './post-visibility-levels';
import defaultUserpic50Path from 'assets/images/default-userpic-50.png';
import defaultUserpic75Path from 'assets/images/default-userpic-75.png';

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

export function getISODate(timestamp) {
  return moment(timestamp).format();
}

export function getRelativeDate(timestamp, long = true) {
  const m = moment(timestamp);
  const now = moment();
  const age = now.diff(m);

  // Just now (when age < 45s)
  if (age < 45 * 1000) {
    return (long
      ? 'Just now'
      : false
    );
  }

  // 1-59 minutes ago (when 45s <= age < 59.5m)
  if (age < 59.5 * 60 * 1000) {
    const minutes = Math.round(age/60/1000);
    return (long
      ? pluralForm(minutes, 'minute') + ' ago'
      : pluralForm(minutes, 'min')
    );
  }

  // 1, 1.5, 2-8 hours ago (when 59.5m <= age < 8.5h)
  if (age < 8.5 * 3600 * 1000) {
    let hours = Math.round(age/1800/1000) / 2;
    if (hours > 2) {
      hours = Math.round(hours);
    }
    return (long
      ? pluralForm(hours, 'hour') + ' ago'
      : pluralForm(hours, 'hr')
    );
  }

  // Today at 15:37 (when age >= 8.5 hrs and it's today)
  if (m > now.startOf('day')) {
    return (long
      ? m.format('[Today at] HH:mm')
      : m.format('HH:mm')
    );
  }

  // Yesterday at 15:37 (when age >= 8.5 hrs and it's yesterday)
  if (m > now.subtract(1, 'days').startOf('day')) {
    return (long
      ? m.format('[Yesterday at] HH:mm')
      : m.format('[Yest] HH:mm')
    );
  }

  // Wed, 17 Feb (when yesterday < age < 14 days)
  if (m > now.subtract(14, 'days')) {
    return (long
      ? m.format('ddd, D MMM')
      : m.format('D MMM')
    );
  }

  // 17 February (when age >= 14 days but it's still this year)
  if (m > now.startOf('year')) {
    return (long
      ? m.format('D MMMM')
      : m.format('D MMM')
    );
  }

  // 17 Feb 2016 (for everything else)
  return m.format('D MMM YYYY');
}

export function getFullDate(date) {
  return moment(date).format('YYYY-MM-DD HH:mm:ss [UTC]Z');
}

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
  if (val === true || val === false) {
    document.body.classList.toggle('mobile-sidebar-open', val); // if true, then add class, if not, remove class
  } else {
    document.body.classList.toggle('mobile-sidebar-open'); // if class exists, then remove it, if not, add it
  }

  if (document.body.classList.contains('mobile-sidebar-open')) {
    document.querySelector('.sidebar').scrollTop = 0;
  }
}

export function getPostVisibilityLevel(recipients, authorId) {
  // Calculate individual levels for recipients
  const recipientLevels = recipients.map((recipient) => {
    if (recipient.type === 'user' && recipient.id !== authorId) {
      return PostVisibilityLevels.DIRECT;
    }
    if (recipient.isPrivate === '1') {
      return PostVisibilityLevels.PRIVATE;
    }
    if (recipient.isProtected === '1') {
      return PostVisibilityLevels.PROTECTED;
    }
    return PostVisibilityLevels.PUBLIC;
  });

  // Calculate combined level for post
  return Math.min(...recipientLevels);
}
