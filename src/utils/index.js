import _ from 'lodash';
import format from 'date-fns/format';
import differenceInMilliseconds from 'date-fns/difference_in_milliseconds';
import startOfDay from 'date-fns/start_of_day';
import startOfYear from 'date-fns/start_of_year';
import subDays from 'date-fns/sub_days';

import { frontendPreferences as frontendPrefsConfig } from '../../config/config';
import * as PostVisibilityLevels from './post-visibility-levels';

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
  return format(new Date(timestamp));
}

export function getRelativeDate(timestamp, long = true) {
  const m = new Date(timestamp);
  const now = new Date();
  const age = differenceInMilliseconds(now, m);

  // Just now (when age < 45s)
  if (age < 45 * 1000) {
    return 'Just now';
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
  if (m > startOfDay(now)) {
    return (long
      ? format(m, '[Today at] HH:mm')
      : format(m, 'HH:mm')
    );
  }

  // Yesterday at 15:37 (when age >= 8.5 hrs and it's yesterday)
  if (m > startOfDay(subDays(now, 1))) {
    return (long
      ? format(m, '[Yesterday at] HH:mm')
      : format(m, '[Yest] HH:mm')
    );
  }

  // Wed, 17 Feb (when yesterday < age < 14 days)
  if (m > subDays(now, 14)) {
    return (long
      ? format(m, 'ddd, D MMM')
      : format(m, 'D MMM')
    );
  }

  // 17 February (when age >= 14 days but it's still this year)
  if (m > startOfYear(now)) {
    return (long
      ? format(m, 'D MMMM')
      : format(m, 'D MMM')
    );
  }

  // 17 Feb 2016 (for everything else)
  return format(m, 'D MMM YYYY');
}

export function getFullDate(timestamp) {
  return format(new Date(timestamp), 'YYYY-MM-DD HH:mm:ss [UTC]Z');
}

export function userParser(user) {
  const newUser = { ...user };

  // Remove invisible characters from display name
  if (newUser.screenName) {
    newUser.screenName = newUser.screenName.replace(/[\u180E\u2000-\u200F\u2060\u2800\u3000\u3164\u{1D159}]/gu, '');
  }

  // Missing display name
  if (!newUser.screenName) {
    newUser.screenName = newUser.username;
  }

  return newUser;
}

export function meParser(user) {
  const newUser = userParser(user);

  // Frontend preferences (only use this client's subtree)
  const prefSubTree = user.frontendPreferences && user.frontendPreferences[frontendPrefsConfig.clientId];
  newUser.frontendPreferences = _.merge({}, frontendPrefsConfig.defaultValues, prefSubTree);

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

export function getSummaryPeriod(days) {
  switch (+days) {
    case 1: return 'day';
    case 7: return 'week';
    case 30: return 'month';
    default: return days + ' days';
  }
}
