import React from 'react';
import {Link} from 'react-router';
import {connect} from 'react-redux';
import moment from 'moment';
import classnames from 'classnames';

import {postActions} from '../../redux/select-utils';
import {fromNowOrNow, getFullDate} from '../../utils';
import PostAttachments from './post-attachments';
import PostComments from './post-comments';
import PostLikes from './post-likes';
import UserName from './user-name';
import PieceOfText from './piece-of-text';
import Textarea from 'react-textarea-autosize';
import throbber16 from 'assets/images/throbber-16.gif';
import PostDropzone from './post-dropzone';
import PostMoreMenu from './post-more-menu';

class Post extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasUploadFailed: false,
      attachmentQueueLength: 0
    };
  }

  removeAttachment = (attachmentId) => this.props.removeAttachment(this.props.id, attachmentId)

  render() {
    let _this = this;
    let props = this.props;

    const createdAtISO = moment(+props.createdAt).format();
    const createdAtHuman = getFullDate(+props.createdAt);
    const createdAgo = fromNowOrNow(+props.createdAt);

    const toggleEditingPost = () => props.toggleEditingPost(props.id);
    const cancelEditingPost = () => props.cancelEditingPost(props.id);
    const saveEditingPost = () => {
      if (!props.isSaving) {
        let attachmentIds = props.attachments.map(item => item.id) || [];
        props.saveEditingPost(props.id, {body: this.refs.postText.value, attachments: attachmentIds});
      }
    };
    const deletePost = () => props.deletePost(props.id);

    const toggleCommenting = () => props.toggleCommenting(props.id);
    const likePost = () => props.likePost(props.id, props.user.id);
    const unlikePost = () => props.unlikePost(props.id, props.user.id);

    const hidePost = () => props.hidePost(props.id);
    const unhidePost = () => props.unhidePost(props.id);

    const toggleModeratingComments = () => props.toggleModeratingComments(props.id);

    const disableComments = () => props.disableComments(props.id);
    const enableComments = () => props.enableComments(props.id);

    const checkSave = (event) => {
      const isEnter = event.keyCode === 13;
      if (isEnter) {
        event.preventDefault();
        if (this.state.attachmentQueueLength === 0) {
          saveEditingPost();
        }
      }
    };

    // Post class(es)
    const postClasses = classnames({
      'post': true,
      'single-post': props.isSinglePost,
      'timeline-post': !props.isSinglePost,
      'direct-post': props.isDirect
    });

    // Userpics(s)
    // 1. Primary userpic
    const primaryUserpicClasses = classnames({
      'userpic': true,
      'userpic-large': props.isSinglePost
    });
    const userpicImage = (props.isSinglePost ? props.createdBy.profilePictureLargeUrl : props.createdBy.profilePictureMediumUrl);
    const userpicSize = (props.isSinglePost ? 75 : 50);
    const primaryUserpic = (
      <div className={primaryUserpicClasses}>
        <Link to={`/${props.createdBy.username}`}>
          <img src={userpicImage} width={userpicSize} height={userpicSize}/>
        </Link>
      </div>
    );
    // 2. Secondary userpics
    const secondaryUserpicClasses = classnames({
      'userpic': true,
      'userpic-secondary': true,
      'userpic-large': props.isSinglePost
    });
    const externalRecipients = props.recipients.filter((recipient) => (recipient.id !== props.createdBy.id));
    const hasSecondaryUserpics = (externalRecipients.length > 0);
    const secondaryUserpicSize = (props.isSinglePost ? 50 : 33);
    const secondaryUserpicInterval = (props.isSinglePost ? 9 : 6);
    const getSecondaryOffset = (index) => (userpicSize + secondaryUserpicInterval + index * (secondaryUserpicSize + secondaryUserpicInterval));
    const secondaryUserpics = externalRecipients.map((recipient, index) => (
      <div className={secondaryUserpicClasses} style={{top: getSecondaryOffset(index) + 'px'}} key={index}>
        <Link to={`/${recipient.username}`}>
          <img src={recipient.profilePictureMediumUrl} width={secondaryUserpicSize} height={secondaryUserpicSize}/>
        </Link>
      </div>
    ));
    // 3. Userpics container
    const userpicClasses = classnames({
      'post-userpic': true,
      'has-secondary': hasSecondaryUserpics
    });
    const userpicStyle = {height: getSecondaryOffset(secondaryUserpics.length) - 3};

    // Recipients
    const recipientCustomDisplay = function(recipient) {
      if (recipient.id !== props.createdBy.id) {
        return false;
      }
      if (recipient.username[recipient.username.length - 1] === 's') {
        return recipient.username + "' feed";
      } else {
        return recipient.username + "'s feed";
      }
    };

    let recipients = props.recipients;
    // Check if the post has been only submitted to one recipient
    // and if we can omit it
    if (recipients.length === 1) {
      // If the post is in user/group feed (one-source list), we should omit
      // the only recipient, since it would be that feed.
      if (props.isInUserPostFeed) {
        recipients = [];
      } else {
        // When in a many-sources list (Home, Direct messages, My discussions),
        // we should omit the only recipient if it's the author's feed.
        if (recipients[0].id === props.createdBy.id) {
          recipients = [];
        }
      }
    }
    recipients = recipients.map((recipient, index) => (
      <span key={index}>
        <UserName
          className="post-recipient"
          user={recipient}
          display={recipientCustomDisplay(recipient)}/>
        {index < props.recipients.length - 2 ? ', ' : false}
        {index === props.recipients.length - 2 ? ' and ' : false}
      </span>
    ));

    // DropzoneJS queue handlers
    const handleAddedFile = () => {
      this.setState({attachmentQueueLength: this.state.attachmentQueueLength + 1});
    };
    const handleRemovedFile = () => {
      if (this.state.attachmentQueueLength === 1) {
        this.setState({hasUploadFailed: false});
      }
      this.setState({attachmentQueueLength: this.state.attachmentQueueLength - 1});
    };
    const handleUploadSuccess = (attachment) => (
      this.props.addAttachmentResponse(props.id, attachment)
    );
    const handleUploadFailure = () => {
      this.setState({hasUploadFailed: true});
    };

    // "Lock icon": check if the post is truly private, "partly private" or public.
    // Truly private:
    // - posted to author's own private feed and/or
    // - sent to users as a direct message and/or
    // - posted into private groups
    // Public:
    // - posted to author's own public feed and/or
    // - posted into public groups
    // "Partly private":
    // - has mix of private and public recipients
    const publicRecipients = props.recipients.filter((recipient) => (
      recipient.isPrivate === '0' &&
      (recipient.id === props.createdBy.id || recipient.type === 'group')
    ));
    const isReallyPrivate = (publicRecipients.length === 0);

    // Post URL
    // Primary recipient feed: used as part of canonical post URL.
    // If all the recipients are groups (so it's not sent to author's feed,
    // or to some user as a direct message), use the first group as primary recipient.
    // Otherwise, use author's feed.
    let primaryRecipient = props.createdBy;
    if (props.recipients.every((recipient) => recipient.type === 'group')) {
      primaryRecipient = props.recipients[0];
    }
    const postUrl = `/${primaryRecipient.username}/${props.id}`;

    // "Comment" / "Comments disabled"
    let commentLink;
    if (props.commentsDisabled) {
      if (props.isEditable) {
        commentLink = (
          <span>
            {' - '}
            <i>Comments disabled (not for you)</i>
            {' - '}
            <a onClick={toggleCommenting}>Comment</a>
          </span>
        );
      } else {
        commentLink = (
          <span>
            {' - '}
            <i>Comments disabled</i>
          </span>
        );
      }
    } else {
      commentLink = (
        <span>
          {' - '}
          <a onClick={toggleCommenting}>Comment</a>
        </span>
      );
    }

    // "Like" / "Un-like"
    const amIAuthenticated = !!props.user.id;
    const didILikePost = _.find(props.usersLikedPost, {id: props.user.id});
    const likeLink = (amIAuthenticated && !props.isEditable ? (
      <span>
        {' - '}
        <a onClick={didILikePost ? unlikePost : likePost}>{didILikePost ? 'Un-like' : 'Like'}</a>
        {props.isLiking ? (
          <span className="post-like-throbber">
            <img width="16" height="16" src={throbber16}/>
          </span>
        ) : false}
      </span>
    ) : false);

    // "Hide" / "Un-hide"
    const hideLink = (props.isInHomeFeed ? (
      <span>
        {' - '}
        <a onClick={props.isHidden ? unhidePost : hidePost}>{props.isHidden ? 'Un-hide' : 'Hide'}</a>
        {props.isHiding ? (
          <span className="post-hide-throbber">
            <img width="16" height="16" src={throbber16}/>
          </span>
        ) : false}
      </span>
    ) : false);

    // "More" menu
    const moreLink = (props.isEditable ? (
      <span>
        {' - '}
        <PostMoreMenu
          post={props}
          toggleEditingPost={toggleEditingPost}
          toggleModeratingComments={toggleModeratingComments}
          disableComments={disableComments}
          enableComments={enableComments}
          deletePost={deletePost}/>
      </span>
    ) : false);

    return (props.isRecentlyHidden ? (
      <div className="post recently-hidden-post">
        <i>Entry hidden - </i>
        <a onClick={unhidePost}>undo</a>.
        {' '}
        {props.isHiding ? (
          <span className="post-hide-throbber">
            <img width="16" height="16" src={throbber16}/>
          </span>
        ) : false}
      </div>
    ) : (
      <div className={postClasses}>
        <div className={userpicClasses} style={userpicStyle}>
          {primaryUserpic}
          {secondaryUserpics}
        </div>

        <div className="post-top">
          <div className="post-header">
            <UserName className="post-author" user={props.createdBy}/>
            {recipients.length > 0 ? ' to ' : false}
            {recipients}
          </div>

          {props.isEditing ? (
            <div className="post-editor">
              <PostDropzone
                onAddedFile={handleAddedFile}
                onRemovedFile={handleRemovedFile}
                onUploadSuccess={handleUploadSuccess}
                onUploadFailure={handleUploadFailure}/>

              <div>
                <Textarea
                  ref="postText"
                  className="post-textarea"
                  defaultValue={props.body}
                  autoFocus={true}
                  onKeyDown={checkSave}
                  minRows={3}
                  maxRows={10}
                  maxLength="1500"/>
              </div>

              <div className="post-edit-options">
                <span className="post-edit-attachments dropzone-trigger">
                  <i className="fa fa-cloud-upload"></i>
                  {' '}
                  Add photos or files
                </span>
              </div>

              <div className="post-edit-actions">
                {props.isSaving ? (
                  <span className="post-edit-throbber">
                    <img width="16" height="16" src={throbber16}/>
                  </span>
                ) : false}
                <a className="post-cancel" onClick={cancelEditingPost}>Cancel</a>
                <button className="btn btn-default btn-xs"
                  onClick={saveEditingPost}
                  disabled={this.state.attachmentQueueLength > 0}>Update</button>
              </div>

              {this.state.hasUploadFailed ? (
                <div className="post-error alert alert-warning" role="alert">
                  Some files have failed to upload. You'll need to remove them from the queue to submit the post.
                </div>
              ) : false}

              {!props.isSaving && props.errorMessage ? (
                <div className="post-error alert alert-danger" role="alert">
                  Post has not been saved. Server response: "{props.errorMessage}"
                </div>
              ) : false}
            </div>
          ) : (
            <div className="post-text">
              <PieceOfText text={props.body}/>
            </div>
          )}
        </div>

        <div className="post-bottom">
          <PostAttachments
            attachments={props.attachments}
            isEditing={props.isEditing}
            removeAttachment={this.removeAttachment}/>

          <div className="dropzone-previews"></div>

          <div className="post-footer">
            {isReallyPrivate ? (
              <i className="post-lock-icon fa fa-lock" title="This entry is private"></i>
            ) : false}
            {props.isDirect ? (<span>»&nbsp;</span>) : false}
            <Link to={postUrl} className="post-timestamp">
              <time dateTime={createdAtISO} title={createdAtHuman}>{createdAgo}</time>
            </Link>
            {commentLink}
            {likeLink}
            {hideLink}
            {moreLink}
          </div>

          <PostLikes
            post={props}
            likes={props.usersLikedPost}
            showMoreLikes={props.showMoreLikes}/>

          <PostComments
            post={props}
            postUrl={postUrl}
            comments={props.comments}
            addComment={props.addComment}
            toggleCommenting={toggleCommenting}
            showMoreComments={props.showMoreComments}
            commentEdit={props.commentEdit}/>
        </div>
      </div>
    ));
  }
}

function mapDispatchToProps(dispatch) {
  return {
    ...postActions(dispatch)
  };
}

export default connect(()=>({}), mapDispatchToProps)(Post);
