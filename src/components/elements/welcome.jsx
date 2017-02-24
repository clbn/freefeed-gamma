import React from 'react';
import { Link } from 'react-router';

export default _ => (
  <div className="box-body">
    <h2>Welcome to FreeFeed</h2>

    <p>FreeFeed is a social network that enables you to discover and discuss
      the interesting stuff your friends find on the web.</p>

    <p><Link to="/about" className="inline-header line-start">Read more</Link> about FreeFeed.</p>

    <p>You can <Link to="/signup" className="inline-header">create an account</Link> right away
      or&nbsp;<Link to="/signin" className="inline-header">sign in</Link> if you already have one.</p>
  </div>
);
