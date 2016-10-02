import React from 'react';
import {connect} from 'react-redux';

import {discussions, direct, createPost, resetPostCreateForm} from '../redux/action-creators';
import {joinPostData, joinCreatePostData, postActions} from './select-utils';
import {getQuery, getCurrentRouteName} from '../utils';

import CreatePost from './create-post';
import Feed from './feed';
import PaginatedView from './paginated-view';

class Discussions extends React.Component {
  componentWillReceiveProps(newProps) {
    if (newProps.pathname === this.props.pathname && newProps.offset !== this.props.offset) {
      if (this.props.currentRoute === 'discussions') {
        this.props.discussions(newProps.offset);
      } else if (this.props.currentRoute === 'direct') {
        this.props.direct(newProps.offset);
      }
    }
  }

  render() {
    const props = this.props;

    const createPostComponent = (this.props.currentRoute !== 'search' ? (
      <CreatePost
        sendTo={props.sendTo}
        user={props.user}
        createPost={props.createPost}
        resetPostCreateForm={props.resetPostCreateForm}
        createPostForm={props.createPostForm}
        addAttachmentResponse={props.addAttachmentResponse}
        removeAttachment={props.removeAttachment}/>
    ) : false);

    return (
      <div className="box">
        <div className="box-header-timeline">
          {props.boxHeader.title}

          {props.boxHeader.page > 1 ? (
            <div className="pull-right">
              <span className="subheader">Page {props.boxHeader.page}</span>
            </div>
          ) : false}
        </div>

        <PaginatedView firstPageHead={createPostComponent} {...props}>
          <Feed {...props}/>
        </PaginatedView>
      </div>
    );
  }
}

function mapStateToProps(state, ownProps) {
  const isLoading = state.routeLoadingState;
  const user = state.user;
  const authenticated = state.authenticated;
  const visibleEntries = state.feedViewState.visibleEntries.map(joinPostData(state));
  const createPostForm = joinCreatePostData(state);
  const boxHeader = state.boxHeader;

  const currentRoute = getCurrentRouteName(ownProps);
  const defaultFeed = (currentRoute === 'discussions' ? user.username : null);
  const sendTo = {...state.sendTo, defaultFeed};

  const pathname = state.routing.locationBeforeTransitions.pathname;
  const offset = state.routing.locationBeforeTransitions.query.offset;

  return { isLoading, user, authenticated, visibleEntries, createPostForm, boxHeader, sendTo, currentRoute, pathname, offset };
}

function mapDispatchToProps(dispatch) {
  return {
    discussions: (...args) => dispatch(discussions(...args)),
    direct: (...args) => dispatch(direct(...args)),
    ...postActions(dispatch),
    createPost: (...args) => dispatch(createPost(...args)),
    resetPostCreateForm: (...args) => dispatch(resetPostCreateForm(...args))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Discussions);
