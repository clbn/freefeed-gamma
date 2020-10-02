import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import Tippy from '@tippyjs/react';
import { inlinePositioning } from 'tippy.js';

import UserCard from './user-card';
import * as FrontendPrefsOptions from '../../utils/frontend-preferences-options';
import { isMobile } from '../../utils';

const DisplayOption = ({ username, screenName, isItMe, myPrefs }) => {
  const myDisPrefs = myPrefs.displayNames;

  if (isItMe && myDisPrefs.useYou) {
    return 'You';
  }

  if (screenName === username) {
    return screenName;
  }

  switch (myDisPrefs.displayOption) {
    case FrontendPrefsOptions.DISPLAYNAMES_DISPLAYNAME: {
      return screenName;
    }
    case FrontendPrefsOptions.DISPLAYNAMES_BOTH: {
      return `${screenName} (${username})`;
    }
    case FrontendPrefsOptions.DISPLAYNAMES_USERNAME: {
      return username;
    }
  }

  return screenName;
};

const tippyOptions = {
  animation: 'fade',
  appendTo: () => document.body,
  arrow: true,
  delay: isMobile() ? 0 : [200, 100],
  inlinePositioning: true,
  interactive: true,
  placement: 'bottom',
  plugins: [inlinePositioning],
  trigger: isMobile() ? 'click' : 'mouseenter',
  theme: 'gamma gamma-usercard',
  zIndex: 9
};

const UserName = (props) => {
  const [tooltipOpen, setTooltipOpen] = useState(false);

  const onShow = useCallback(() => setTooltipOpen(true), []);
  const onHide = useCallback(() => setTooltipOpen(false), []);
  const onClick = useCallback(event => { if (isMobile()) { event.preventDefault(); } }, []);

  const tooltipContent = tooltipOpen && <UserCard username={props.username}/>; // only render UserCard when needed

  return (
    <Tippy content={tooltipContent} onShow={onShow} onHide={onHide} {...tippyOptions}>
      <span>
        <Link to={`/${props.username}`} className={props.className}
          onMouseEnter={props.onMouseEnter} onMouseLeave={props.onMouseLeave} onClick={onClick}>
          {props.display || <DisplayOption {...props}/>}
        </Link>
      </span>
    </Tippy>
  );
};

const idOrUsernameAreRequired = (props, propName, componentName) => {
  if (!props.id && !props.username) {
    return new Error('One of `id` or `username` is required in `' + componentName + '`, but none were provided.');
  }
};
UserName.propTypes = {
  customValidator: idOrUsernameAreRequired,
  id: PropTypes.string,
  username: PropTypes.string,
  display: PropTypes.string
};

const getUserName = createSelector(
  [
    // If there's no props.id, fall back to optional props.username
    (state, props) => (props.id && state.users[props.id] ? state.users[props.id].username : props.username),
    (state, props) => (props.id && state.users[props.id] ? state.users[props.id].screenName : ''),
    (state, props) => state.me.id && (state.me.id === props.id || state.me.username === props.username),
    (state) => state.me.frontendPreferences
  ],
  (username, screenName, isItMe, myPrefs) => ({
    username,
    screenName,
    isItMe,
    myPrefs
  })
);

const mapStateToProps = (state, ownProps) => ({
  ...getUserName(state, ownProps)
});

export default connect(mapStateToProps)(UserName);
