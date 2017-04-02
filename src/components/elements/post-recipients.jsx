import React from 'react';
import Select from 'react-select';
import _ from 'lodash';

const MY_FEED_LABEL = 'My feed';

const feedToOption = (feed) => ({
  label: feed.user.username,
  value: feed.user.username,
  id: feed.user.id,
  type: feed.user.type,
  isPrivate: feed.user.isPrivate,
  isProtected: feed.user.isProtected
});

export default class PostRecipients extends React.Component {
  constructor(props) {
    super(props);

    let options = props.feeds.map(feedToOption);
    options.sort((a, b) => a.value.localeCompare(b.value));

    let myFeedUsername = props.user.username;
    options.unshift({ label: MY_FEED_LABEL, value: myFeedUsername, type: 'group' });

    this._values = (props.defaultFeed ? [props.defaultFeed] : []);

    this.state = {
      options: options,
      isWarningDisplayed: false
    };
  }

  componentDidMount() {
    this.props.onChange(true);
  }

  componentWillReceiveProps(nextProps) {
    let options = nextProps.feeds.map(feedToOption);
    options.sort((a, b) => a.value.localeCompare(b.value));

    let myFeedUsername = nextProps.user.username;
    options.unshift({ label: MY_FEED_LABEL, value: myFeedUsername, type: 'group' });

    this.setState({ options });

    // If defaultFeed gets updated (it happens after sign-in),
    // we also need to set values.
    if (this.props.defaultFeed !== nextProps.defaultFeed) {
      this._values = (nextProps.defaultFeed ? [nextProps.defaultFeed] : []);
      this.props.onChange(true);
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

  render() {
    return (
      <div className="send-to">
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
    );
  }
}
