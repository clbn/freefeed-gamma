# Redux store structure

## Primary data

### `attachments`

```
{
  <attachmentId>: {
    id: <attachmentId>,
    fileName: "image.jpg",
    fileSize: "123456",
    url: "https://media.freefeed.net/attachments/b118b77d-3d3e-865e-40bd-ea6602cf61e0.png",
    thumbnailUrl: "https://media.freefeed.net/attachments/thumbnails/b118b77d-3d3e-865e-40bd-ea6602cf61e0.png",
    ...
  },
  ...
}
```

### `comments`

```
{
  <commentId>: {
    id: <postId>,
    body: "Some text",
    createdBy: <userId>,
    likes: 4,
    hasOwnLike: false,
    ...
  },
  ...
}
```

### `posts`

```
{
  <postId>: {
    id: <postId>,
    postedTo: [ <feedId>, <feedId>, ... ],
    body: "Some text",
    attachments: [ <attachmentId>,  <attachmentId>, ... ],
    likes: [ <userId>, <userId>, ... ],
    comments: [ <commentId>, <commentId>, ... ],
    ...
  },
  ...
}
```

### `feeds`

"Feeds" are entities connecting the post and the users/groups it's posted to.

```
{
  <feedId>: { 
    id: <feedId>, 
    name: "Posts", 
    user: <userId> 
  },
  ...
}
```

### `users`

Users and groups.

```
{
  <userId>: {
    id: <userId>,
    username: "askfreefeed",
    screenName: "Ask FreeFeed",
    description: "Some text",
    isPrivate: "0",
    isProtected: "0",
    isRestricted: "0",
    type: "group",
    profilePictureLargeUrl: "https://media.freefeed.net/profilepics/002b94a4-a983-f35c-4068-df3f031668b6_75.jpg",
    profilePictureMediumUrl: "https://media.freefeed.net/profilepics/002b94a4-a983-f35c-4068-df3f031668b6_50.jpg",
    ...
  },
  ...
}
```


## Secondary/derivative data

### `authenticated`

### `commentViews`

### `commentLikesViews`

### `createPostForm`

### `feedViewState`

### `groupCreateForm`, `groupSettingsForm`, `groupPictureForm`

### `me`

### `pageView`

### `postViews`

### `groupRequests`, `userRequests`, `sentRequests`

### `signInForm`

### `signUpForm`

### `userCardView`

### `userSettingsForm`, `userPictureForm`, `frontendPreferencesForm`, `passwordForm`

### `userViews`


## Miscellanea

### `routing: routerReducer`

### `serverError`
### `userErrors`
### `groupSettings`
### `routeLoadingState`
### `singlePostId`
### `usernameSubscribers`
### `usernameSubscriptions`
### `usernameBlockedByMe`
