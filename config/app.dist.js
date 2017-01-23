import * as FrontendPrefsOptions from '../src/utils/frontend-preferences-options';

const config = {
  api: {
    host: 'https://freefeed.net'
  },
  auth: {
    getCookieDomain: () => window.location.hostname,
    tokenPrefix: 'freefeed_',
    userStorageKey: 'USER_KEY'
  },
  captcha: {
    siteKey: ''
  },
  googleAnalytics: {
    trackingId: 'UA-12345678-0'
  },
  sentry: {
    publicDSN: 'https://0123456789abcdef0123456789abcdef@app.getsentry.com/12345'
  },
  siteDomains: [ // for transform links in the posts, comments, etc.
    'freefeed.net',
    'beta.freefeed.net',
    'gamma.freefeed.net',
    'm.freefeed.net',
    'old.freefeed.net'
  ],
  frontendPreferences: {
    clientId: 'net.freefeed',
    defaultValues: {
      displayNames: {
        displayOption: FrontendPrefsOptions.DISPLAYNAMES_DISPLAYNAME,
        useYou: true
      },
      realtimeActive: false,
      comments: {
        highlightComments: true
      }
    }
  }
};

export default config;
