# express-semantic-auth

Simple user authentication for your Express app

- Responsive Semantic UI
- Works with any database
- TODO: Login with email, Facebook, Twitter, Google, or Github

## Install 

```
npm install express
npm install express-semantic-auth
```

## Usage

```js
import express from 'express';
import auth from 'express-semantic-auth';
 
const app = express();
 
app.use('/', auth({
  authenticate: function (username, password) { return true }, // required
  createUser: function (user) { return user }, // required
  forgotPassword: function (email) { return true } // required
}));

app.listen(3000);
```

## Screenshots




