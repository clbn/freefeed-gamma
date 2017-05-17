import React from 'react';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import Textarea from 'react-textarea-autosize';
import classnames from 'classnames';

import { makeGetPostComment } from '../../redux/selectors';
import PieceOfText from './piece-of-text';
import UserName from './user-name';
import { preventDefault, confirmFirst, getISODate, getFullDate, getRelativeDate } from '../../utils';
import { postActions } from '../../redux/select-utils';
import * as CommentTypes from '../../utils/comment-types';
import ARCHIVE_WATERSHED_TIMESTAMP from '../../utils/archive-timestamps';
import throbber16 from 'assets/images/throbber-16.gif';

class PostComment extends React.Component {
  refCommentContainer = (element) => {
    this.commentContainer = element;
  };

  refCommentText = (input) => {
    this.commentText = input;
  };

  openAnsweringComment = () => {
    if (this.props.openAnsweringComment) {
      this.props.openAnsweringComment(this.props.createdBy.username);
    }
  };

  checkSave = (event) => {
    const isEnter = event.keyCode === 13;
    const isShiftPressed = event.shiftKey;
    if (isEnter && !isShiftPressed) {
      event.preventDefault();
      setTimeout(this.saveComment, 0);
    }
  };

  saveComment = () => {
    if (!this.props.isSaving) {
      this.props.saveEditingComment(this.props.id, this.commentText.value);
    }
  };

  userHoverHandlers = {
    hover: (username) => this.props.startHighlightingComments({ postId: this.props.postId, username }),
    leave: () => this.props.stopHighlightingComments()
  };

  arrowHoverHandlers = {
    hover: (arrows) => this.props.startHighlightingComments({ postId: this.props.postId, baseCommentId: this.props.id, arrows }),
    leave: () => this.props.stopHighlightingComments()
  };

  getCommentPlaceholder = () => {
    switch (this.props.hideType) {
      case CommentTypes.COMMENT_HIDDEN_BANNED: return 'Comment from banned';
      case CommentTypes.COMMENT_HIDDEN_ARCHIVED: return 'Comment in archive';
    }
    return this.props.body;
  };

  scrollToTargeted = () => {
    if (this.props.isTargeted) {
      setTimeout(() => {
        if (this.commentContainer) {
          this.commentContainer.scrollIntoView();
        }
      }, 0);
    }
  };

  componentDidMount() {
    this.scrollToTargeted();
  }

  render() {
    if (this.props.notFound) {
      return false;
    }

    const isCommentSpecial = this.props.isEditable || this.props.amISubscribedToAuthor;

    const commentClasses = classnames({
      'comment': true,
      'comment-from-archive': (+this.props.createdAt < ARCHIVE_WATERSHED_TIMESTAMP),
      'hidden-comment': !!this.props.hideType,
      'highlighted': this.props.isHighlighted,
      'targeted-comment': this.props.isTargeted
    });

    const iconClasses = classnames({
      'comment-icon': true,
      'comment-icon-special': isCommentSpecial,
      'fa-stack': true
    });

    const commentPlaceholderText = this.getCommentPlaceholder();

    const dateISO = getISODate(+this.props.createdAt);
    const dateFull = getFullDate(+this.props.createdAt);
    const dateRelative = getRelativeDate(+this.props.createdAt);
    const dateRelativeShort = getRelativeDate(+this.props.createdAt, false);

    return (
      <div className={commentClasses} id={`comment-${this.props.id}`} ref={this.refCommentContainer}>
        <a className={iconClasses}
           title={dateRelative + '\n' + dateFull}
           href={`${this.props.postUrl}#comment-${this.props.id}`}
           onClick={preventDefault(this.openAnsweringComment)}>
          <i className="fa fa-comment fa-stack-1x"></i>
          <i className="fa fa-comment-o fa-stack-1x"></i>
        </a>

        {this.props.hideType ? (
          <div className="comment-body">
            {commentPlaceholderText}

            {dateRelativeShort ? (
              <span className="comment-timestamp">
                {' - '}
                <Link to={`${this.props.postUrl}#comment-${this.props.id}`} dir="auto">
                  <time dateTime={dateISO} title={dateFull}>{dateRelativeShort}</time>
                </Link>
              </span>
            ) : false}
          </div>
        ) : this.props.isEditing ? (
          <div className="comment-body">
            <div>
              <Textarea
                ref={this.refCommentText}
                className="form-control comment-textarea"
                defaultValue={this.props.body}
                autoFocus={true}
                onKeyDown={this.checkSave}
                minRows={2}
                maxRows={10}
                maxLength="1500"/>
            </div>
            <span>
              <button className="btn btn-default btn-xs comment-post" onClick={this.saveComment}>Post</button>
              <a className="comment-cancel" onClick={preventDefault(_=>this.props.toggleEditingComment(this.props.id))}>Cancel</a>
            </span>
            {this.props.isSaving ? (
              <span className="comment-throbber">
                <img width="16" height="16" src={throbber16}/>
              </span>
            ) : this.props.errorMessage ? (
              <div className="comment-error alert alert-danger" role="alert">
                Comment has not been saved. Server response: "{this.props.errorMessage}"
              </div>
            ) : false}
          </div>
        ) : (
          <div className="comment-body">
            <PieceOfText
              text={this.props.body}
              userHover={this.userHoverHandlers}
              arrowHover={this.arrowHoverHandlers}/>

            {' -'}&nbsp;

            <UserName user={this.props.createdBy}/>
            {this.props.isEditable ? (
              <span>
                {' '}(<a onClick={preventDefault(_=>this.props.toggleEditingComment(this.props.id))}>edit</a>
                &nbsp;|&nbsp;
                <a onClick={confirmFirst(_=>this.props.deleteComment(this.props.id))}>delete</a>)
              </span>
            ) : (this.props.isDeletable && this.props.isModeratingComments) ? (
              <span>
                {' '}(<a onClick={confirmFirst(_=>this.props.deleteComment(this.props.id))}>delete</a>)
              </span>
            ) : false}

            {dateRelativeShort ? (
              <span className="comment-timestamp">
                {' - '}
                <Link to={`${this.props.postUrl}#comment-${this.props.id}`} dir="auto">
                  <time dateTime={dateISO} title={dateFull}>{dateRelativeShort}</time>
                </Link>
              </span>
            ) : false}
          </div>
        )}
      </div>
    );
  }
}

function makeMapStateToProps() {
  const getPostComment = makeGetPostComment();

  return (state, ownProps) => {
    return {
      ...getPostComment(state, ownProps)
    };
  };
}

function mapDispatchToProps(dispatch) {
  return {
    ...postActions(dispatch).commentEdit
  };
}

export default connect(makeMapStateToProps, mapDispatchToProps)(PostComment);
