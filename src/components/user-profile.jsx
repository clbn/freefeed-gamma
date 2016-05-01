import React from 'react';
import {Link} from 'react-router';

import {preventDefault, pluralForm} from '../utils';
import CreatePost from './create-post';
import PieceOfText from './piece-of-text';

export default class UserProfile extends React.Component {
  constructor(props) {
    super(props);
    this.state = { isUnsubWarningDisplayed: false };
  }

  componentWillReceiveProps = (newProps) => {
    this.setState({ isUnsubWarningDisplayed: false });
  }

  render() {
    let props = this.props;

    const unsubscribe = () => {
      if (props.amIGroupAdmin) {
        this.setState({ isUnsubWarningDisplayed: true });
      } else {
        props.unsubscribe({ username: props.username });
      }
    };

    return (
      <div>
        {!props.isLoading && !props.isUserFound ? (
          <h2>404 Not Found</h2>
        ) : (
          <div className="profile">
            <div className="row">
              <div className="col-sm-9 col-xs-12">
                {props.isLoading && !props.profilePictureLargeUrl ? (
                  <div className="userpic loading"></div>
                ) : (
                  <div className="userpic">
                    <img src={props.profilePictureLargeUrl} width="75" height="75"/>
                  </div>
                )}

                {props.isLoading && !props.screenName ? (
                  <div className="description">
                    <div className="name loading">{props.requestedUsername}</div>
                  </div>
                ) : (
                  <div className="description">
                    <div className="name">{props.screenName}</div>
                    <PieceOfText text={props.description}/>
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
                {props.isPrivate === '1' && !props.subscribed ? (
                  props.hasRequestBeenSent ? (
                    <span><b>{props.screenName}</b> has been sent your subscription request.</span>
                  ) : (
                    <a onClick={()=>props.sendSubscriptionRequest({username: props.username, id: props.id})}>Request a subscription</a>
                  )
                ) : (
                  props.subscribed ? (
                    <a onClick={unsubscribe}>Unsubscribe</a>
                  ) : (
                    <a onClick={()=>props.subscribe({username: props.username})}>Subscribe</a>
                  )
                )}
              </div>
              <div className="col-xs-5 col-sm-3 text-right">
                {props.type !== 'group' && !props.subscribed ? (
                  <a onClick={preventDefault(_=>props.ban({username: props.username, id: props.id}))}>Block this user</a>
                ) : props.amIGroupAdmin ? (
                  <Link to={`/${props.username}/settings`}>Settings</Link>
                ) : false}
              </div>
            </div>
            {this.state.isUnsubWarningDisplayed ? (
              <div className="row">
                <div className="col-xs-12">
                  <p className="group-warning">
                    You are the Admin for this group. If you want to unsubscribe please drop administrative privileges first
                    at <Link to={`/${props.username}/manage-subscribers`}>manage subscribers</Link> page
                  </p>
                </div>
              </div>
            ) : false} 
          </div>
        ) : false}

        {props.canIPostHere ? (
          <CreatePost
            createPostViewState={props.createPostViewState}
            sendTo={props.sendTo}
            user={props.user}
            createPost={props.createPost}
            resetPostCreateForm={props.resetPostCreateForm}
            expandSendTo={props.expandSendTo}
            createPostForm={props.createPostForm}
            addAttachmentResponse={props.addAttachmentResponse}
            removeAttachment={props.removeAttachment}/>
        ) : false}
      </div>
    );
  }
}
