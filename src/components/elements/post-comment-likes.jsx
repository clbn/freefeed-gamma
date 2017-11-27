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
  constructor(props) {
    super(props);

    this.state = {
      isOpen: false
    };
  }

  toggleLike = () => {
    if (!this.props.hasOwnLike) {
      this.props.likeComment(this.props.commentId);
    } else {
      this.props.unlikeComment(this.props.commentId);
    }
  };

  handleClick = () => {
    if (!this.state.isOpen) {
      this.setState({ isOpen: true });
    } else {
      this.toggleLike();
    }
  };

  handleRequestClose = () => {
    this.setState({ isOpen: false });
  };

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
        <div className="clikes-loading">Loading {this.props.quantity} likes...</div>
      ) : this.props.status === 'error' ? (
        <div className="clikes-error">{this.props.errorMessage}</div>
      ) : (
        <ul className="clikes-list">{this.props.users.map(renderClike)}</ul>
      )
    );

    return (this.props.quantity ? (
      <span className="comment-likes">
        {'-\u00a0'}
        <Tooltip
          animation="fade"
          arrow={true}
          html={clikesList}
          interactive={true}
          onRequestClose={this.handleRequestClose}
          onShow={this.handleShowTooltip}
          open={this.state.isOpen}
          position="bottom-start"
          theme="gamma"
          trigger="manual"
          unmountHTMLWhenHide={true}
          useContext={true}>

          <span onClick={this.handleClick}>
            <span className={iconClasses}>
              <i className="fa fa-heart fa-stack-1x"></i>
              <i className="fa fa-heart-o fa-stack-1x"></i>
            </span>
            <span className={numberClasses}>
              {this.props.quantity}
            </span>
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
    getCommentLikes: postActions(dispatch).commentEdit.getCommentLikes,
    likeComment: postActions(dispatch).commentEdit.likeComment,
    unlikeComment: postActions(dispatch).commentEdit.unlikeComment
  };
}

export default connect(makeMapStateToProps, mapDispatchToProps)(PostCommentLikes);
