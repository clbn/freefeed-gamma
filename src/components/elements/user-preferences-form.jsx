import React from 'react';

import { preventDefault } from '../../utils';
import * as FrontendPrefsOptions from '../../utils/frontend-preferences-options';
import Throbber from './throbber';

export default class UserPreferencesForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      prefs: this.props.preferences,
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

  changePref = (field) => (event) => {
    const value = (event.target.type === 'checkbox' ? event.target.checked : event.target.value);

    this.setState({
      prefs: { ...this.state.prefs, [field]: value }
    });
  };

  savePreferences = () => {
    if (this.props.status !== 'loading') {
      this.props.update(this.props.userId, this.state.prefs, this.state.frontendPrefs);
    }
  };

  render() {
    const { prefs, frontendPrefs } = this.state;

    return (
      <form className="settings-form" onSubmit={preventDefault(this.savePreferences)}>
        <h3>Preferences</h3>

        <div className="row">
          <div className="col-sm-6 col-xs-12">

            <div className="preferences-form-group">
              <p><b>How user names should appear:</b></p>

              <div className="radio">
                <label>
                  <input type="radio" name="displayOption" value={FrontendPrefsOptions.DISPLAYNAMES_DISPLAYNAME}
                    checked={frontendPrefs.displayNames.displayOption === FrontendPrefsOptions.DISPLAYNAMES_DISPLAYNAME}
                    onChange={this.changeDisplayOption}/>
                  Display name only
                </label>
              </div>
              <div className="radio">
                <label>
                  <input type="radio" name="displayOption" value={FrontendPrefsOptions.DISPLAYNAMES_BOTH}
                    checked={frontendPrefs.displayNames.displayOption === FrontendPrefsOptions.DISPLAYNAMES_BOTH}
                    onChange={this.changeDisplayOption}/>
                  Display name + username
                </label>
              </div>
              <div className="radio">
                <label>
                  <input type="radio" name="displayOption" value={FrontendPrefsOptions.DISPLAYNAMES_USERNAME}
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
            </div>

          </div>
          <div className="col-sm-6 col-xs-12">

            <div className="preferences-form-group">
              <p><b>Accept direct messages from:</b></p>

              <div className="radio">
                <label>
                  <input type="radio" name="acceptDirectsFrom" value="all" checked={prefs.acceptDirectsFrom === 'all'} onChange={this.changePref('acceptDirectsFrom')}/>
                  Everyone except the ones you blocked
                </label>
              </div>
              <div className="radio">
                <label>
                  <input type="radio" name="acceptDirectsFrom" value="friends" checked={prefs.acceptDirectsFrom === 'friends'} onChange={this.changePref('acceptDirectsFrom')}/>
                  Just the users you're subscribed to
                </label>
              </div>
            </div>

            <div className="preferences-form-group">
              <p><b>Receive emails from FreeFeed:</b></p>

              <div className="checkbox">
                <label>
                  <input type="checkbox" name="notifications" value="1" checked={prefs.sendNotificationsDigest} onChange={this.changePref('sendNotificationsDigest')}/>
                  Notifications & mentions (daily)
                </label>
              </div>
              <div className="checkbox">
                <label>
                  <input type="checkbox" name="bestOfDay" value="1" checked={prefs.sendDailyBestOfDigest} onChange={this.changePref('sendDailyBestOfDigest')}/>
                  <i>Best of day</i> digest (daily)
                </label>
              </div>
              <div className="checkbox">
                <label>
                  <input type="checkbox" name="bestOfWeek" value="1" checked={prefs.sendWeeklyBestOfDigest} onChange={this.changePref('sendWeeklyBestOfDigest')}/>
                  <i>Best of week</i> digest (weekly)
                </label>
              </div>
            </div>

          </div>
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
