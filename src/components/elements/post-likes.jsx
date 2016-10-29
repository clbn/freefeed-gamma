import React from 'react';
import {connect} from 'react-redux';
import classnames from 'classnames';
import _ from 'lodash';

import UserName from './user-name';
import {preventDefault} from '../../utils';
import throbber16 from 'assets/images/throbber-16.gif';

const renderLike = (item, i, items) => (
  <li key={item.id}>
    {item.id !== 'more-likes' ? (
      <UserName user={item}/>
    ) : (
      <span>
        <a onClick={preventDefault(item.showMoreLikes)}>{item.omittedLikes} other people</a>

        {item.isLoadingLikes ? (
          <span className="more-likes-throbber">
            <img width="16" height="16" src={throbber16}/>
          </span>
        ) : false}
      </span>
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

  const didILikePost = _.find(props.likes, {id: props.me.id});

  const likeList = [...props.likes];

  likeList.sort((a, b) => {
    if (a.id == props.me.id) { return -1; }
    if (b.id == props.me.id) { return 1; }
  });

  if (props.post.omittedLikes) {
    likeList.push({
      id: 'more-likes',
      isLoadingLikes: props.post.isLoadingLikes,
      omittedLikes: props.post.omittedLikes,
      showMoreLikes: () => props.showMoreLikes(props.post.id)
    });
  }

  const renderedLikes = likeList.map(renderLike);

  const iconClasses = classnames({
    'likes-icon': true,
    'likes-icon-liked': didILikePost,
    'fa-stack': true
  });

  return (
    <div className="likes">
      <div className={iconClasses}>
        <i className="fa fa-heart fa-stack-1x"></i>
        <i className="fa fa-heart-o fa-stack-1x"></i>
      </div>
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
