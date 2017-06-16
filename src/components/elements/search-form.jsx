import React from 'react';
import { connect } from 'react-redux';
import { browserHistory } from 'react-router';
import classnames from 'classnames';

import { preventDefault } from '../../utils';

class SearchForm extends React.Component {
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

  componentWillReceiveProps(newProps) {
    if (newProps.query !== this.props.query) {
      this.searchQuery.value = newProps.query;
    }
  }

  render() {
    const formClasses = classnames({
      'search-form': true,
      [this.props.position]: !!this.props.position,
      'focused': this.state.isFocused
    });

    const buttonText = this.props.buttonText || <i className="fa fa-search"></i>;

    return (
      <form className={formClasses} action="/search" onSubmit={preventDefault(this.submitForm)}>
        <input className="form-control" type="text" name="q" ref={this.refSearchQuery} defaultValue={this.props.query} onFocus={this.focusForm} onBlur={this.blurForm}/>
        <button className="btn btn-default" type="submit">
          {buttonText}
        </button>
      </form>
    );
  }
}

function mapStateToProps(state) {
  return {
    query: state.routing.locationBeforeTransitions.query.q || state.routing.locationBeforeTransitions.query.qs || ''
  };
}

export default connect(mapStateToProps)(SearchForm);
