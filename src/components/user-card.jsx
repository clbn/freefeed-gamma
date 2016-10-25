import React from 'react';
import {Link} from 'react-router';
import {connect} from 'react-redux';
import classnames from 'classnames';
import _ from 'lodash';

import {userActions} from '../redux/select-utils';
import {getUserInfo, updateUserCard} from '../redux/action-creators';
import {confirmFirst, isMobile} from '../utils';
import throbber16 from 'assets/images/throbber-16.gif';

const USERCARD_SHOW_DELAY = 1000;
const USERCARD_HIDE_DELAY = 500;

class UserCard extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      position: {left: 0, top: 0},
      isDescriptionOpen: false
    };

    this.loadingUser = false;
    this.triggerRect = {}; // clientRect that triggered UserCard
    this.timeoutIds = [];
  }

  getTriggerRect = (nextProps) => {
    const pageX = nextProps.userCardView.x;
    const pageY = nextProps.userCardView.y;
    const rects = nextProps.userCardView.rects;

    for (let i = 0; i < rects.length; i++) {
      if (pageX >= rects[i].left + window.scrollX - 2 &&
          pageX <= rects[i].right + window.scrollX + 2 &&
          pageY >= rects[i].top + window.scrollY - 2 &&
          pageY <= rects[i].bottom + window.scrollY + 2) {
        return rects[i];
      }
    }

    return false;
  }

  getPosition = (nextProps) => {
    const position = {};

    const pageX = nextProps.userCardView.x;
    const rectLeft = this.triggerRect.left;
    const rectRight = this.triggerRect.right;


    // Find X

    const xOffset = 20; // offset from the edge of the rect (in px)
    const xThreshold = 235; // threshold from the right edge of the viewport (in px)

    const pageWidth = Math.max(document.body.scrollWidth, document.body.offsetWidth,
      document.documentElement.scrollWidth, document.documentElement.offsetWidth,
      document.documentElement.clientWidth);

    const viewportWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);

    let x = 0;
    if (rectRight - rectLeft < xOffset * 2) {
      x = rectLeft + (rectRight - rectLeft) / 2;
    } else {
      x = Math.max(rectLeft + xOffset, Math.min(pageX - window.scrollX, rectRight - xOffset));
    }

    if (viewportWidth - x > xThreshold) {
      position.left = x + window.scrollX;
    } else {
      position.right = pageWidth - x - window.scrollX;
    }


    // Find Y

    const yThreshold = 150; // threshold from the bottom of the viewport (in px)

    const pageHeight = Math.max(document.body.scrollHeight, document.body.offsetHeight,
      document.documentElement.scrollHeight, document.documentElement.offsetHeight,
      document.documentElement.clientHeight);

    const viewportHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);

    if (viewportHeight - this.triggerRect.bottom > yThreshold) {
      position.top = this.triggerRect.bottom + window.scrollY;
    } else {
      position.bottom = pageHeight - this.triggerRect.top - window.scrollY;
    }

    return position;
  }

  componentWillReceiveProps(nextProps) {
    if (isMobile()) { return; }

    if (nextProps.userCardView.username && !nextProps.user.id && !nextProps.user.errorMessage && !this.loadingUser) {
      this.loadingUser = true;
      setTimeout(() => this.props.getUserInfo(nextProps.userCardView.username), 0);
    }

    if (nextProps.user.id || nextProps.user.errorMessage) {
      this.loadingUser = false;
    }

    if (nextProps.userCardView.rects && nextProps.userCardView.x && nextProps.userCardView.y) {
      const nextTriggerRect = this.getTriggerRect(nextProps);
      if (nextTriggerRect && !_.isEqual(this.triggerRect, nextTriggerRect)) {
        this.triggerRect = nextTriggerRect;
        this.setState({position: this.getPosition(nextProps), isDescriptionOpen: false});
      }

      if (!this.props.userCardView.isHovered && nextProps.userCardView.isHovered) {
        const timeoutId = setTimeout(() => {
          if (this.props.userCardView.isHovered && !this.props.userCardView.isOpen) {
            this.props.updateUserCard({isOpen: true});
          }
          this.timeoutIds = this.timeoutIds.filter((i) => (i !== timeoutId));
        }, USERCARD_SHOW_DELAY);

        this.timeoutIds.push(timeoutId);
      }

      if (this.props.userCardView.isHovered && !nextProps.userCardView.isHovered) {
        const timeoutId = setTimeout(() => {
          if (!this.props.userCardView.isHovered && this.props.userCardView.isOpen) {
            this.props.updateUserCard({isOpen: false});
            this.triggerRect = {};
          }
          this.timeoutIds = this.timeoutIds.filter((i) => (i !== timeoutId));
        }, USERCARD_HIDE_DELAY);

        this.timeoutIds.push(timeoutId);
      }

    }
  }

  enterUserCard = () => {
    this.props.updateUserCard({isHovered: true});
  }

  leaveUserCard = () => {
    this.props.updateUserCard({isHovered: false});
  }

  toggleDescription = () => {
    this.setState({isDescriptionOpen: !this.state.isDescriptionOpen});
  }

  unsubscribe = () => {
    if (this.props.amIGroupAdmin) {
      alert('You are the Admin for this group. If you want to unsubscribe please drop administrative privileges first.');
    } else {
      this.props.unsubscribe({username: this.props.user.username, id: this.props.user.id});
    }
  }

  render() {
    const props = this.props;

    if (!props.userCardView.isOpen) {
      return <div/>;
    }

    const cardClasses = classnames({
      'user-card': true,
      'upside-down': !!this.state.position.bottom,
      'right-to-left': !!this.state.position.right
    });

    return (
      props.user.errorMessage ? (
        <div className={cardClasses} style={this.state.position} onMouseEnter={this.enterUserCard} onMouseLeave={this.leaveUserCard}>
          <div className="user-card-info">
            <div className="userpic userpic-large userpic-error">
              <i className="fa fa-exclamation"></i>
            </div>
            <div className="username">@{props.user.username}</div>
            <div className="description">{props.user.errorMessage}</div>
          </div>
        </div>
      ) : !props.user.id ? (
        <div className={cardClasses} style={this.state.position} onMouseEnter={this.enterUserCard} onMouseLeave={this.leaveUserCard}>
          <div className="user-card-info">
            <div className="userpic userpic-large userpic-loading"></div>
            <div className="username">
              <img width="16" height="16" src={throbber16}/>
            </div>
          </div>
        </div>
      ) : (
        <div className={cardClasses} style={this.state.position} onMouseEnter={this.enterUserCard} onMouseLeave={this.leaveUserCard}>
          <div className="user-card-info">
            <Link to={`/${props.user.username}`} className="userpic userpic-large">
              <img src={props.user.profilePictureLargeUrl} width="75" height="75"/>
            </Link>

            <div className="display-name">
              <Link to={`/${props.user.username}`}>{props.user.screenName}</Link>
            </div>

            <div className="username">
              @{props.user.username}
              {props.user.description ? (
                <i className={'description-trigger fa ' + (this.state.isDescriptionOpen ? 'fa-chevron-up' : 'fa-chevron-down')}
                   onClick={this.toggleDescription}></i>
              ) : false}
            </div>

            {this.state.isDescriptionOpen ? (
              <div className="description">{props.user.description}</div>
            ) : false}

            {!props.isItMe ? (
              <div className="description">
                {props.user.isPrivate === '1' ? (
                  <span><i className="fa fa-lock"></i> Private</span>
                ) : (
                  <span><i className="fa fa-globe"></i> Public</span>
                )}
                {props.user.isRestricted === '1' ? ' restricted' : false}
                {props.user.type === 'user' ? ' feed' : ' group'}
              </div>
            ) : false}

            {props.isItMe ? (
              <div className="status">It's you!</div>
            ) : (
              <div className="status">
                {props.blocked ? (
                  <span><i className="fa fa-ban"></i> You've blocked the user</span>
                ) : props.hasRequestBeenSent ? (
                  <span><i className="fa fa-clock-o"></i> You've sent sub request</span>
                ) : props.amISubscribedToUser ? (
                  props.user.type === 'user' ? (
                    props.isUserSubscribedToMe ? (
                      <span><i className="fa fa-check-circle"></i> Mutually subscribed</span>
                    ) : (
                      <span><i className="fa fa-check-circle"></i> You are subscribed</span>
                    )
                  ) : props.amIGroupAdmin ? (
                    <span><i className="fa fa-check-square"></i> You are an admin</span>
                  ) : (
                    <span><i className="fa fa-check-square"></i> You are a member</span>
                  )
                ) : props.isUserSubscribedToMe ? (
                  <span><i className="fa fa-check-circle-o"></i> User subscribed to you</span>
                ) : (
                  false
                )}
              </div>
            )}
          </div>

          {props.blocked ? (
            <div className="user-card-actions">
              <a onClick={()=>props.unban({username: props.user.username, id: props.user.id})}>Un-block</a>
            </div>
          ) : !props.isItMe ? (
            <div className="user-card-actions">
              {props.amISubscribedToUser && props.isUserSubscribedToMe ? (
                <span><Link to={`/filter/direct?to=${props.user.username}`}>Direct message</Link> - </span>
              ) : false}

              {props.user.isPrivate === '1' && !props.amISubscribedToUser ? (
                props.hasRequestBeenSent ? (
                  <a onClick={()=>props.revokeSentRequest({username: props.user.username, id: props.user.id})}>Revoke sub request</a>
                ) : (
                  <a onClick={()=>props.sendSubscriptionRequest({username: props.user.username, id: props.user.id})}>Request a subscription</a>
                )
              ) : (
                props.amISubscribedToUser ? (
                  <a onClick={confirmFirst(this.unsubscribe)}>Unsubscribe</a>
                ) : (
                  <a onClick={()=>props.subscribe({username: props.user.username, id: props.user.id})}>Subscribe</a>
                )
              )}

              {props.userView.isSubscribing ? (
                <span className="user-card-actions-throbber">
                  <img width="15" height="15" src={throbber16}/>
                </span>
              ) : false}

              {props.user.type !== 'group' && !props.amISubscribedToUser ? (
                <span> - <a onClick={()=>props.ban({username: props.user.username, id: props.user.id})}>Block</a></span>
              ) : props.amIGroupAdmin ? (
                <span> - <Link to={`/${props.user.username}/settings`}>Group settings</Link></span>
              ) : false}

              {props.userView.isBlocking ? (
                <span className="user-card-actions-throbber">
                  <img width="15" height="15" src={throbber16}/>
                </span>
              ) : false}
            </div>
          ) : false}
        </div>
      )
    );
  }
}

const mapStateToProps = (state) => {
  const userCardView = state.userCardView;

  const me = state.user;

  const user = (_.find(state.users, {username: userCardView.username}) || {});
  if (!user.id) {
    user.username = userCardView.username;
    user.errorMessage = state.userErrors[userCardView.username];
  }

  const userView = (state.userViews[user.id] || {});

  return {
    userCardView,
    user,
    userView,
    isItMe: (me.username === user.username),
    amISubscribedToUser: ((me.subscriptions || []).indexOf(user.id) > -1),
    isUserSubscribedToMe: (_.findIndex(me.subscribers, {id: user.id}) > -1),
    hasRequestBeenSent: ((me.pendingSubscriptionRequests || []).indexOf(user.id) > -1),
    blocked: ((me.banIds || []).indexOf(user.id) > -1),
    amIGroupAdmin: (user.type === 'group' && (user.administrators || []).indexOf(me.id) > -1)
  };
};

function mapDispatchToProps(dispatch) {
  return {
    ...userActions(dispatch),
    updateUserCard: (...args) => dispatch(updateUserCard(...args)),
    getUserInfo: (username) => dispatch(getUserInfo(username))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(UserCard);
