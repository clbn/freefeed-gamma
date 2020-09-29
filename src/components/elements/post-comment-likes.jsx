import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import classnames from 'classnames';
import Tippy from '@tippyjs/react';

import { makeGetClikes } from '../../redux/selectors';
import { postActions } from '../../redux/select-utils';
import UserName from './user-name';
import Icon from './icon';
import Throbber from './throbber';
import 'styles/comment-likes.scss';

const renderClike = (item, i, items) => (
  <li key={item.id}>
    <UserName id={item.id} display={item.username}/>

    {i < items.length - 2 ? (
      ', '
    ) : i === items.length - 2 ? (
      ' and '
    ) : (
      ' liked this'
    )}
  </li>
);

const TooltipContent = (props) => (
  !props.status || props.status === 'loading' ? (
    <div className="clikes-loading">Loading likes...</div>
  ) : props.status === 'error' ? (
    <div className="clikes-error">{props.errorMessage}</div>
  ) : props.users.length === 0 ? (
    <div className="clikes-empty-list">No likes here yet</div>
  ) : (
    <ul className="clikes-list">{props.users.map(renderClike)}</ul>
  )
);

const tippyOptions = {
  animation: 'fade',
  appendTo: () => document.body,
  arrow: true,
  interactive: true,
  placement: 'bottom-start',
  theme: 'gamma',
  zIndex: 9
};

class PostCommentLikes extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isOpen: false,
      isLoaded: false
    };
  }

  componentDidUpdate(prevProps) {
    // When tooltip is open, we should update the user list on realtime clikes
    if (this.state.isOpen && prevProps.quantity !== this.props.quantity) {
      this.props.getCommentLikes(this.props.commentId, true);
    }
  }

  handleClick = () => {
    if (this.state.isOpen) {
      this.toggleLike();
    } else {
      this.setState({ isOpen: true });
    }
  };

  handleShowTooltip = () => {
    if (!this.state.isLoaded) {
      this.props.getCommentLikes(this.props.commentId);
      this.setState({ isLoaded: true });
    }
  };

  handleClickOutside = () => {
    if (this.state.isOpen) {
      this.setState({
        isOpen: false,
        isLoaded: false
      });
    }
  };

  toggleLike = () => {
    if (!this.props.isLikable) {
      return;
    }

    if (this.props.isLiking) {
      return;
    }

    if (!this.props.hasOwnLike) {
      this.props.likeComment(this.props.commentId);
    } else {
      this.props.unlikeComment(this.props.commentId);
    }
  };

  render() {
    const { isLikable, isLiking, hasOwnLike, quantity } = this.props;
    const { isOpen } = this.state;

    const classes = classnames({
      'comment-likes': true,
      'clikes-zero': quantity === 0,
      'clikes-open': isOpen,
      'clikes-liked': hasOwnLike
    });

    const tooltipContent = <TooltipContent {...this.props}/>;

    return (
      <span className={classes}>
        {'-'}

        <Tippy
          visible={isOpen}
          content={tooltipContent}
          onShow={this.handleShowTooltip}
          onClickOutside={this.handleClickOutside}
          {...tippyOptions}>

          <span className="clikes-trigger" onClick={this.handleClick} title="Comment likes">
            <Icon name="heart"/>

            {quantity > 0 && !(isOpen && isLikable) && (
              <span className="clikes-number">{quantity}</span>
            )}

            {isOpen && isLikable && !isLiking && (
              hasOwnLike ? (
                <Icon name="times"/>
              ) : (
                <Icon name="plus"/>
              )
            )}

            {isLiking && (
              <Throbber name="clikes" size={11}/>
            )}
          </span>
        </Tippy>
      </span>
    );
  }
}

PostCommentLikes.propTypes = {
  isLikable: PropTypes.bool,
  isLiking: PropTypes.bool,
  hasOwnLike: PropTypes.bool,
  quantity: PropTypes.number
};

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
