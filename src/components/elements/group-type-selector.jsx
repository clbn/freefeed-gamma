import React from 'react';

import throbber16 from 'assets/images/throbber-16.gif';

export default class GroupTypeSelector extends React.Component {
  levels = {
    PUBLIC: 'PUBLIC',
    PROTECTED: 'PROTECTED',
    PRIVATE: 'PRIVATE'
  };

  descriptions = {
    PUBLIC: 'Anyone (public group)',
    PROTECTED: 'FreeFeed users (protected group)',
    PRIVATE: 'Group members (private group)'
  };

  changeVisibility = (event) => {
    if (event.target.value === this.levels.PUBLIC) {
      this.props.changeGroupType({ isPrivate: '0', isProtected: '0' });
    } else if (event.target.value === this.levels.PROTECTED) {
      this.props.changeGroupType({ isPrivate: '0', isProtected: '1' });
    } else if (event.target.value === this.levels.PRIVATE) {
      this.props.changeGroupType({ isPrivate: '1', isProtected: '0' });
    }
  };

  changeRestricted = (event) => {
    this.props.changeGroupType({ isRestricted: event.target.value });
  };

  render() {
    const originalState = this.props.originalState;
    const currentState = this.props.currentState;
    let groupLevel;
    let visibilityWarning;

    if (currentState.isPrivate === '1') {
      groupLevel = this.levels.PRIVATE;
    } else if (currentState.isProtected === '1') {
      groupLevel = this.levels.PROTECTED;
    } else {
      groupLevel = this.levels.PUBLIC;
    }

    if (originalState.isPrivate === '1' && currentState.isPrivate === '0' && currentState.isProtected === '0') {
      visibilityWarning = {
        from: { level: 'private', audience: 'group members' },
        to: { level: 'public', audience: 'anyone' }
      };
    } else if (originalState.isPrivate === '1' && currentState.isPrivate === '0' && currentState.isProtected === '1') {
      visibilityWarning = {
        from: { level: 'private', audience: 'group members' },
        to: { level: 'protected', audience: 'any FreeFeed user' }
      };
    } else if (originalState.isProtected === '1' && currentState.isPrivate === '0' && currentState.isProtected === '0') {
      visibilityWarning = {
        from: { level: 'protected', audience: 'FreeFeed users' },
        to: { level: 'public', audience: 'anyone' }
      };
    } else {
      visibilityWarning = null;
    }

    return (
      <div>
        <div className="row form-group">
          <div className="col-sm-3">
            <label>Who can see posts:</label>
          </div>

          <div className="col-sm-9">
            {Object.keys(this.levels).map((level) => (
              <div className="radio radio-groupVisibility" key={level}>
                <label>
                  <input
                    type="radio"
                    value={level}
                    checked={groupLevel === level}
                    onChange={this.changeVisibility}/>
                  {this.descriptions[level]}
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="row form-group">
          <div className="col-sm-3">
            <label>Who can write posts:</label>
          </div>

          <div className="col-sm-9">
            <div className="radio radio-groupVisibility">
              <label>
                <input
                  type="radio"
                  value="0"
                  checked={currentState.isRestricted === '0'}
                  onChange={this.changeRestricted}/>
                Every group member
              </label>
            </div>

            <div className="radio radio-groupVisibility">
              <label>
                <input
                  type="radio"
                  value="1"
                  checked={currentState.isRestricted === '1'}
                  onChange={this.changeRestricted}/>
                Group administrators only
              </label>
            </div>
          </div>
        </div>

        {visibilityWarning ? (
          <div className="alert alert-danger" role="alert">
            You are about to change the group type
            from <b>{visibilityWarning.from.level}</b> to <b>{visibilityWarning.to.level}</b>.

            It means <b>{visibilityWarning.to.audience}</b> will be able to see its posts and comments,
            which are only available to <b>{visibilityWarning.from.audience}</b> now.
          </div>
        ) : false}

        {this.props.submitButton ? (
          <p>
            <button className="btn btn-default" type="submit">{this.props.submitButton.text + (visibilityWarning ? ' anyway' : '')}</button>

            {this.props.submitButton.status === 'loading' ? (
              <span className="settings-throbber">
                <img width="16" height="16" src={throbber16}/>
              </span>
            ) : false}
          </p>
        ) : false}
      </div>
    );
  }
}
