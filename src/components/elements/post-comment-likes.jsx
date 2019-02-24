import React from 'react';
import { connect } from 'react-redux';
import classnames from 'classnames';
import Tippy from '@tippy.js/react';

import { makeGetClikes } from '../../redux/selectors';
import { postActions } from '../../redux/select-utils';
import UserName from './user-name';
import Icon from "./icon";
import Throbber from './throbber';

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
  arrow: true,
  interactive: true,
  placement: 'bottom-start',
  theme: 'gamma',
  trigger: 'manual',
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

  handleHideTooltip = () => {
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
    const { isLiking } = this.props;

    const classes = classnames({
      'comment-likes': true,
      'clikes-zero': !this.props.quantity,
      'clikes-likable': this.props.isLikable && this.state.isOpen,
      'clikes-liking': isLiking,
      'clikes-liked': this.props.hasOwnLike
    });

    const tooltipContent = <TooltipContent {...this.props}/>;

    return (
      <span className={classes}>
        {'-'}

        <Tippy
          isVisible={this.state.isOpen}
          content={tooltipContent}
          onShow={this.handleShowTooltip}
          onHide={this.handleHideTooltip}
          {...tippyOptions}>

          <span className="clikes-trigger" onClick={this.handleClick} title="Comment likes">
            <span className="clikes-icon">
              <Icon name="heart"/>
            </span>

            <span className="clikes-number">
              {this.props.quantity}
            </span>

            <span className="clikes-sign">
              <Icon name="plus"/>
              <Icon name="times"/>
            </span>

            {isLiking && (
              <Throbber name="clikes" size={11}/>
            )}
          </span>
        </Tippy>
      </span>
    );
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
