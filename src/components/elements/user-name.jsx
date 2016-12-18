import React from 'react';
import { Link } from 'react-router';
import { connect } from 'react-redux';

import { updateUserCard } from '../../redux/action-creators';
import * as FrontendPrefsOptions from '../../utils/frontend-preferences-options';
import { isMobile } from '../../utils';

const DisplayOption = ({ user, me, preferences }) => {
  if (user.username === me && preferences.useYou) {
    return <span>You</span>;
  }

  if (user.screenName === user.username) {
    return <span>{user.screenName}</span>;
  }

  switch (preferences.displayOption) {
    case FrontendPrefsOptions.DISPLAYNAMES_DISPLAYNAME: {
      return <span>{user.screenName}</span>;
    }
    case FrontendPrefsOptions.DISPLAYNAMES_BOTH: {
      return <span>{user.screenName} ({user.username})</span>;
    }
    case FrontendPrefsOptions.DISPLAYNAMES_USERNAME: {
      return <span>{user.username}</span>;
    }
  }

  return <span>{user.screenName}</span>;
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
    this.props.updateUserCard({ isHovered: true, username: this.props.user.username, rects, x: event.pageX, y: event.pageY });
  }

  leaveUserName = () => {
    if (isMobile()) { return; }

    this.props.updateUserCard({ isHovered: false });
  }

  render() {
    return (
      <div className="user-name-wrapper"
        onMouseEnter={this.enterUserName}
        onMouseLeave={this.leaveUserName}>

        <Link to={`/${this.props.user.username}`} className={this.props.className}
              onMouseEnter={this.props.onMouseEnter} onMouseLeave={this.props.onMouseLeave}>
          {this.props.display ? (
            <span>{this.props.display}</span>
          ) : (
            <DisplayOption
              user={this.props.user}
              me={this.props.me}
              preferences={this.props.frontendPreferences.displayNames}/>
          )}
        </Link>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    me: state.user.username,
    frontendPreferences: state.user.frontendPreferences,
    userCardView: state.userCardView
  };
};

function mapDispatchToProps(dispatch) {
  return {
    updateUserCard: (...args) => dispatch(updateUserCard(...args))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(UserName);
