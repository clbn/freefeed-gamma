import test from 'tape';
import React from 'react';
import sd from 'skin-deep';

import { PostLikes } from 'src/components/elements/post-likes';

const renderLikes = (likes, omittedLikes = 0) => {
  const post = { omittedLikes };
  const me = { id: 123 };

  const tree = sd.shallowRender(React.createElement(PostLikes, { likes, post, me }));
  return tree.getRenderOutput().props.children[1].props.children;
};

const getRenderedOmittedLikes = (likes, omittedLikes) => {

  const likeList = renderLikes(likes, omittedLikes);

  const lastLike = likeList[likeList.length - 1];

  const omittedLikesNode = lastLike.props.children[0];

  const omittedLikesNumber = omittedLikesNode.props.children[0].props.children[0];

  return omittedLikesNumber;
};

test('PostLikes renders all likes', t => {

  let likes = [];

  for (var i = 0; i < 6; i++) {
    likes.push({});

    const renderedLikes = renderLikes(likes);

    t.equals(renderedLikes.length, likes.length);
  }

  t.end();
});

test('PostLikes renders omitted likes number', t => {

  const omitLikes = 10;

  const omittedLikes = getRenderedOmittedLikes([{}], omitLikes);

  t.equals(omittedLikes, omitLikes);

  t.end();
});
