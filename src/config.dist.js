import * as FrontendPrefsOptions from './utils/frontend-preferences-options';

const config = {
  api:{
    host: 'http://localhost:3000',
    sentinel: null // keep always last
  },
  auth: {
    cookieDomain: 'localhost',
    tokenPrefix: 'freefeed_',
    userStorageKey: 'USER_KEY',
    sentinel: null // keep always last
  },
  captcha: {
    siteKey: '',
    sentinel: null // keep always last
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
