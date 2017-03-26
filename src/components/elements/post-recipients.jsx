import React from 'react';
import Select from 'react-select';
import _ from 'lodash';

import { preventDefault } from '../../utils';

const MY_FEED_LABEL = 'My feed';

const feedToOption = (feed) => ({
  label: feed.user.username,
  value: feed.user.username,
  type: feed.user.type
});

export default class PostRecipients extends React.Component {
  constructor(props) {
    super(props);

    let options = props.feeds.map(feedToOption);

    let myFeedUsername = props.user.username;
    options.unshift({ label: MY_FEED_LABEL, value: myFeedUsername, type: 'group' });

    this._values = (props.defaultFeed ? [props.defaultFeed] : []);

    this.state = {
      options: options,
      showFeedsOption: !props.defaultFeed,
      isWarningDisplayed: false
    };
  }

  componentDidMount() {
    this.props.onChange(true);
  }

  componentWillReceiveProps(nextProps) {
    let options = nextProps.feeds.map(feedToOption);

    let myFeedUsername = nextProps.user.username;
    options.unshift({ label: MY_FEED_LABEL, value: myFeedUsername, type: 'group' });

    // If defaultFeed gets updated (it happens after sign-in), we have to
    // set values, options and showFeedsOption. Otherwise, only update options.
    if (this.props.defaultFeed !== nextProps.defaultFeed) {
      this._values = (nextProps.defaultFeed ? [nextProps.defaultFeed] : []);
      this.setState({
        options: options,
        showFeedsOption: !nextProps.defaultFeed
      });
      this.props.onChange(true);
    } else {
      this.setState({
        options: options
      });
    }
  }

  // This getters are used in PostCreateForm
  get values() {
    // List of strings (selected usernames)
    return this._values;
  }
  get selectedOptions() {
    // List of objects (selected users)
    return _.filter(this.state.options, (o) => (this._values.indexOf(o.value) > -1));
  }

  isGroupsOrDirectsOnly = (values) => {
    let types = {};
    for (let v of values) {
      types[v.type] = v;
    }
    return Object.keys(types).length <= 1;
  };

  selectChanged = (selectedOptions) => {
    this._values = selectedOptions.map(item => item.value);
    this._values.sort((a, b) => {
      if (a === this.props.user.username) { return -1; }
      if (b === this.props.user.username) { return 1; }
    });

    let isWarningDisplayed = !this.isGroupsOrDirectsOnly(selectedOptions);
    this.setState({ isWarningDisplayed });
    this.props.onChange(true);
  };

  toggleSendTo = () => {
    let newShowFeedsOption = !this.state.showFeedsOption;
    this.setState({ showFeedsOption: newShowFeedsOption });
  };

  render() {
    const defaultFeedLabel = (this._values[0] === this.props.user.username ? MY_FEED_LABEL : this._values[0]);

    return (
      <div className="send-to">
        {!this.state.showFeedsOption ? (
          <div>
            To:&nbsp;
            <span className="Select-value-label-standalone">{defaultFeedLabel}</span>&nbsp;
            <a onClick={preventDefault(_=>this.toggleSendTo())}>Add/Edit</a>
          </div>
        ) : (
          <div>
            <Select
              name="select-feeds"
              placeholder="Select feeds..."
              value={this._values}
              options={this.state.options}
              onChange={this.selectChanged}
              multi={true}
              clearable={false} />
            {this.state.isWarningDisplayed ? (
              <div className="alert alert-warning">
                You are going to send a direct message and also post this message to a feed. This means that everyone who sees this feed will be able to see your message.
              </div>
            ) : false}
          </div>
        )}
      </div>
    );
  }
}
