import React from 'react';

import { preventDefault } from '../../utils';
import Userpic from './userpic';
import Throbber from './throbber';

export default class GroupPictureForm extends React.Component {
  refPictureFile = (input) => {
    this.pictureFile = input;
  };

  savePicture = () => {
    const newFile = this.pictureFile.files[0];
    if (newFile && this.props.status !== 'loading') {
      this.props.updateGroupPicture(this.props.group.username, newFile);
    }
  };

  componentWillUnmount() {
    this.props.resetGroupUpdateForm();
  }

  render() {
    return (
      <form onSubmit={preventDefault(this.savePicture)}>
        <h3>Profile picture</h3>

        <div className="form-group">
          <div className="userpic userpic-large">
            <Userpic id={this.props.group.id} size={75}/>
          </div>
        </div>

        <div className="form-group">
          <input type="file" ref={this.refPictureFile}/>
        </div>

        <div className="form-group">
          <button className="btn btn-default" type="submit">Update</button>

          {this.props.status === 'loading' && (
            <Throbber name="settings"/>
          )}
        </div>

        {this.props.status === 'success' ? (
          <div className="alert alert-info" role="alert">Profile picture has been updated</div>
        ) : this.props.status === 'error' ? (
          <div className="alert alert-danger" role="alert">{this.props.errorMessage}</div>
        ) : false}
      </form>
    );
  }
}
