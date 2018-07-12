import React from 'react';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import classnames from 'classnames';
import _ from 'lodash';

import { makeGetPost } from '../../redux/selectors';
import { postActions } from '../../redux/select-utils';
import { getISODate, getRelativeDate, getFullDate } from '../../utils';
import PostAttachments from './post-attachments';
import PostComments from './post-comments';
import PostLikes from './post-likes';
import UserName from './user-name';
import PieceOfText from './piece-of-text';
import Textarea from 'react-textarea-autosize';
import throbber16 from 'assets/images/throbber-16.gif';
import PostDropzone from './post-dropzone';
import PostMoreMenu from './post-more-menu';
import PostVisibilityIcon from './post-visibility-icon';
import Icon from "./icon";

class Post extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      transientAttachments: [], // for attachments during editing process, before the changes are permanent
      hasUploadFailed: false,
      attachmentQueueLength: 0
    };
  }

  refPostText = (input) => {
    this.postText = input;
  };

  handleDropzoneInit = (d) => {
    this.dropzoneObject = d;
  };

  handlePaste = (e) => {
    if (e.clipboardData) {
      const items = e.clipboardData.items;
      if (items) {
        for (let i = 0; i < items.length; i++) {
          if (items[i].type.indexOf('image/') > -1) {
            const blob = items[i].getAsFile();
            if (!blob.name) {
              blob.name = 'image.png';
            }
            this.dropzoneObject.addFile(blob);
          }
        }
      }
    }
  };

  getAttachments = () => {
    if (!this.props.isEditing) {
      return this.props.attachments;
    }

    // Without pre-sorting, indexes of sortable images might be different from their apparent positions.
    //
    // For example: for [image, image, audio, audio, image], a user won't be able to move the last image,
    // because Sortable will move item with index 2, while the component that operates with all the attachments
    // will move the first audio for that index.
    //
    // With pre-sorting transientAttachments, we make sure that "global" and "local" image indexes are the same.

    const mt = { image: 0, audio: 1, general: 2 };

    return _.sortBy(this.state.transientAttachments, (a) => mt[a.mediaType]);
  };

  updateTransientAttachments = (attachments) => {
    this.setState({
      transientAttachments: attachments
    });
  };

  componentDidUpdate(prevProps) {
    // Set transient attachments when starting editing
    if (!prevProps.isEditing && this.props.isEditing) {
      this.updateTransientAttachments(this.props.attachments);
    }

    // Sync attachment edits when adding items
    // (Because adding goes through Redux store now. TODO: make it work via local state as reorder/remove does.)
    if ((prevProps.attachments !== this.props.attachments) && this.props.isEditing) {
      const addedAttachments = _.differenceWith(this.props.attachments, prevProps.attachments, (a, b) => (a.id === b.id));
      const newAttachments = this.getAttachments().concat(addedAttachments) || [];
      this.updateTransientAttachments(newAttachments);
    }
  }

  render() {
    let props = this.props;

    const dateISO = getISODate(+props.createdAt);
    const dateFull = getFullDate(+props.createdAt);
    const dateRelative = getRelativeDate(+props.createdAt);

    const toggleEditingPost = () => props.toggleEditingPost(props.id);
    const cancelEditingPost = () => props.cancelEditingPost(props.id);
    const saveEditingPost = () => {
      if (!props.isSaving) {
        let attachmentIds = this.getAttachments().map(item => item.id);
        props.saveEditingPost(props.id, { body: this.postText.value, attachments: attachmentIds });
      }
    };
    const deletePost = () => props.deletePost(props.id);

    const toggleCommenting = () => props.toggleCommenting(props.id);
    const likePost = () => props.likePost(props.id, props.myId);
    const unlikePost = () => props.unlikePost(props.id, props.myId);

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
      'direct-post': props.isDirect,
      'post-from-archive': props.isArchive
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
      <div className={secondaryUserpicClasses} style={{ top: getSecondaryOffset(index) + 'px' }} key={index}>
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
    const userpicStyle = { height: getSecondaryOffset(secondaryUserpics.length) - 3 };

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
      this.setState({ attachmentQueueLength: this.state.attachmentQueueLength + 1 });
    };
    const handleRemovedFile = () => {
      if (this.state.attachmentQueueLength === 1) {
        this.setState({ hasUploadFailed: false });
      }
      this.setState({ attachmentQueueLength: this.state.attachmentQueueLength - 1 });
    };
    const handleUploadSuccess = (attachment) => (
      this.props.addAttachmentResponse(props.id, attachment)
    );
    const handleUploadFailure = () => {
      this.setState({ hasUploadFailed: true });
    };

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
      if (props.canIEdit) {
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
    const likeLink = (props.canILike ? (
      <span>
        {' - '}
        {props.haveILiked ? (
          <a onClick={unlikePost}>Un-like</a>
        ) : (
          <a onClick={likePost}>Like</a>
        )}
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
    const moreLink = (props.canIEdit ? (
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

        {props.isArchive ? (
          <Icon name="archive" title="Post from FriendFeed archive" className="post-archive-marker"/>
        ) : props.isDirect ? (
          <Icon
            name={'envelope' + (props.isSinglePost ? '-open' : '') + '-o'}
            title="Direct message"
            className="post-direct-marker"/>
        ) : false}

        <div className="post-top">
          <div className="post-header">
            <UserName className="post-author" user={props.createdBy}/>
            {recipients.length > 0 ? ' to ' : false}
            {recipients}
          </div>

          {props.isEditing ? (
            <div className="post-editor">
              <PostDropzone
                onInit={this.handleDropzoneInit}
                onAddedFile={handleAddedFile}
                onRemovedFile={handleRemovedFile}
                onUploadSuccess={handleUploadSuccess}
                onUploadFailure={handleUploadFailure}/>

              <div>
                <Textarea
                  inputRef={this.refPostText}
                  className="form-control post-textarea"
                  defaultValue={props.body}
                  autoFocus={true}
                  onKeyDown={checkSave}
                  onPaste={this.handlePaste}
                  minRows={3}
                  maxRows={10}
                  maxLength="1500"/>
              </div>

              <div className="post-edit-options">
                <span className="post-edit-attachments dropzone-trigger">
                  <Icon name="cloud-upload"/>
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
              <PieceOfText text={props.body} isExpanded={props.isSinglePost}/>
            </div>
          )}
        </div>

        <div className="post-bottom">
          <PostAttachments
            attachments={this.getAttachments()}
            isEditing={props.isEditing}
            update={this.updateTransientAttachments}/>

          <div className="dropzone-previews"></div>

          <div className="post-footer">
            <PostVisibilityIcon recipients={props.recipients} authorId={props.createdBy.id}/>

            <Link to={postUrl} className="post-timestamp">
              <time dateTime={dateISO} title={dateFull}>{dateRelative}</time>
            </Link>

            {commentLink}
            {likeLink}
            {hideLink}
            {moreLink}
          </div>

          <PostLikes postId={props.id}/>

          <PostComments
            postId={props.id}
            postUrl={postUrl}
            isSinglePost={props.isSinglePost}/>
        </div>
      </div>
    ));
  }
}

function makeMapStateToProps() {
  // To share a selector across multiple Post components while passing in props
  // and retaining memoization, each instance of the component needs its own
  // private copy of the selector. If the mapStateToProps argument supplied to
  // connect returns a function instead of an object, it will be used to create
  // an individual mapStateToProps function for each instance of the container
  // (this works in React Redux v4.3 or higher).
  // See https://github.com/reactjs/reselect#sharing-selectors-with-props-across-multiple-components

  const getPost = makeGetPost();

  return (state, ownProps) => {
    return {
      ...getPost(state, ownProps)
    };
  };
}

function mapDispatchToProps(dispatch) {
  return {
    ...postActions(dispatch)
  };
}

export default connect(makeMapStateToProps, mapDispatchToProps)(Post);
