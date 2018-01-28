# express-user-auth

Quickly add user authentication to your Express app

- Works with any database
- Passwords stored using bcrypt
- TODO: Login with Facebook, Twitter, Google, or Github

## Install 

```
npm i express express-user-auth
```

## Usage

```js
import express from 'express'
import auth from 'express-user-auth'
 
const app = express()
 
app.use('/', auth({
  secret: 'abcdef',
  createUser: function (user) { return user },
  getUserByUsername: function (username) { return user },
  updateUser: function (data) { return user }
}))

app.listen(3000)
```

## Routes

`express-user-auth` creates the following routes:

- `GET /login`
- `POST /login`
- `GET /register`
- `POST /register`

## Screenshots




