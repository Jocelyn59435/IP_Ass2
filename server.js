const express = require("express");
const session = require("express-session");
const cookieParser = require('cookie-parser');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.static("public"));

app.use(cookieParser());
app.use(
  session({
    secret: "keyboard cat",
    resave: true,
    saveUninitialized: false ,
    // maxAge: 1*60*60*1000,
    cookie: { secure: false, maxAge: new Date(Date.now() + 1*60*60*1000)}
  })
);

app.get("/query", function (req, res) {
  let modelID = req.query.carModel;
  console.log(req.sessionID);
  if(!req.session.cart){
    req.session.cart = [];
  }
  if (!req.session.cart.includes(modelID)){
    req.session.cart.push(modelID);
  }
  console.log(req.session.cart);
  res.end();
});

app.get("/delete", function (req, res) {
  let modeltoDelete = req.query.deleteModel;
  req.session.cart = req.session.cart.filter(element => element !== modeltoDelete);
  console.log(req.session.cart);
  res.end();
});

app.get("/reservation", function (req, res) {
  res.send(req.session.cart);
});

app.get("/checkout", function (req, res) {
  res.send(req.query);
});

// start the Express server
const server = app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});

