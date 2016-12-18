import test from 'tape';
import React from 'react';
import sd from 'skin-deep';

import PostComments from 'src/components/elements/post-comments';
import PostCommentCreateForm from 'src/components/elements/post-comment-create-form';

const renderComments = (comments, omittedComments = 0, isCommenting = false) => {
  const post = { omittedComments, isCommenting, createdBy: { username: '' } };

  const tree = sd.shallowRender(React.createElement(PostComments, { comments, post }));

  return tree.getRenderOutput().props.children;
};

const firstCommentRendered = renderedComments => renderedComments[0];
const middleCommentsRendered = renderedComments => renderedComments[1];
const omittedCommentsRendered = renderedComments => renderedComments[2];
const lastCommentRendered = renderedComments => renderedComments[3];
const createCommentRendered = renderedComments => renderedComments[4];

const generateArray = n => Array.apply(null, Array(n)).map(_ => ({}));

const commentArrays = generateArray(5).map((_, index) => generateArray(index));

const renderedCommentsAndOmitted = commentArrays.map(comments => renderComments(comments, 1));
const renderedCommentsWithoutOmitted = commentArrays.map(comments => renderComments(comments, 0));

test('PostComments renders first comment if there\'s any comments' , t => {

  t.notOk(firstCommentRendered(renderedCommentsAndOmitted[0]));

  renderedCommentsAndOmitted.slice(1).map(renderedComment => {
    t.ok(firstCommentRendered(renderedComment));
  });

  t.end();
});

test('PostComments renders right number of middle comments' , t => {

  renderedCommentsAndOmitted.map((renderedComment, index) => {
    t.equals(middleCommentsRendered(renderedComment).length, Math.max(index - 2, 0));
  });

  t.end();
});

test('PostComments renders omitted number then the number is greater than 0' , t => {
  renderedCommentsAndOmitted.map(render => {
    t.ok(omittedCommentsRendered(render));
  });
  t.end();
});

test('PostComments does not render omitted number then there\'s none' , t => {
  renderedCommentsWithoutOmitted.map(render => {
    t.notOk(omittedCommentsRendered(render));
  });
  t.end();
});

test('PostComments renders last comment if there\'s more than one comment' , t => {

  renderedCommentsAndOmitted.slice(0,2).map(renderedComment => {
    t.notOk(lastCommentRendered(renderedComment));
  });

  renderedCommentsAndOmitted.slice(2).map(renderedComment => {
    t.ok(lastCommentRendered(renderedComment));
  });

  t.end();

});

test('PostComments renders PostCommentCreateForm', t => {
  const createComment = createCommentRendered(renderComments([], 0));
  t.equals(createComment.type, PostCommentCreateForm);

  t.end();
});
