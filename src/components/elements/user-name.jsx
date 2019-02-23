import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';

import { updateUserCard } from '../../redux/action-creators';
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

class UserName extends React.Component {
  enterUserName = (event) => {
    if (isMobile()) { return; }

    const rawRects = event.currentTarget.getClientRects();
    const rects = [];
    for (let i = 0; i < rawRects.length; i++) {
      rects.push({
        left: rawRects[i].left,
        right: rawRects[i].right,
        top: rawRects[i].top,
        bottom: rawRects[i].bottom
      });
    }
    this.props.updateUserCard({ isHovered: true, username: this.props.username, rects, x: event.pageX, y: event.pageY });
  };

  leaveUserName = () => {
    if (isMobile()) { return; }

    this.props.updateUserCard({ isHovered: false });
  };

  render() {
    return (
      <div className="user-name-wrapper"
        onMouseEnter={this.enterUserName}
        onMouseLeave={this.leaveUserName}>

        <Link to={`/${this.props.username}`} className={this.props.className}
          onMouseEnter={this.props.onMouseEnter} onMouseLeave={this.props.onMouseLeave}>

          {this.props.display ? (
            this.props.display
          ) : (
            <DisplayOption {...this.props}/>
          )}
        </Link>
      </div>
    );
  }
}

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

const mapDispatchToProps = {
  updateUserCard
};

export default connect(mapStateToProps, mapDispatchToProps)(UserName);
