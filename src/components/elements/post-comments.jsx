import React from 'react';
import {connect} from 'react-redux';

import {makeGetPostComments} from '../../redux/selectors';
import {showMoreComments, toggleCommenting, addComment} from '../../redux/action-creators';
import PostComment from './post-comment';
import PostCommentsMore from './post-comments-more';
import PostCommentCreateForm from './post-comment-create-form';

const renderComment = (postId, postUrl, isModeratingComments, openAnsweringComment) => commentId => (
  <PostComment
    id={commentId}
    key={commentId}
    postId={postId}
    postUrl={postUrl}
    isModeratingComments={isModeratingComments}
    openAnsweringComment={openAnsweringComment}/>
);

class PostComments extends React.Component {
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

    const commentMapper = renderComment(props.post.id, props.postUrl, props.post.isModeratingComments, this.openAnsweringComment);
    const first = props.post.comments[0];
    const last = props.post.comments.length > 1 && props.post.comments[props.post.comments.length - 1];
    const middle = props.post.comments.slice(1, props.post.comments.length - 1).map(commentMapper);
    const showOmittedNumber = props.post.omittedComments > 0;
    const showMoreComments = () => props.showMoreComments(props.post.id);
    const toggleCommenting = () => props.toggleCommenting(props.post.id);
    const canAddComment = (!props.post.commentsDisabled || props.post.isEditable);

    return (
      <div className="comments">
        {first ? commentMapper(first): false}

        {middle}

        {showOmittedNumber ? (
          <PostCommentsMore
            omittedComments={props.post.omittedComments}
            showMoreComments={showMoreComments}
            postUrl={props.postUrl}
            isLoading={props.post.isLoadingComments}/>
        ) : false}

        {last ? commentMapper(last) : false}

        {canAddComment ? (
          <PostCommentCreateForm
            post={props.post}
            isSinglePost={props.isSinglePost}
            otherCommentsNumber={props.post.comments.length}
            saveEditingComment={props.addComment}
            toggleCommenting={toggleCommenting}
            bindTextarea={this.bindNewCommentTextarea}/>
        ) : false}
      </div>
    );
  }
}

function makeMapStateToProps() {
  const getPostComments = makeGetPostComments();

  return (state, ownProps) => {
    return {
      ...getPostComments(state, ownProps)
    };
  };
}

function mapDispatchToProps(dispatch) {
  return {
    showMoreComments: (...args) => dispatch(showMoreComments(...args)),
    toggleCommenting: (...args) => dispatch(toggleCommenting(...args)),
    addComment: (...args) => dispatch(addComment(...args))
  };
}

export default connect(makeMapStateToProps, mapDispatchToProps)(PostComments);
