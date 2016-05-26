import React from 'react';

import PostComment from './post-comment';
import MoreCommentsWrapper from './more-comments-wrapper';
import CreateComment from './create-comment';

const renderComment = (entryUrl, openAnsweringComment, isModeratingComments, commentEdit, postId) => comment => (
  <PostComment
    key={comment.id}
    {...comment}
    entryUrl={entryUrl}
    openAnsweringComment={openAnsweringComment}
    isModeratingComments={isModeratingComments}
    {...commentEdit}
    highlightComment={authorUserName => commentEdit.highlightComment(postId, authorUserName)}
    highlightArrowComment={arrows => commentEdit.highlightComment(postId, undefined, arrows, comment.id)}/>
);

export default (props) => {
  const entryUrl = `/${props.post.createdBy.username}/${props.post.id}`;

  const openAnsweringComment = (username) => {
    if (!props.post.isCommenting && !props.post.isSinglePost) {
      props.toggleCommenting(props.post.id);
    }

    const text = (props.post.newCommentText || '');
    const check = new RegExp(`@${username}\\s*$`);

    if (!text.match(check)) {
      const addSpace = text.length && !text.match(/\s$/);
      props.updateCommentingText(props.post.id, `${text}${addSpace ? ' ' : ''}@${username} `);
    }
  };

  const commentMapper = renderComment(entryUrl, openAnsweringComment, props.post.isModeratingComments, props.commentEdit, props.post.id);
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

      {showOmittedNumber
        ? <MoreCommentsWrapper
            omittedComments={props.post.omittedComments}
            showMoreComments={showMoreComments}
            entryUrl={entryUrl}
            isLoading={props.post.isLoadingComments}/>
        : false}

      {last ? commentMapper(last) : false}

      {canAddComment ? (
        <CreateComment
          post={props.post}
          otherCommentsNumber={props.comments.length}
          updateCommentingText={props.updateCommentingText}
          saveEditingComment={props.addComment}
          toggleCommenting={props.toggleCommenting}/>
      ) : false}
    </div>
  );
};
