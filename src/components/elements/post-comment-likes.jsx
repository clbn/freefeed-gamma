import React from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import classnames from 'classnames';
import tippy from 'tippy.js';

import { makeGetClikes } from '../../redux/selectors';
import { postActions } from '../../redux/select-utils';
import UserName from './user-name';
import throbber16 from 'assets/images/throbber-16.gif';

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

const renderTooltipContent = (props) => (
  !props.status || props.status === 'loading' ? (
    <div className="clikes-loading">Loading {props.quantity} likes...</div>
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
      isOpen: false
    };
  }

  componentDidMount() {
    this._isMounted = true;
  }

  componentDidUpdate(prevProps) {
    if (prevProps.status !== this.props.status || prevProps.users.length !== this.props.users.length) {
      this.updateTooltipContent();
    }
  }

  componentWillUnmount() {
    this._isMounted = false;

    if (this.triggerElement._tippy) {
      this.triggerElement._tippy.hide();
    }
  }

  refTrigger = (element) => {
    this.triggerElement = element;
  };

  handleClick = () => {
    if (this.state.isOpen) {
      this.toggleLike();
    } else {
      this.setState({ isOpen: true });

      this.updateTooltipContent();

      setTimeout(() => {
        this.createAndShowTooltip();
      }, 0);
    }
  };

  createAndShowTooltip = () => {
    tippy(this.triggerElement, {
      ...tippyOptions,
      html: this.tooltipContainer,
      onShow: this.handleShowTooltip,
      onHide: this.handleHideTooltip,
      onHidden: this.handleHiddenTooltip
    });

    this.triggerElement._tippy.show();
  };

  handleShowTooltip = () => {
    this.props.getCommentLikes(this.props.commentId);
  };

  handleHideTooltip = () => {
    if (this._isMounted) { // because this can be called on/after unmount from Tippy
      this.setState({ isOpen: false });
    }
  };

  handleHiddenTooltip = () => {
    if (this.triggerElement) {
      this.triggerElement._tippy.destroy();
    }
  };

  updateTooltipContent = () => {
    if (!this.tooltipContainer) {
      this.tooltipContainer = document.createElement('div');
    }

    const tooltipContent = renderTooltipContent(this.props);

    ReactDOM.unstable_renderSubtreeIntoContainer(this, tooltipContent, this.tooltipContainer);
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
    const classes = classnames({
      'comment-likes': true,
      'clikes-zero': !this.props.quantity,
      'clikes-likable': this.props.isLikable && this.state.isOpen,
      'clikes-liking': this.props.isLiking,
      'clikes-liked': this.props.hasOwnLike
    });

    return (
      <span className={classes}>
        {'-'}

        <span className="clikes-trigger" ref={this.refTrigger} onClick={this.handleClick} title="Comment likes">
          <span className="clikes-icon fa-stack">
            <i className="fa fa-heart fa-stack-1x"></i>
            <i className="fa fa-heart-o fa-stack-1x"></i>
          </span>

          <span className="clikes-number">
            {this.props.quantity}
          </span>

          <span className="clikes-sign">
            <i className="fa fa-plus"></i>
            <i className="fa fa-times"></i>
          </span>

          <img className="clikes-throbber" width="11" height="11" src={throbber16}/>
        </span>
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
