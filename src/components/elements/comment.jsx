import React from 'react';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import Textarea from 'react-textarea-autosize';
import classnames from 'classnames';

import { makeGetComment } from '../../redux/selectors';
import PieceOfText from './piece-of-text';
import UserName from './user-name';
import CommentLikes from './comment-likes';
import CommentMoreMenu from './comment-more-menu';
import Icon from './icon';
import Throbber from './throbber';
import { preventDefault, confirmFirst, getISODate, getFullDate, getRelativeDate } from '../../utils';
import { postActions } from '../../redux/select-utils';
import * as CommentTypes from '../../utils/comment-types';
import ARCHIVE_WATERSHED_TIMESTAMP from '../../utils/archive-timestamps';
import { getDraftCU, setDraftCU } from '../../utils/drafts';

class Comment extends React.Component {
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
  cancelEditing = () => {
    const isTextNotChanged = this.props.body === this.commentText.value.trim();
    if (isTextNotChanged || confirm('Discard changes and close the form?')) {
      this.toggleEditing();
      setDraftCU(this.props.id, null);
    }
  }

  deleteAfterConfirmation = confirmFirst(() => this.props.deleteComment(this.props.id));

  openAnsweringComment = () => {
    if (this.props.openAnsweringComment) {
      this.props.openAnsweringComment(this.props.authorUsername);
    }
  };

  handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      setTimeout(this.saveComment, 0);
    }
  };

  handleKeyUp = (event) => {
    if (event.key === 'Escape') {
      this.cancelEditing();
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

    const isTextChanged = this.props.body !== this.commentText.value.trim();
    setDraftCU(this.props.id, isTextChanged ? this.commentText.value : null);
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

    const isCommentImportant = this.props.amISubscribedToAuthor;
    const isCommentMine = this.props.canIEdit;

    const commentClasses = classnames({
      'comment': true,
      'comment-from-archive': (+this.props.createdAt < ARCHIVE_WATERSHED_TIMESTAMP),
      'hidden-comment': !!this.props.hideType,
      'highlighted': this.props.isHighlighted,
      'targeted-comment': this.props.isTargeted
    });

    const iconClasses = classnames({
      'comment-icon': true,
      'comment-icon-important': isCommentImportant,
      'comment-icon-mine': isCommentMine,
    });

    const commentPlaceholderText = this.getCommentPlaceholder();

    const dateISO = getISODate(+this.props.createdAt);
    const dateFull = getFullDate(+this.props.createdAt);
    const dateRelative = getRelativeDate(+this.props.createdAt);
    const dateRelativeShort = getRelativeDate(+this.props.createdAt, false);

    // "Changes not saved" when there is a draft
    const draft = getDraftCU(this.props.id);
    const draftLink = (draft && (draft !== this.props.body) ? <>
      {' -'}&nbsp;
      <a onClick={this.toggleEditing} title={`Click to review your changes:\n\n${draft}`}>
        <i className="alert-warning">Changes not saved</i>
      </a>
    </> : false);

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
            <Textarea
              ref={this.refCommentText}
              className="form-control comment-textarea"
              defaultValue={draft ?? this.props.body}
              autoFocus={true}
              onKeyDown={this.handleKeyDown}
              onKeyUp={this.handleKeyUp}
              onChange={this.handleChangeText}
              minRows={2}
              maxRows={10}
              maxLength="1500"/>

            <button className="btn btn-default btn-xs comment-post" onClick={this.saveComment}>Post</button>

            <a className="comment-cancel" onClick={this.cancelEditing}>Cancel</a>

            {this.props.isSaving ? (
              <Throbber name="comment-edit"/>
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

            {draftLink}

            {' -'}&nbsp;

            <UserName id={this.props.createdBy}/>

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

            <CommentLikes commentId={this.props.id}/>

            <CommentMoreMenu
              isCommentMine={isCommentMine} isModeratingComments={this.props.isModeratingComments}
              editFn={this.toggleEditing} deleteFn={this.deleteAfterConfirmation}/>
          </div>
        )}
      </div>
    );
  }
}

function makeMapStateToProps() {
  const getComment = makeGetComment();

  return (state, ownProps) => {
    return {
      ...getComment(state, ownProps)
    };
  };
}

function mapDispatchToProps(dispatch) {
  return {
    ...postActions(dispatch).commentEdit
  };
}

export default connect(makeMapStateToProps, mapDispatchToProps)(Comment);
