import React from 'react';
import {Link} from 'react-router';
import {connect} from 'react-redux';

import UserCard from './user-card';
import * as FrontendPrefsOptions from '../utils/frontend-preferences-options';

const USERCARD_SHOW_DELAY = 1000;
const USERCARD_HIDE_DELAY = 750;

const DisplayOption = ({user, me, preferences}) => {
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
  constructor(props) {
    super(props);

    this.state = {
      isHovered: false,
      isCardOpen: false
    };

    this.timeoutIds = [];
  }

  enterUserName() {
    this.setState({isHovered: true});

    const timeoutId = setTimeout(() => {
      if (this.state.isHovered) {
        this.setState({isCardOpen: true});
      }
      this.timeoutIds = this.timeoutIds.filter((i) => (i !== timeoutId));
    }, USERCARD_SHOW_DELAY);

    this.timeoutIds.push(timeoutId);
  }

  leaveUserName() {
    this.setState({isHovered: false});

    const timeoutId = setTimeout(() => {
      if (!this.state.isHovered) {
        this.setState({isCardOpen: false});
      }
      this.timeoutIds = this.timeoutIds.filter((i) => (i !== timeoutId));
    }, USERCARD_HIDE_DELAY);

    this.timeoutIds.push(timeoutId);
  }

  componentWillUnmount() {
    this.timeoutIds.forEach(clearTimeout);
    this.timeoutIds = [];
  }

  render() {
    return (
      <div className="user-name-wrapper"
        onMouseEnter={this.enterUserName.bind(this)}
        onMouseLeave={this.leaveUserName.bind(this)}>

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

        {this.state.isCardOpen ? (
          <UserCard username={this.props.user.username}/>
        ) : false}
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    me: state.user.username,
    frontendPreferences: state.user.frontendPreferences
  };
};

export default connect(mapStateToProps)(UserName);
