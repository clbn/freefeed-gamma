import React from 'react';

import PostComment from './post-comment';
import MoreCommentsWrapper from './more-comments-wrapper';
import PostCommentCreateForm from './post-comment-create-form';

const renderComment = (postUrl, openAnsweringComment, isModeratingComments, commentEdit, postId) => comment => (
  <PostComment
    key={comment.id}
    {...comment}
    postUrl={postUrl}
    openAnsweringComment={openAnsweringComment}
    isModeratingComments={isModeratingComments}
    {...commentEdit}
    highlightComment={authorUserName => commentEdit.highlightComment(postId, authorUserName)}
    highlightArrowComment={arrows => commentEdit.highlightComment(postId, undefined, arrows, comment.id)}/>
);

export default class PostComments extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      newCommentTextarea: null
    };
  }

  bindNewCommentTextarea = (textarea) => {
    this.setState({newCommentTextarea: textarea});
  };

  openAnsweringComment = (username) => {
    if (!this.props.post.isCommenting) {
      this.props.toggleCommenting(this.props.post.id);
    }

    setTimeout(() => {
      if (this.state.newCommentTextarea) {
        const text = this.state.newCommentTextarea.value;
        const check = new RegExp(`@${username}\\s*$`);

        if (!text.match(check)) {
          const addSpace = text.length && !text.match(/\s$/);
          this.state.newCommentTextarea.value = `${text}${addSpace ? ' ' : ''}@${username} `;
        }

        this.state.newCommentTextarea.focus();
      }
    }, 0);
  };

  render() {
    const props = this.props;

    const commentMapper = renderComment(props.postUrl, this.openAnsweringComment, props.post.isModeratingComments, props.commentEdit, props.post.id);
    const first = props.comments[0];
    const last = props.comments.length > 1 && props.comments[props.comments.length - 1];
    const middle = props.comments.slice(1, props.comments.length - 1).map(commentMapper);
    const showOmittedNumber = props.post.omittedComments > 0;
    const showMoreComments = () => props.showMoreComments(props.post.id);
    const canAddComment = (!props.post.commentsDisabled || props.post.isEditable);

    return (
      <div className="comments">
        {first ? commentMapper(first): false}

        {middle}

        {showOmittedNumber ? (
          <MoreCommentsWrapper
            omittedComments={props.post.omittedComments}
            showMoreComments={showMoreComments}
            postUrl={props.postUrl}
            isLoading={props.post.isLoadingComments}/>
        ) : false}

        {last ? commentMapper(last) : false}

        {canAddComment ? (
          <PostCommentCreateForm
            post={props.post}
            otherCommentsNumber={props.comments.length}
            saveEditingComment={props.addComment}
            toggleCommenting={props.toggleCommenting}
            bindTextarea={this.bindNewCommentTextarea}/>
        ) : false}
      </div>
    );
  }
};
