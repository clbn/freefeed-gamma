import React from 'react';
import { Link } from 'react-router';

import { confirmFirst, pluralForm } from '../../utils';
import UserFeedStatus from './user-feed-status';
import UserRelationshipStatus from './user-relationship-status';
import PostCreateForm from './post-create-form';
import PieceOfText from './piece-of-text';
import throbber16 from 'assets/images/throbber-16.gif';

export default class UserProfile extends React.Component {
  constructor(props) {
    super(props);
    this.state = { isUnsubWarningDisplayed: false };
  }

  componentWillReceiveProps() {
    this.setState({ isUnsubWarningDisplayed: false });
  }

  getProfileStatsItem = (name) => {
    // Subscribers are displayed for both groups and users, everything else is user-exclusive
    if (name === 'subscriber' || this.props.type === 'user') {
      const number = this.props.statistics[name + 's'];
      const text = pluralForm(number, name);
      const url = (name === 'post' ? `/${this.props.username}` : `/${this.props.username}/${name}s`);
      const link = (this.props.canISeeSubsList ? <Link to={url}>{text}</Link> : text);

      return <div className="profile-stats-item">{link}</div>;
    }

    return false;
  };

  unsubscribe = () => {
    if (this.props.amIGroupAdmin) {
      this.setState({ isUnsubWarningDisplayed: true });
    } else {
      this.props.unsubscribe({ username: this.props.username, id: this.props.id });
    }
  };

  handleBlock = () => this.props.ban({ username: this.props.username, id: this.props.id });
  handleUnblock = () => this.props.unban({ username: this.props.username, id: this.props.id });
  handleSendSubRequest = () => this.props.sendSubscriptionRequest({ username: this.props.username, id: this.props.id });
  handleRevokeSentRequest = () => this.props.revokeSentRequest({ username: this.props.username, id: this.props.id });
  handleSubscribe = () => this.props.subscribe({ username: this.props.username, id: this.props.id });
  handleUnsubscribe = confirmFirst(this.unsubscribe);

  render() {
    const props = this.props;

    return (
      <div>
        {!props.isLoading && !props.isUserFound ? (
          <h2>404 Not Found</h2>
        ) : (
          <div className="user-profile">
            <div className="row">
              <div className="col-sm-9 col-xs-12">
                {props.isLoading && !props.profilePictureLargeUrl ? (
                  <div className="userpic userpic-large userpic-loading"></div>
                ) : (
                  <Link to={`/${props.username}`} className="userpic userpic-large">
                    <img src={props.profilePictureLargeUrl} width="75" height="75"/>
                  </Link>
                )}

                {props.isLoading && !props.screenName ? (
                  <div className="profile-displayname profile-loading">@{props.requestedUsername}</div>
                ) : (
                  <div>
                    <div className="profile-displayname"><Link to={`/${props.username}`}>{props.screenName}</Link></div>

                    {props.screenName !== props.username ? (
                      <div className="profile-username">@{props.username}</div>
                    ) : false}

                    {props.description ? (
                      <div className={'profile-description ' + (!props.isInUserPostFeed ? 'profile-description-collapsed' : '')}>
                        <PieceOfText text={props.description} isExpanded={props.isInUserPostFeed} key={props.isInUserPostFeed}/>
                      </div>
                    ) : false}
                  </div>
                )}
              </div>
              {props.statistics && !props.isBlocked ? (
                <div className="col-sm-3 col-xs-12">
                  <div className="profile-stats">
                    {this.getProfileStatsItem('subscriber')}
                    {' '}
                    {this.getProfileStatsItem('subscription')}
                    {' '}
                    {this.getProfileStatsItem('post')}
                    {' '}
                    {this.getProfileStatsItem('comment')}
                    {' '}
                    {this.getProfileStatsItem('like')}
                  </div>
                </div>
              ) : false}
            </div>
          </div>
        )}

        {props.showProfileControls ? (
          <div className="profile-status-and-controls">
            <div className="row">
              <div className="col-sm-6 col-xs-12">
                <span className="profile-status">
                  <UserFeedStatus {...props}/>
                </span>

                <span className="profile-status">
                  <UserRelationshipStatus {...props}/>
                </span>
              </div>

              <div className="col-sm-6 col-xs-12">
                {props.isBlocked ? (
                  <div className="profile-controls">
                    {props.userView.isBlocking ? 'Unblocking...' : <a onClick={this.handleUnblock}>Un-block</a>}

                    {props.userView.isBlocking ? (
                      <span className="profile-controls-throbber">
                        <img width="16" height="16" src={throbber16}/>
                      </span>
                    ) : false}
                  </div>
                ) : (
                  <div className="profile-controls">
                    {props.amISubscribedToUser && props.isUserSubscribedToMe ? (
                      <span><Link to={`/filter/direct?to=${props.username}`}>Direct message</Link> - </span>
                    ) : false}

                    {props.isPrivate === '1' && !props.amISubscribedToUser ? (
                      props.hasRequestBeenSent ? (
                        props.userView.isSubscribing ? 'Revoking...' : <a onClick={this.handleRevokeSentRequest}>Revoke request</a>
                      ) : (
                        props.userView.isSubscribing ? 'Requesting...' : <a onClick={this.handleSendSubRequest}>Request a subscription</a>
                      )
                    ) : (
                      props.amISubscribedToUser ? (
                        props.userView.isSubscribing ? 'Unsubscribing...' : <a onClick={this.handleUnsubscribe}>Unsubscribe</a>
                      ) : (
                        props.userView.isSubscribing ? 'Subscribing...' : <a onClick={this.handleSubscribe}>Subscribe</a>
                      )
                    )}

                    {props.userView.isSubscribing ? (
                      <span className="profile-controls-throbber">
                        <img width="16" height="16" src={throbber16}/>
                      </span>
                    ) : false}

                    {props.type !== 'group' && !props.amISubscribedToUser ? (
                      props.userView.isBlocking ? ' - Blocking...' : <span> - <a onClick={this.handleBlock}>Block this user</a></span>
                    ) : false}

                    {props.userView.isBlocking ? (
                      <span className="profile-controls-throbber">
                        <img width="16" height="16" src={throbber16}/>
                      </span>
                    ) : false}

                    {props.type === 'group' && props.amIGroupAdmin ? (
                      <span>
                        {' - '}
                        <Link to={`/${props.username}/manage-subscribers`}>Manage subscribers</Link>
                        {' - '}
                        <Link to={`/${props.username}/settings`}>Settings</Link>
                      </span>
                    ) : false}
                  </div>
                )}
              </div>

              {this.state.isUnsubWarningDisplayed ? (
                <div className="col-xs-12">
                  <div className="alert alert-warning">
                    You are the Admin for this group. If you want to unsubscribe please drop administrative privileges first
                    at <Link to={`/${props.username}/manage-subscribers`}>Manage subscribers</Link> page
                  </div>
                </div>
              ) : false}
            </div>
          </div>
        ) : false}

        {props.canIPostHere ? (
          <PostCreateForm defaultRecipient={props.defaultRecipient}/>
        ) : false}
      </div>
    );
  }
}
