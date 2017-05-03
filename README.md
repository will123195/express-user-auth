# express-semantic-auth

Simple user authentication for your Express app

- Responsive Semantic UI
- Works with any database
- Login with email, Facebook, Twitter, Google, or Github

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
  authenticate, // required
  getUserById, // required
  setPassword, // required
  createUser, // required
  updateUser, // required
  facebook,
  twitter,
  google
}));

app.listen(3000);
```

## Screenshots




