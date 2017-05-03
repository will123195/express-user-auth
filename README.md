# express-semantic-auth
User authentication for your express app

## Install 

```
npm i --save express-semantic-auth
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

app.listen();
```

## Quick Start

Mounting this express app gives you the following functionality:

UI:
- Login `/login`
- Logout `/logout`
- Forgot Password `/forgot-password`
- Register `/register`

REST API
- 
