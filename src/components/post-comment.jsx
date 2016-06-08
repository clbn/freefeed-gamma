import React from 'react';
import Textarea from 'react-textarea-autosize';

import PieceOfText from './piece-of-text';
import UserName from './user-name';
import {preventDefault, confirmFirst, fromNowOrNow, getFullDate} from '../utils';
import throbber16 from 'assets/images/throbber-16.gif';

export default class PostComment extends React.Component {
  openAnsweringComment = () => {
    if (this.props.openAnsweringComment) {
      this.props.openAnsweringComment(this.props.user.username);
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

  render() {
    const createdAgo = fromNowOrNow(+this.props.createdAt) + '\n' + getFullDate(+this.props.createdAt);

    return (
    <div className={`comment ${this.props.highlighted ? 'highlighted' : ''}`}>
      <a className="comment-icon fa fa-comment-o"
         title={createdAgo}
         id={`comment-${this.props.id}`}
         href={`${this.props.entryUrl}#comment-${this.props.id}`}
         onClick={preventDefault(this.openAnsweringComment)}></a>
      {this.props.isEditing ? (
        <div className="comment-body">
          <div>
            <Textarea
              ref="commentText"
              className="comment-textarea"
              defaultValue={this.props.body}
              autoFocus={!this.props.isSinglePost}
              onKeyDown={this.checkSave}
              style={{ overflow: 'hidden', wordWrap: 'break-word' }}
              minRows={2}
              maxRows={10}
              maxLength="1500"/>
          </div>
          {this.props.isSinglePost ? (
            <span>
              <button className="btn btn-default btn-xs comment-post" onClick={this.saveComment}>Comment</button>
            </span>
          ) : (
            <span>
              <button className="btn btn-default btn-xs comment-post" onClick={this.saveComment}>Post</button>
              <a className="comment-cancel" onClick={preventDefault(_=>this.props.toggleEditingComment(this.props.id))}>Cancel</a>
            </span>
          )}
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
            userHover=  {{hover: username => this.props.highlightComment(username),
                          leave: this.props.clearHighlightComment}}
            arrowHover= {{hover: arrows => this.props.highlightArrowComment(arrows),
                          leave: this.props.clearHighlightComment}}/>
          {' -'}&nbsp;
          <UserName user={this.props.user}/>
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
  );}
}
