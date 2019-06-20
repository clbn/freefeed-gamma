import React from 'react';
import { connect } from 'react-redux';
import Select from 'react-select/lib/Creatable';
import _ from 'lodash';

const reactSelectStyles = {
  // These can only be styled with a style object, not CSS
  multiValueRemove: (styles, { isFocused }) => ({ ...styles,
    color: isFocused ? '#fff' : '#bbb',
  }),
  option: (styles, { data, isFocused }) => ({ ...styles,
    color: data.__isNew__ && ((isFocused ? '#555' : '#777') + ' !important'),
    backgroundColor: data.__isNew__ && ((isFocused ? '#e8e8e8' : '#f8f8f8') + ' !important'),
    borderColor: data.__isNew__ && ((isFocused ? '#aaa' : '#ccc') + ' !important'),
    borderStyle: data.__isNew__ && 'dashed !important'
  })
};

class PostRecipients extends React.Component {
  constructor(props) {
    super(props);

    const selected = this.getBetterValues(props.users);
    this.props.onChange(selected);
  }

  componentDidUpdate(prevProps) {
    // When component is rendered first with empty options list, but then the list gets updated
    if (this.props.users.length !== prevProps.users.length) {
      const selected = this.getBetterValues(this.props.users);
      this.props.onChange(selected);
    }
  }

  getOptionLabel = option => option.label || option.username;
  getOptionValue = option => option.username;

  formatCreateLabel = inputValue => inputValue.trim();
  isValidNewOption = (inputValue) => (
    (inputValue.trim().length > 0) &&
    !_.find(this.props.users, u => u.username === inputValue.trim())
  );
  getNewOptionData = (inputValue, optionLabel) => ({
    __isNew__: true, // This replicates the signature of built-in getNewOptionData()
    username: inputValue.trim(),
    label: optionLabel,
    type: 'user'
  });

  getBetterValues = users => (
    this.props.selected.map(o => (
      _.find(users, u => u.username === o.username) || o
    ))
  );

  isNotPure = () => _.uniqBy(this.props.selected, 'type').length > 1;

  handleChange = (selected) => {
    selected.sort((a, b) => {
      if (a.username === this.props.myUsername) { return -1; }
      if (b.username === this.props.myUsername) { return 1; }
    });
    this.props.onChange(selected);
  };

  render() {
    return (
      <div className="post-recipients">
        <div className="post-recipients-label">To:</div>

        <Select
          className="react-select-container" // For styling with CSS
          classNamePrefix="react-select" // For styling with CSS
          styles={reactSelectStyles} // For styling with a style object (just that one piece unavailable in CSS)
          placeholder=""

          value={this.props.selected}
          options={this.props.options}

          getOptionLabel={this.getOptionLabel}
          getOptionValue={this.getOptionValue}

          formatCreateLabel={this.formatCreateLabel}
          isValidNewOption={this.isValidNewOption}
          getNewOptionData={this.getNewOptionData}

          onChange={this.handleChange}

          isMulti={true}
          isClearable={false}
        />

        {this.isNotPure() && (
          <div className="alert alert-warning">
            You are going to send a direct message and also post this message to a feed. This means that everyone who sees this feed will be able to see your message.
          </div>
        )}
      </div>
    );
  }
}

const userToOption = user => _.pick(user, ['id', 'username', 'type', 'isPrivate', 'isProtected']);

const getOptgroup = (header, options) => ({
  label: `${header} (${options.length})`,
  options: options
});

const canPostToGroup = (group, myId) => (
  (group.isRestricted === '0') ||
  ((group.administrators || []).indexOf(myId) > -1)
);

const mapStateToProps = (state, ownProps) => {
  //
  // 0. My feed

  const me = {
    ...userToOption(state.users[state.me.id]),
    label: 'My feed',
    type: 'group'
  };

  //
  // 1. Groups I can post to

  const groups = state.me.subscriptions
    .map(id => state.users[id] || {})
    .filter(u => u.type === 'group' && canPostToGroup(u, me.id))
    .map(userToOption);

  groups.sort((a, b) => a.username.localeCompare(b.username));

  //
  // 2. People I can send direct messages to

  const people = state.me.subscribers
    .map(u => state.users[u.id] || {})
    .filter(u => u.type === 'user')
    .map(userToOption);

  people.sort((a, b) => a.username.localeCompare(b.username));

  //
  // 3. Combined objects

  const users = [me].concat(groups).concat(people);

  let options;
  if (ownProps.peopleFirst) {
    options = [ me, getOptgroup('People', people), getOptgroup('Groups', groups) ];
  } else {
    options = [ me, getOptgroup('Groups', groups), getOptgroup('People', people) ];
  }

  return {
    myUsername: me.username,
    users, // Flat list of users for easier search
    options // Nested list of options for <Select>
  };
};

export default connect(mapStateToProps)(PostRecipients);
