import React from 'react';
import { connect } from 'react-redux';

import { makeGetPostComments } from '../../redux/selectors';
import { showMoreComments, toggleCommenting, addComment } from '../../redux/action-creators';
import PostComment from './post-comment';
import PostCommentsMore from './post-comments-more';
import PostCommentCreateForm from './post-comment-create-form';

class PostComments extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      newCommentTextarea: null
    };
  }

  bindNewCommentTextarea = (textarea) => {
    this.setState({ newCommentTextarea: textarea });
  };

  showMoreComments = () => this.props.showMoreComments(this.props.post.id);

  toggleCommenting = () => this.props.toggleCommenting(this.props.post.id);

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

  getCommentById = (commentId) => (
    <PostComment
      id={commentId}
      key={commentId}
      postId={this.props.post.id}
      postUrl={this.props.postUrl}
      isModeratingComments={this.props.post.isModeratingComments}
      openAnsweringComment={this.openAnsweringComment}/>
  );

  render() {
    const props = this.props;

    let firstComments = [], middleComments = [], lastComments = [];
    if (props.post.comments.length > 0) {
      if (props.post.omittedComments > 0) {
        const i = 1;
        middleComments = props.post.comments.slice(0, i).map(this.getCommentById);
        lastComments = props.post.comments.slice(i).map(this.getCommentById);
      } else {
        const i = props.post.archiveRevivalPosition;
        firstComments = props.post.comments.slice(0, i).map(this.getCommentById);
        middleComments = props.post.comments.slice(i).map(this.getCommentById);
      }
    }

    const showArchiveRevival = props.post.archiveRevivalPosition > -1;
    const showOmittedNumber = props.post.omittedComments > 0;
    const canAddComment = (!props.post.commentsDisabled || props.post.isEditable);

    return (
      <div className="comments">
        {firstComments}

        {showArchiveRevival ? (
          <div className="comments-archive-revival">
            <i className="fa fa-bolt fa-fw" title="This comment bumped the post from archive"></i>
          </div>
        ) : false}

        {middleComments}

        {showOmittedNumber ? (
          <PostCommentsMore
            omittedComments={props.post.omittedComments}
            showMoreComments={this.showMoreComments}
            postUrl={props.postUrl}
            isLoading={props.post.isLoadingComments}/>
        ) : false}

        {lastComments}

        {canAddComment ? (
          <PostCommentCreateForm
            post={props.post}
            isSinglePost={props.isSinglePost}
            otherCommentsNumber={props.post.comments.length}
            saveEditingComment={props.addComment}
            toggleCommenting={this.toggleCommenting}
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
