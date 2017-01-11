import React from 'react';
import { Link } from 'react-router';

export default () => (
  <div className="row">
    <div className="col-md-12">
      <footer>
        FreeFeed Gamma {APP_VERSION}

        {' \u00a0-\u00a0 '}

        Official: <Link to="/about">About</Link>
        {' \u00b7 '}
        <Link to="/freefeed">News</Link>
        {' \u00b7 '}
        <Link to="/about/terms">Terms</Link>
        {' \u00b7 '}
        <a href="https://status.freefeed.net/" target="_blank" rel="noopener">Status</a>
        {' \u00b7 '}
        <a href="https://dev.freefeed.net/" target="_blank" rel="noopener">Development</a>

        {' \u00a0-\u00a0 '}

        Gamma: <Link to="/gamma">News</Link>
        {' \u00b7 '}
        <a href="https://github.com/clbn/freefeed-gamma" target="_blank" rel="noopener">Development</a>
      </footer>
    </div>
  </div>
);
