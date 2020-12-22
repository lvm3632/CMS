const express = require("express");
const app = express();
const path = require("path");
const exphbs = require("express-handlebars");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const methodOverride = require("method-override");

const {
  allowInsecurePrototypeAccess,
} = require("@handlebars/allow-prototype-access");
const Handlebars = require("handlebars");

mongoose.Promise = global.Promise;

mongoose
  .connect("mongodb://localhost:27017/cms")
  .then((db) => {
    console.log("Mongo connected");
  })
  .catch((error) => console.log(error));

app.use(express.static(path.join(__dirname, "public")));

// Set View Engine

const { select } = require("./helpers/handlebars-helpers");

app.engine(
  "handlebars",
  exphbs({
    handlebars: allowInsecurePrototypeAccess(Handlebars),
    defaultLayout: "home",
    helpers: { select: select },
  })
);
app.set("view engine", "handlebars");

// Body Parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Method Override
app.use(methodOverride("_method"));

// Load Routes

const home = require("./routes/home/index");
const admin = require("./routes/admin/index");
const posts = require("./routes/admin/posts");
// Use Routes

app.use("/", home);
app.use("/admin", admin);
app.use("/admin/posts", posts);

app.listen(4500, () => {
  console.log(`listening on port 4500`);
});
