import React from 'react';
import DropdownMenu from 'react-dd-menu';

import { confirmFirst } from '../../utils';

export default class PostMoreMenu extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isOpen: false
    };
  }

  handleToggle = () => this.setState({ isOpen: !this.state.isOpen });

  handleClose = () => this.setState({ isOpen: false });

  render() {
    let menuOptions = {
      align: 'left',
      close: this.handleClose,
      isOpen: this.state.isOpen,
      toggle: <a onClick={this.handleToggle}>More&nbsp;&#x25be;</a>
    };

    return (
      <DropdownMenu {...menuOptions}>
        <li className="dd-menu-item"><a className="dd-menu-item-link" onClick={this.props.toggleEditingPost}>Edit</a></li>

        {this.props.post.isModeratingComments
          ? <li className="dd-menu-item"><a className="dd-menu-item-link" onClick={this.props.toggleModeratingComments}>Stop moderating comments</a></li>
          : <li className="dd-menu-item"><a className="dd-menu-item-link" onClick={this.props.toggleModeratingComments}>Moderate comments</a></li>}

        {this.props.post.commentsDisabled
          ? <li className="dd-menu-item"><a className="dd-menu-item-link" onClick={this.props.enableComments}>Enable comments</a></li>
          : <li className="dd-menu-item"><a className="dd-menu-item-link" onClick={this.props.disableComments}>Disable comments</a></li>}

        <li className="dd-menu-item dd-menu-item-danger"><a className="dd-menu-item-link" onClick={confirmFirst(this.props.deletePost)}>Delete</a></li>
      </DropdownMenu>
    );
  }
}
