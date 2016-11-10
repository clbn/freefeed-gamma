import React from 'react';
import {connect} from 'react-redux';
import Textarea from 'react-textarea-autosize';
import classnames from 'classnames';

import {makeGetPostComment} from '../../redux/selectors';
import PieceOfText from './piece-of-text';
import UserName from './user-name';
import {preventDefault, confirmFirst, fromNowOrNow, getFullDate} from '../../utils';
import {postActions} from '../../redux/select-utils';
import throbber16 from 'assets/images/throbber-16.gif';

class PostComment extends React.Component {
  openAnsweringComment = () => {
    if (this.props.openAnsweringComment) {
      this.props.openAnsweringComment(this.props.createdBy.username);
    }
  }

  checkSave = (event) => {
    const isEnter = event.keyCode === 13;
    const isShiftPressed = event.shiftKey;
    if (isEnter && !isShiftPressed) {
      event.preventDefault();
      setTimeout(this.saveComment, 0);
    }
  }

  saveComment = () => {
    if (!this.props.isSaving) {
      this.props.saveEditingComment(this.props.id, this.refs.commentText.value);
    }
  }

  userHoverHandlers = {
    hover: (username) => this.props.startHighlightingComments({postId: this.props.postId, username}),
    leave: () => this.props.stopHighlightingComments()
  };

  arrowHoverHandlers = {
    hover: (arrows) => this.props.startHighlightingComments({postId: this.props.postId, baseCommentId: this.props.id, arrows}),
    leave: () => this.props.stopHighlightingComments()
  };

  render() {
    const isCommentSpecial = this.props.isEditable || this.props.amISubscribedToAuthor;

    const iconClasses = classnames({
      'comment-icon': true,
      'comment-icon-special': isCommentSpecial,
      'fa-stack': true
    });

    const createdAgo = fromNowOrNow(+this.props.createdAt) + '\n' + getFullDate(+this.props.createdAt);

    return (
      <div className={`comment ${this.props.isHighlighted ? 'highlighted' : ''}`}>
        <a className={iconClasses}
           title={createdAgo}
           id={`comment-${this.props.id}`}
           href={`${this.props.postUrl}#comment-${this.props.id}`}
           onClick={preventDefault(this.openAnsweringComment)}>
          <i className="fa fa-comment fa-stack-1x"></i>
          <i className="fa fa-comment-o fa-stack-1x"></i>
        </a>
        {this.props.isEditing ? (
          <div className="comment-body">
            <div>
              <Textarea
                ref="commentText"
                className="comment-textarea"
                defaultValue={this.props.body}
                autoFocus={true}
                onKeyDown={this.checkSave}
                style={{ overflow: 'hidden', wordWrap: 'break-word' }}
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
