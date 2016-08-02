import React from 'react';
import {Link} from 'react-router';

import {confirmFirst, preventDefault, pluralForm} from '../utils';
import CreatePost from './create-post';
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
                  <div className="userpic userpic-large">
                    <img src={props.profilePictureLargeUrl} width="75" height="75"/>
                  </div>
                )}

                {props.isLoading && !props.screenName ? (
                  <div className="profile-displayname profile-loading">@{props.requestedUsername}</div>
                ) : (
                  <div>
                    <div className="profile-displayname">{props.screenName}</div>

                    {props.screenName !== props.username ? (
                      <div className="profile-username">@{props.username}</div>
                    ) : false}

                    {props.description ? (
                      <div className="profile-description">
                        <PieceOfText text={props.description} isExpanded={true}/>
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

        {props.authenticated && props.isUserFound && !props.isItMe && !props.blocked ? (
          <div className="profile-controls">
            <div className="row">
              <div className="col-xs-7 col-sm-9 subscribe-controls">
                {props.amISubscribedToUser && props.isUserSubscribedToMe ? (
                  <span><Link to={`/filter/direct?to=${props.username}`}>Direct message</Link> - </span>
                ) : false}

                {props.isPrivate === '1' && !props.amISubscribedToUser ? (
                  props.hasRequestBeenSent ? (
                    <span>
                      <b>{props.screenName}</b> has been sent your subscription request.
                      {' '}
                      <a onClick={()=>props.revokeSentRequest({username: props.username, id: props.id})}>Revoke</a>
                    </span>
                  ) : (
                    <a onClick={()=>props.sendSubscriptionRequest({username: props.username, id: props.id})}>Request a subscription</a>
                  )
                ) : (
                  props.amISubscribedToUser ? (
                    <a onClick={confirmFirst(unsubscribe)}>Unsubscribe</a>
                  ) : (
                    <a onClick={()=>props.subscribe({username: props.username, id: props.id})}>Subscribe</a>
                  )
                )}

                {props.userView.isSubscribing ? (
                  <span className="profile-controls-throbber">
                    <img width="16" height="16" src={throbber16}/>
                  </span>
                ) : false}
              </div>
              <div className="col-xs-5 col-sm-3 text-right">
                {props.userView.isBlocking ? (
                  <span className="profile-controls-throbber">
                    <img width="16" height="16" src={throbber16}/>
                  </span>
                ) : false}

                {props.type !== 'group' && !props.amISubscribedToUser ? (
                  <a onClick={preventDefault(_=>props.ban({username: props.username, id: props.id}))}>Block this user</a>
                ) : props.amIGroupAdmin ? (
                  <Link to={`/${props.username}/settings`}>Settings</Link>
                ) : false}
              </div>
            </div>

            {this.state.isUnsubWarningDisplayed ? (
              <div className="row">
                <div className="col-xs-12">
                  <div className="alert alert-warning">
                    You are the Admin for this group. If you want to unsubscribe please drop administrative privileges first
                    at <Link to={`/${props.username}/manage-subscribers`}>manage subscribers</Link> page
                  </div>
                </div>
              </div>
            ) : false} 
          </div>
        ) : false}

        {props.canIPostHere ? (
          <CreatePost
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
