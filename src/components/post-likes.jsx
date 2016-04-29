import React from 'react';
import {connect} from 'react-redux';

import UserName from './user-name';
import {preventDefault} from '../utils';

const renderLike = (item, i, items) => (
  <li key={item.id}>
    {item.id !== 'more-likes' ? (
      <UserName user={item}/>
    ) : (
      <a onClick={preventDefault(item.showMoreLikes)}>{item.omittedLikes} other people</a>
    )}

    {i < items.length - 2 ? (
      <span>, </span>
    ) : i === items.length - 2 ? (
      <span> and </span>
    ) : (
      <span> liked this</span>
    )}
  </li>
);

export const PostLikes = (props) => {
  if (!props.likes.length) {
    return <div/>;
  }

  const likeList = [...props.likes];

  likeList.sort((a, b) => {
    if (a.id == props.me.id) { return -1; }
    if (b.id == props.me.id) { return 1; }
  });

  if (props.post.omittedLikes) {
    likeList.push({
      id: 'more-likes',
      omittedLikes: props.post.omittedLikes,
      showMoreLikes: () => props.showMoreLikes(props.post.id)
    });
  }

  const renderedLikes = likeList.map(renderLike);

  return (
    <div className="likes">
      <i className="fa fa-heart icon"></i>
      <ul>{renderedLikes}</ul>
    </div>
  );
};

const mapStateToProps = (state) => {
  return {
    me: state.user
  };
};

export default connect(mapStateToProps)(PostLikes);
