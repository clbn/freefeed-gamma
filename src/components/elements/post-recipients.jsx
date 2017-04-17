import React from 'react';
import Select from 'react-select-plus';
import _ from 'lodash';

const feedToOption = (feed) => ({
  label: feed.user.username,
  value: feed.user.username,
  id: feed.user.id,
  type: feed.user.type,
  isPrivate: feed.user.isPrivate,
  isProtected: feed.user.isProtected
});

const getMyFeedOption = (username) => ({
  label: 'My feed',
  value: username,
  type: 'group'
});

const getOptgroup = (header, options) => ({
  label: `${header} (${options.length})`,
  options: options
});

const getNestedOptions = (feeds, username, peopleFirst = false) => {
  const options = feeds.map(feedToOption);

  const groupOptions = _.filter(options, (o) => (o.type === 'group'));
  groupOptions.sort((a, b) => a.value.localeCompare(b.value));

  const userOptions = _.filter(options, (o) => (o.type === 'user'));
  userOptions.sort((a, b) => a.value.localeCompare(b.value));

  if (peopleFirst) {
    return [ getMyFeedOption(username), getOptgroup('People', userOptions), getOptgroup('Groups', groupOptions) ];
  } else {
    return [ getMyFeedOption(username), getOptgroup('Groups', groupOptions), getOptgroup('People', userOptions) ];
  }
};

export default class PostRecipients extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      options: getNestedOptions(props.feeds, props.user.username, props.peopleFirst),
      isWarningDisplayed: false
    };

    this._values = (props.defaultFeed ? [props.defaultFeed] : []);
  }

  componentDidMount() {
    this.props.onChange(true);
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      options: getNestedOptions(nextProps.feeds, nextProps.user.username, nextProps.peopleFirst)
    });

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
    const flatList = [
      this.state.options[0], // My feed
      ...this.state.options[1].options, // Groups
      ...this.state.options[2].options  // Users
    ];
    return _.filter(flatList, (o) => (this._values.indexOf(o.value) > -1));
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
      <div className="post-recipients">
        <div className="post-recipients-label">To:</div>

        <Select
          name="select-feeds"
          placeholder=""
          autoBlur={true}
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
