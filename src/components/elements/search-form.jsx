import React from 'react';
import { browserHistory } from 'react-router';
import classnames from 'classnames';

import { preventDefault } from '../../utils';

export default class SearchForm extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isFocused: false
    };
  }

  refSearchQuery = (input) => {
    this.searchQuery = input;
  };

  focusForm = () => {
    this.setState({ isFocused: true });
  };

  blurForm = () => {
    this.setState({ isFocused: false });
  };

  submitForm = () => {
    const query = this.searchQuery.value;
    browserHistory.push(`/search?q=${encodeURIComponent(query)}`);
  };

  render() {
    const formClasses = classnames({
      'search-form-in-header': true,
      'form-inline': true,
      'focused': this.state.isFocused
    });

    return (
      <form className={formClasses} action="/search" onSubmit={preventDefault(this.submitForm)}>
        <input className="form-control" type="text" name="q" ref={this.refSearchQuery} defaultValue="" onFocus={this.focusForm} onBlur={this.blurForm}/>
        <button className="btn btn-default" type="submit">
          <i className="fa fa-search"></i>
        </button>
      </form>
    );
  }
}
