import React from 'react';
import { connect } from 'react-redux';
import classnames from 'classnames';

import { makeGetPostLikes } from '../../redux/selectors';
import { showMoreLikes } from '../../redux/action-creators';
import { preventDefault } from '../../utils';
import UserName from './user-name';
import Icon from "./icon";
import throbber16 from 'assets/images/throbber-16.gif';

const renderLike = (item, i, items) => (
  <li key={item.id}>
    {item.id !== 'more-likes' ? (
      <UserName id={item.id}/>
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

const PostLikes = (props) => {
  if (!props.users.length) {
    return <div/>;
  }

  const userList = [...props.users];

  if (props.omittedLikes) {
    userList.push({
      id: 'more-likes',
      isLoadingLikes: props.isLoadingLikes,
      omittedLikes: props.omittedLikes,
      showMoreLikes: () => props.showMoreLikes(props.postId)
    });
  }

  const renderedLikes = userList.map(renderLike);

  const iconClasses = classnames({
    'likes-icon': true,
    'likes-icon-liked': props.didILikePost
  });

  return (
    <div className="likes">
      <div className={iconClasses}>
        <Icon name="heart"/>
      </div>
      <ul>{renderedLikes}</ul>
    </div>
  );
};

function makeMapStateToProps() {
  const getPostLikes = makeGetPostLikes();

  return (state, ownProps) => {
    return {
      ...getPostLikes(state, ownProps)
    };
  };
}

function mapDispatchToProps(dispatch) {
  return {
    showMoreLikes: (...args) => dispatch(showMoreLikes(...args))
  };
}

export default connect(makeMapStateToProps, mapDispatchToProps)(PostLikes);
