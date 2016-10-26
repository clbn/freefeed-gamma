import React from 'react';
import {Link} from 'react-router';

import {confirmFirst, preventDefault, pluralForm} from '../utils';
import PostCreateForm from './post-create-form';
import PieceOfText from './piece-of-text';
import throbber16 from 'assets/images/throbber-16.gif';

export default class UserProfile extends React.Component {
  constructor(props) {
    super(props);
    this.state = { isUnsubWarningDisplayed: false };
  }

  componentWillReceiveProps = (newProps) => {
    this.setState({ isUnsubWarningDisplayed: false });
  }

  render() {
    const props = this.props;

    const unsubscribe = () => {
      if (props.amIGroupAdmin) {
        this.setState({ isUnsubWarningDisplayed: true });
      } else {
        props.unsubscribe({username: props.username, id: props.id});
      }
    };

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
              {props.statistics && !props.blocked ? (
                <div className="col-sm-3 col-xs-12">
                  <div className="profile-stats">
                    <div className="profile-stats-item">
                      {props.canISeeSubsList ? (
                        <Link to={`/${props.username}/subscribers`}>{pluralForm(props.statistics.subscribers, 'subscriber')}</Link>
                      ) : (
                        pluralForm(props.statistics.subscribers, 'subscriber')
                      )}
                    </div>
                    {' '}
                    {props.type !== 'group' ? (
                      <div className="profile-stats-item">
                        {props.canISeeSubsList ? (
                          <Link to={`/${props.username}/subscriptions`}>{pluralForm(props.statistics.subscriptions, 'subscription')}</Link>
                        ) : (
                          pluralForm(props.statistics.subscriptions, 'subscription')
                        )}
                      </div>
                    ) : false}
                    {' '}
                    {props.type !== 'group' ? (
                      <div className="profile-stats-item">
                        <Link to={`/${props.username}`}>{pluralForm(props.statistics.posts, 'post')}</Link>
                      </div>
                    ) : false}
                    {' '}
                    {props.type !== 'group' ? (
                      <div className="profile-stats-item">
                        <Link to={`/${props.username}/comments`}>{pluralForm(props.statistics.comments, 'comment')}</Link>
                      </div>
                    ) : false}
                    {' '}
                    {props.type !== 'group' ? (
                      <div className="profile-stats-item">
                        <Link to={`/${props.username}/likes`}>{pluralForm(props.statistics.likes, 'like')}</Link>
                      </div>
                    ) : false}
                  </div>
                </div>
              ) : false}
            </div>
          </div>
        )}

        {props.showProfileControls ? (
          <div className="profile-controls">
            {props.amISubscribedToUser && props.isUserSubscribedToMe ? (
              <span><Link to={`/filter/direct?to=${props.username}`}>Direct message</Link> - </span>
            ) : false}

            {props.isPrivate === '1' && !props.amISubscribedToUser ? (
              props.hasRequestBeenSent ? (
                <span>
                  <span className="text"><b>{props.screenName}</b> has been sent your subscription request</span>
                  {' - '}
                  {props.userView.isSubscribing ? 'Revoking...' : <a onClick={()=>props.revokeSentRequest({username: props.username, id: props.id})}>Revoke request</a>}
                </span>
              ) : (
                props.userView.isSubscribing ? 'Requesting...' : <a onClick={()=>props.sendSubscriptionRequest({username: props.username, id: props.id})}>Request a subscription</a>
              )
            ) : (
              props.amISubscribedToUser ? (
                props.userView.isSubscribing ? 'Unsubscribing...' : <a onClick={confirmFirst(unsubscribe)}>Unsubscribe</a>
              ) : (
                props.userView.isSubscribing ? 'Subscribing...' : <a onClick={()=>props.subscribe({username: props.username, id: props.id})}>Subscribe</a>
              )
            )}

            {props.userView.isSubscribing ? (
              <span className="profile-controls-throbber">
                <img width="16" height="16" src={throbber16}/>
              </span>
            ) : false}

            {props.type !== 'group' && !props.amISubscribedToUser ? (
              props.userView.isBlocking ? ' - Blocking...' : <span> - <a onClick={preventDefault(_=>props.ban({username: props.username, id: props.id}))}>Block this user</a></span>
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

            {this.state.isUnsubWarningDisplayed ? (
              <div className="alert alert-warning">
                You are the Admin for this group. If you want to unsubscribe please drop administrative privileges first
                at <Link to={`/${props.username}/manage-subscribers`}>manage subscribers</Link> page
              </div>
            ) : false}
          </div>
        ) : false}

        {props.canIPostHere ? (
          <PostCreateForm
            sendTo={props.sendTo}
            user={props.user}
            createPost={props.createPost}
            resetPostCreateForm={props.resetPostCreateForm}
            createPostForm={props.createPostForm}
            addAttachmentResponse={props.addAttachmentResponse}
            removeAttachment={props.removeAttachment}/>
        ) : false}
      </div>
    );
  }
}
