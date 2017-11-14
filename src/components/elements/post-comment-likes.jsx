import React from 'react';
import { connect } from 'react-redux';
import classnames from 'classnames';
import { Tooltip } from 'react-tippy';

import { makeGetClikes } from '../../redux/selectors';
import { postActions } from '../../redux/select-utils';
import UserName from './user-name';

const renderClike = (item, i, items) => (
  <li key={item.id}>
    <UserName user={item} display={item.username}/>

    {i < items.length - 2 ? (
      <span>, </span>
    ) : i === items.length - 2 ? (
      <span> and </span>
    ) : (
      <span> liked this</span>
    )}
  </li>
);

class PostCommentLikes extends React.Component {
  handleShowTooltip = () => {
    this.props.getCommentLikes(this.props.commentId);
  };

  render() {
    const iconClasses = classnames({
      'clikes-icon': true,
      'clikes-icon-liked': this.props.hasOwnLike,
      'fa-stack': true
    });

    const numberClasses = classnames({
      'clikes-number': true,
      'clikes-number-liked': this.props.hasOwnLike
    });

    const clikesList = (
      !this.props.status || this.props.status === 'loading' ? (
        <div className="clikes-loading">Loading {this.props.likes} likes...</div>
      ) : this.props.status === 'error' ? (
        <div className="clikes-error">{this.props.errorMessage}</div>
      ) : (
        <ul className="clikes-list">{this.props.users.map(renderClike)}</ul>
      )
    );

    return (this.props.likes ? (
      <span className="comment-likes">
        {' - '}
        <Tooltip
          animation="fade"
          arrow={true}
          html={clikesList}
          interactive={true}
          onShow={this.handleShowTooltip}
          position="bottom-start"
          theme="gamma"
          trigger="click"
          unmountHTMLWhenHide={true}
          useContext={true}>

          <span className={iconClasses}>
            <i className="fa fa-heart fa-stack-1x"></i>
            <i className="fa fa-heart-o fa-stack-1x"></i>
          </span>
          <span className={numberClasses}>
            {this.props.likes}
          </span>

        </Tooltip>
      </span>
    ) : false);
  }
}

function makeMapStateToProps() {
  const getCommentLikes = makeGetClikes();

  return (state, ownProps) => {
    return {
      ...getCommentLikes(state, ownProps)
    };
  };
}

function mapDispatchToProps(dispatch) {
  return {
    getCommentLikes: postActions(dispatch).commentEdit.getCommentLikes
  };
}

export default connect(makeMapStateToProps, mapDispatchToProps)(PostCommentLikes);
