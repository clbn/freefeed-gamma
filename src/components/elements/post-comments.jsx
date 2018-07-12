import React from 'react';
import { connect } from 'react-redux';

import { makeGetPostComments } from '../../redux/selectors';
import { showMoreComments, toggleCommenting } from '../../redux/action-creators';
import PostComment from './post-comment';
import PostCommentsMore from './post-comments-more';
import PostCommentCreateForm from './post-comment-create-form';
import Icon from "./icon";

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

    let firstComment = [], middleComments = [], lastComments = [];

    if (props.post.comments.length > 0) {
      firstComment = props.post.comments.slice(0, 1).map(this.getCommentById);

      const i = props.post.archiveRevivalPosition;
      if (i < 2) {
        // The revival position is -1 (doesn't exist), or 0 (set on the top comment),
        // or 1 (set on the second comment overall / the first of omitted).
        // For these cases the omitted comments form one group:
        lastComments = props.post.comments.slice(1).map(this.getCommentById);
      } else {
        // The revival position is located after the first of omitted comments.
        // It means the omitted have to be divided into two groups:
        middleComments = props.post.comments.slice(1, i).map(this.getCommentById);
        lastComments = props.post.comments.slice(i).map(this.getCommentById);
      }
    }

    const archiveRevivalIcon = (
      <div className="comments-archive-revival">
        <Icon name="bolt" title="This comment bumped the post from archive"/>
      </div>
    );
    const showOmittedNumber = props.post.omittedComments > 0;
    const canAddComment = (!props.post.commentsDisabled || props.post.canIEdit);

    return (
      <div className="comments">
        {props.post.archiveRevivalPosition === 0 ? archiveRevivalIcon : false}

        {firstComment}

        {showOmittedNumber ? (
          <PostCommentsMore
            omittedComments={props.post.omittedComments}
            omittedCommentLikes={props.post.omittedCommentLikes}
            showMoreComments={this.showMoreComments}
            postUrl={props.postUrl}
            isLoading={props.post.isLoadingComments}/>
        ) : false}

        {middleComments}

        {props.post.archiveRevivalPosition > 0 ? archiveRevivalIcon : false}

        {lastComments}

        {canAddComment ? (
          <PostCommentCreateForm
            post={props.post}
            isSinglePost={props.isSinglePost}
            otherCommentsNumber={props.post.comments.length}
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
    toggleCommenting: (...args) => dispatch(toggleCommenting(...args))
  };
}

export default connect(makeMapStateToProps, mapDispatchToProps)(PostComments);
