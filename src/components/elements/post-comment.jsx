import React from 'react';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import Textarea from 'react-textarea-autosize';
import classnames from 'classnames';

import { makeGetPostComment } from '../../redux/selectors';
import PieceOfText from './piece-of-text';
import UserName from './user-name';
import PostCommentLikes from './post-comment-likes';
import Icon from "./icon";
import { preventDefault, confirmFirst, getISODate, getFullDate, getRelativeDate } from '../../utils';
import { postActions } from '../../redux/select-utils';
import * as CommentTypes from '../../utils/comment-types';
import ARCHIVE_WATERSHED_TIMESTAMP from '../../utils/archive-timestamps';
import throbber16 from 'assets/images/throbber-16.gif';

class PostComment extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isExpanded: false
    };
  }

  refCommentContainer = (element) => {
    this.commentContainer = element;
  };

  refCommentText = (input) => {
    this.commentText = input;
  };

  typedArrows = []; // Array of arrows (^^^) lengths, that user typing in the textarea

  toggleEditing = () => {
    this.props.toggleEditingComment(this.props.id);
    this.props.updateHighlightedComments();
    this.typedArrows = [];
  };

  deleteAfterConfirmation = confirmFirst(() => this.props.deleteComment(this.props.id));

  openAnsweringComment = () => {
    if (this.props.openAnsweringComment) {
      this.props.openAnsweringComment(this.props.authorUsername);
    }
  };

  handleKeyDown = (event) => {
    const enterPressed = (event.keyCode === 13);
    const shiftPressed = event.shiftKey;
    if (enterPressed && !shiftPressed) {
      event.preventDefault();
      setTimeout(this.saveComment, 0);
    }
  };

  handleChangeText = () => {
    const arrowsFound = this.commentText.value.match(/\^+/g);
    const arrows = (arrowsFound ? arrowsFound.map(a => a.length) : []);

    if (this.typedArrows.length !== arrows.length || !this.typedArrows.every((v, i) => (v === arrows[i]))) { // just comparing two arrays
      this.typedArrows = arrows;
      if (arrows.length > 0) {
        this.props.updateHighlightedComments({ reason: 'hover-arrows', postId: this.props.postId, baseCommentId: this.props.id, arrows });
      } else {
        this.props.updateHighlightedComments();
      }
    }
  };

  saveComment = () => {
    if (!this.props.isSaving) {
      this.props.saveEditingComment(this.props.id, this.commentText.value);

      this.props.updateHighlightedComments();
      this.typedArrows = [];

      this.setState({ isExpanded: true });
    }
  };

  userHoverHandlers = {
    hover: (username) => this.props.updateHighlightedComments({ reason: 'hover-author', postId: this.props.postId, username }),
    leave: () => this.props.updateHighlightedComments()
  };

  arrowHoverHandlers = {
    click: (arrows) => this.props.updateHighlightedComments({ reason: 'click-arrows', postId: this.props.postId, baseCommentId: this.props.id, arrows }),
    hover: (arrows) => this.props.updateHighlightedComments({ reason: 'hover-arrows', postId: this.props.postId, baseCommentId: this.props.id, arrows }),
    leave: () => this.props.updateHighlightedComments()
  };

  getCommentPlaceholder = () => {
    switch (this.props.hideType) {
      case CommentTypes.COMMENT_HIDDEN_BANNED: return 'Comment from banned';
      case CommentTypes.COMMENT_HIDDEN_ARCHIVED: return 'Comment in archive';
    }
    return this.props.body;
  };

  scrollToComment = () => {
    if (this.commentContainer) {
      const rect = this.commentContainer.getBoundingClientRect();
      const middleScreenPosition = window.pageYOffset + ((rect.top + rect.bottom) / 2) - (window.innerHeight / 2);
      if (rect.top < 0 || rect.bottom > window.innerHeight) {
        window.scrollTo(0, middleScreenPosition);
      }
    }
  };

  componentDidMount() {
    if (this.props.isTargeted) {
      setTimeout(this.scrollToComment, 0);
    }
  }

  componentDidUpdate(prevProps) {
    if (!prevProps.isTargeted && this.props.isTargeted) {
      setTimeout(this.scrollToComment, 0);
    }
  }

  render() {
    if (this.props.notFound) {
      return false;
    }

    const isCommentSpecial = this.props.canIEdit || this.props.amISubscribedToAuthor;

    const commentClasses = classnames({
      'comment': true,
      'comment-from-archive': (+this.props.createdAt < ARCHIVE_WATERSHED_TIMESTAMP),
      'hidden-comment': !!this.props.hideType,
      'highlighted': this.props.isHighlighted,
      'targeted-comment': this.props.isTargeted
    });

    const iconClasses = classnames({
      'comment-icon': true,
      'comment-icon-special': isCommentSpecial
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

          <Icon name="comment"/>
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
                inputRef={this.refCommentText}
                className="form-control comment-textarea"
                defaultValue={this.props.body}
                autoFocus={true}
                onKeyDown={this.handleKeyDown}
                onChange={this.handleChangeText}
                minRows={2}
                maxRows={10}
                maxLength="1500"/>
            </div>
            <span>
              <button className="btn btn-default btn-xs comment-post" onClick={this.saveComment}>Post</button>
              <a className="comment-cancel" onClick={this.toggleEditing}>Cancel</a>
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
              isExpanded={this.state.isExpanded}
              userHover={this.userHoverHandlers}
              arrowHover={this.arrowHoverHandlers}/>

            {' -'}&nbsp;

            <UserName id={this.props.createdBy}/>
            {this.props.canIEdit ? (
              <span>
                {' '}(<a onClick={this.toggleEditing}>edit</a>
                &nbsp;|&nbsp;
                <a onClick={this.deleteAfterConfirmation}>delete</a>)
              </span>
            ) : (this.props.isModeratingComments) ? (
              <span>
                {' '}(<a onClick={this.deleteAfterConfirmation}>delete</a>)
              </span>
            ) : false}

            {' '}

            {dateRelativeShort ? (
              <span className="comment-timestamp">
                {'-\u00a0'}
                <Link to={`${this.props.postUrl}#comment-${this.props.id}`} dir="auto">
                  <time dateTime={dateISO} title={dateFull}>{dateRelativeShort}</time>
                </Link>
              </span>
            ) : false}

            {' '}

            <PostCommentLikes commentId={this.props.id}/>
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
