import React from 'react';

import { preventDefault } from '../../utils';
import throbber16 from 'assets/images/throbber-16.gif';

export default class UserPictureForm extends React.Component {
  refPictureFile = (input) => {
    this.pictureFile = input;
  };

  savePicture = () => {
    const newFile = this.pictureFile.files[0];
    if (newFile && this.props.status !== 'loading') {
      this.props.updateUserPicture(newFile);
    }
  };

  render() {
    return (
      <form onSubmit={preventDefault(this.savePicture)}>
        <h3>Profile picture</h3>

        <div className="form-group">
          <div className="userpic userpic-large">
            <img src={this.props.user.profilePictureLargeUrl} width="75" height="75"/>
          </div>
        </div>

        <div className="form-group">
          <input type="file" ref={this.refPictureFile}/>
        </div>

        <div className="form-group">
          <button className="btn btn-default" type="submit">Update picture</button>

          {this.props.status === 'loading' ? (
            <span className="settings-throbber">
              <img width="16" height="16" src={throbber16}/>
            </span>
          ) : false}
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
