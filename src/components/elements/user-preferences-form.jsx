import React from 'react';

import { preventDefault } from '../../utils';
import * as FrontendPrefsOptions from '../../utils/frontend-preferences-options';
import Throbber from './throbber';

export default class UserPreferencesForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      frontendPrefs: this.props.frontendPreferences,
    };
  }

  changeDisplayOption = (event) => {
    this.setState({
      frontendPrefs: { ...this.state.frontendPrefs,
        displayNames: { ...this.state.frontendPrefs.displayNames,
          displayOption: parseInt(event.target.value, 10)
        }
      }
    });
  };

  changeUseYou = (event) => {
    this.setState({
      frontendPrefs: { ...this.state.frontendPrefs,
        displayNames: { ...this.state.frontendPrefs.displayNames,
          useYou: event.target.checked
        }
      }
    });
  };

  changeHighlightComments = (event) => {
    this.setState({
      frontendPrefs: { ...this.state.frontendPrefs,
        comments: { ...this.state.frontendPrefs.comments,
          highlightComments: event.target.checked
        }
      }
    });
  };

  savePreferences = () => {
    if (this.props.status !== 'loading') {
      this.props.update(this.props.userId, null, this.state.frontendPrefs);
    }
  };

  render() {
    const { frontendPrefs } = this.state;

    return (
      <form onSubmit={preventDefault(this.savePreferences)}>
        <h3>Preferences</h3>

        <p>How user names should appear:</p>

        <div className="radio">
          <label>
            <input
              type="radio"
              name="displayOption"
              value={FrontendPrefsOptions.DISPLAYNAMES_DISPLAYNAME}
              checked={frontendPrefs.displayNames.displayOption === FrontendPrefsOptions.DISPLAYNAMES_DISPLAYNAME}
              onChange={this.changeDisplayOption}/>
            Display name only
          </label>
        </div>
        <div className="radio">
          <label>
            <input
              type="radio"
              name="displayOption"
              value={FrontendPrefsOptions.DISPLAYNAMES_BOTH}
              checked={frontendPrefs.displayNames.displayOption === FrontendPrefsOptions.DISPLAYNAMES_BOTH}
              onChange={this.changeDisplayOption}/>
            Display name + username
          </label>
        </div>
        <div className="radio">
          <label>
            <input
              type="radio"
              name="displayOption"
              value={FrontendPrefsOptions.DISPLAYNAMES_USERNAME}
              checked={frontendPrefs.displayNames.displayOption === FrontendPrefsOptions.DISPLAYNAMES_USERNAME}
              onChange={this.changeDisplayOption}/>
            Username only
          </label>
        </div>

        <div className="checkbox checkbox-displayNames-useYou">
          <label>
            <input type="checkbox" name="useYou" value="1" checked={frontendPrefs.displayNames.useYou} onChange={this.changeUseYou}/>
            Show your own name as "You"
          </label>
        </div>

        <div className="checkbox">
          <label>
            <input type="checkbox" name="bubbles" value="1" checked={frontendPrefs.comments.highlightComments} onChange={this.changeHighlightComments}/>
            Highlight comments when hovering on @username or ^ and ↑
          </label>
        </div>

        <p>
          <button className="btn btn-default" type="submit">Update preferences</button>

          {this.props.status === 'loading' && (
            <Throbber name="settings"/>
          )}
        </p>

        {this.props.status === 'success' ? (
          <div className="alert alert-info" role="alert">Updated!</div>
        ) : this.props.status === 'error' ? (
          <div className="alert alert-danger" role="alert">{this.props.errorMessage}</div>
        ) : false}
      </form>
    );
  }
}
