const express = require('express');
const session = require('express-session');
const app = express();
// const port = 5000;
const port = process.env.PORT || 5000;
app.use(express.static('public'));

app.use(
  session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 1 * 60 * 60 * 1000 },
  })
);

app.get('/query', function (req, res) {
  let modelID = req.query.carModel;
  console.log(req.sessionID);
  if (!req.session.cart) {
    req.session.cart = [];
  }
  if (!req.session.cart.includes(modelID)) {
    req.session.cart.push(modelID);
  }
  console.log(req.session.cart);
  res.send('Added to the cart successfully.');
});

app.get('/delete', function (req, res) {
  let modeltoDelete = req.query.deleteModel;
  req.session.cart = req.session.cart.filter(
    (element) => element !== modeltoDelete
  );
  console.log(req.session.cart);
  res.end();
});

app.get('/reservation', function (req, res) {
  res.send(req.session.cart);
});

app.get('/checkout', function (req, res) {
  res.send(req.query);
});

app.get('/clearcart', function (req, res) {
  req.session.destroy();
});

// start the Express server
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
