# FreeFeed Gamma

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)

Gamma is an unofficial [FreeFeed](https://freefeed.net) client.

You can use the app at https://gamma.freefeed.net/, run it locally on your 
computer, or even host it on your own server.

## Running locally

After cloning the repo, switch to the app folder and run the following command:

```
$ npm start
```

It prepares default config file, installs dependencies from NPM and starts 
a development server.

By default, it uses production FreeFeed API (`https://freefeed.net/v1/...`), 
so you can sign in with your FF credentials and socialize with your friends 
right away.

## Building for production

To build a production-ready app, run:

```
$ npm run build
```

It builds the app to the `build` folder.
