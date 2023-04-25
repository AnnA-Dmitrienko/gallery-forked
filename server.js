const HTTP_PORT = process.env.PORT || 3000;

const express = require("express");
const app = express();
const fs = require("fs");
const cookieParser = require("cookie-parser");
const session = require("client-sessions"); //	require client-sessions to establish session using cookie
const exphbs = require("express-handlebars"); //	require handlebars as templating engine
const path = require("path");
const randomStr = require("randomstring");
const bodyParser = require("body-parser");
const favicon = require("serve-favicon"); //  Import to insert favourite icon
// Require the MongoDB driver
const MongoClient = require("mongodb").MongoClient;
// MongoDB connection URL and database name
const uri = "XXX";
const dbName = "mongodatabase";
///////
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

//import external routes- for order logic
const orderRouter = require("./routes/order");
app.use("/order", orderRouter);
app.use(favicon(__dirname + "/favicon.ico")); //  Insert favourite icon

//express handlebars definitions
app.engine(
  ".hbs",
  exphbs.engine({
    extname: ".hbs",
    defaultLayout: false,
    layoutsDir: path.join(__dirname, "/views"),
  })
);
app.set("view engine", ".hbs");

// parsing the incoming data
app.use(express.json()); //  support json encoded bodies
app.use(express.urlencoded({ extended: true }));

// cookie parser middleware
app.use(cookieParser());

app.use("/", express.static("public"));
app.use("/images", express.static(__dirname + "/images"));

//generate random string for the secret
var strRandom = randomStr.generate();

//Configure client sessions middleware
app.use(
  session({
    cookieName: "MySession",
    secret: "fgrfrty84fwir767", //to authenticate the session
    //secret: strRandom, //to authenticate the session USING RANDOM STRING
    duration: 5 * 60 * 1000, //	5 minutes
    activeDuration: 1 * 60 * 1000, //	1 minutes - add 1 min if active
    httpOnly: true,
    secure: true,
    ephemeral: true,
  })
);

//parse info from json user file into an obj
var userObj = JSON.parse(fs.readFileSync("./user.json"));
let userFromObj = [];
for (var user in userObj) {
  userFromObj.push(user);
}

let passFromObj = [];
for (var pass in userObj) {
  passFromObj.push(userObj[pass]);
}

// global variables
let sess;
let lines = [];
let choice;

app.get("/", async (req, res) => {
  try {
    await client.connect();
    const db = client.db("mongodatabase");
    //console.log("logging out!!");
    const collection = db.collection("pictures");
    let output = await collection.updateMany(
      { status: { $eq: "S" } },
      { $set: { status: "A" } }
    );

    let result = await collection
      .find({ status: "A" }, { filename: 1, id: 0 })
      .toArray();

    let filenames = result.map((doc) => doc.filename.replace(".jpg", ""));

    lines.length = 0;
    // Add the filenames array to the global lines array
    lines.push(...filenames);

    res.render("login");
  } catch (err) {
    console.log(err);
  } finally {
    await client.close();
  }
});

async function database() {
  let db, result, docGallery;
  // Connect to the MongoDB server
  const client = await MongoClient.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  try {
    const client = await MongoClient.connect(uri);
    db = client.db("mongodatabase");
  } catch (err) {
    console.log(`err = ${err}`);
  }
  //INITIAL DATA LOAD- DONE ONCE
  // try {
  //   result = await db.collection("pictures").deleteMany({});
  //   console.log(
  //     `Number of picture documents deleted from collection: ${result.deletedCount}`
  //   );
  // } catch (err) {
  //   console.log(`err = ${err}`);
  // }

  // docGallery = [
  //   {
  //     filename: "BottleOfWine.jpg",
  //     description: "A nice bottle of red wine",
  //     price: 1500,
  //     status: "A",
  //   },
  //   {
  //     filename: "ChristmasOrnament.jpg",
  //     description: "A lovely ornament for Christmas",
  //     price: 600,
  //     status: "A",
  //   },
  //   {
  //     filename: "ChristmasTree.jpg",
  //     description: "The perfect tree for you!",
  //     price: 300,
  //     status: "A",
  //   },
  //   {
  //     filename: "FlowersBouquette.jpg",
  //     description: "Lovely flowers arrangement",
  //     price: 70,
  //     status: "A",
  //   },
  //   {
  //     filename: "GlassOfWine.jpg",
  //     description: "Red wine from our special winery",
  //     price: 550,
  //     status: "A",
  //   },
  //   {
  //     filename: "Grapes.jpg",
  //     description: "The grapes that make our wine",
  //     price: 200,
  //     status: "A",
  //   },
  //   {
  //     filename: "Hands.jpg",
  //     description: "A picture of hands that made it all",
  //     price: 430,
  //     status: "A",
  //   },
  //   {
  //     filename: "Kitten.jpg",
  //     description: "Our kitten, lives in backyard",
  //     price: 1500,
  //     status: "A",
  //   },
  //   {
  //     filename: "PaintBrush.jpg",
  //     description: "The paint brush of the artist!",
  //     price: 750,
  //     status: "A",
  //   },
  //   {
  //     filename: "Roses.jpg",
  //     description: "The perfect roses from our garden",
  //     price: 790,
  //     status: "A",
  //   },
  // ];

  // try {
  //   result = await db.collection("pictures").insertMany(docGallery);
  //   console.log(
  //     `Number of photos inserted to collection: ${result.insertedCount}`
  //   );
  // } catch (err) {
  //   console.log(`err = ${err}`);
  // }

  //select first field and create image list
  try {
    // Select the database to use
    const db = client.db(dbName);
    // Select the collection to use
    const collection = db.collection("pictures");
    // Retrieve an array of filenames from all documents in the collection
    let result = await collection
      .find({ status: "A" }, { filename: 1, _id: 0 })
      .toArray();
    // Extract the filenames from the result array
    let filenames = result.map((doc) => doc.filename.replace(".jpg", ""));
    // Add the filenames array to the global lines array
    lines.push(...filenames);
    //console.log(lines);
  } catch (err) {
    console.log(`err = ${err}`);
  } finally {
    // Close the MongoDB connection
    client.close();
  }
}
database().catch(console.error);

//login
app.post("/", (req, res) => {
  if (
    userFromObj.indexOf(req.body.username) > -1 &&
    passFromObj.indexOf(req.body.password) > -1 &&
    userFromObj.indexOf(req.body.username) ==
      passFromObj.indexOf(req.body.password)
    //check that key value pairs match
  ) {
    sess = req.MySession;
    sess.userid = req.body.username;
    //sess.password = req.body.password;
    //console.log(req.MySession);
    credentialUnput = sess.userid;
    photos = {
      title: lines,
      credentials: credentialUnput,
    };

    res.render("main", {
      data: photos,
    });
  } else if (sess) {
    let choice = req.body.image;
    console.log(choice); // Check if choice is received correctly
    var credentialUnput = sess.userid;
    photos = {
      imgName: choice,
      title: lines,
      credentials: credentialUnput,
    };

    res.render("main", {
      data: photos,
    });
  } else if (
    userFromObj.indexOf(req.body.username) == -1 &&
    req.body.username != null
  ) {
    var errorUser = {
      invalidUser: "Not a registered username",
      userValue: req.body.username,
      userPass: req.body.password,
    };
    res.render("login", {
      data: errorUser,
    });
  } else if (
    userFromObj.includes(req.body.username) &&
    !passFromObj.includes(req.body.password)
  ) {
    var errorPassword = {
      invalidPassword: "Invalid password",
      userValue: req.body.username,
      userPass: req.body.password,
    };
    res.render("login", {
      data: errorPassword,
    });
    //in case we are logged out and try to submit a request
  } else {
    res.render("login");
  }
});

//register
app.get("/register", (req, res) => {
  const referer = req.headers.referer;
  if (referer && referer.endsWith("/")) {
    res.render("register");
  } else {
    res.redirect("/");
  }
});

app.post("/register", (req, res) => {
  if (userFromObj.includes(req.body.username)) {
    var dupUser = {
      duplicateUser: "Duplicate username",
      emailValue: req.body.username,
      userPass: req.body.password,
      confirmPassword: req.body.confirmPassword,
    };
    res.render("register", {
      data: dupUser,
    });
  } else if (
    !userFromObj.includes(req.body.username) &&
    req.body.password.length < 8
  ) {
    var passLength = {
      invalidPassword: "Password must be at least eight characters",
      emailValue: req.body.username,
      userPass: req.body.password,
      confirmPassword: req.body.confirmPassword,
    };
    res.render("register", {
      data: passLength,
    });
  } else if (
    !userFromObj.includes(req.body.username) &&
    req.body.password.length >= 8 &&
    req.body.password != req.body.confirmPassword
  ) {
    var passMatch = {
      matchPassword: "Passwords do not match",
      emailValue: req.body.username,
      userPass: req.body.password,
      confirmPassword: req.body.confirmPassword,
    };
    res.render("register", {
      data: passMatch,
    });
  } else if (
    !userFromObj.includes(req.body.username) &&
    req.body.password.length >= 8 &&
    req.body.password == req.body.confirmPassword
  ) {
    //add to the credentials array
    //console.log(userFromObj);
    userFromObj.push(req.body.username);
    passFromObj.push(req.body.password);
    var updatedUser = {};
    userFromObj.forEach((user, i) => (updatedUser[user] = passFromObj[i]));
    //console.log(updatedUser);
    userObj = updatedUser;
    //console.log(userObj);

    fs.writeFile("user.json", JSON.stringify(userObj, null, 4), function (err) {
      if (err) throw err;
      console.log("File successfully updated.");
    });

    res.render("login");
  }
});

app.post("/order", async (req, res) => {
  choice = req.body.image;
  console.log(choice);
  try {
    await client.connect();
    const db = client.db("mongodatabase");
    const collection = db.collection("pictures");

    const data = await collection.findOne({ filename: choice });
    if (data) {
      // The corresponding image was found
      data.filename = data.filename.replace(".jpg", "");

      res.render("order", { data: data });
    } else {
      // The corresponding image was not found
      console.log(`No image found with name ${choice}`);
      res.render("order", { data: data });
    }
  } catch (err) {
    console.log(err);
    res.render("order", { message: err.message });
  } finally {
    await client.close();
  }
});

app.post("/backfrompurchase", async (req, res) => {
  credentialUnput = sess.userid;
  try {
    await client.connect();
    const db = client.db("mongodatabase");
    const collection = db.collection("pictures");
    //update status  to "S"
    const output = await collection.updateOne(
      { filename: choice },
      { $set: { status: "S" } }
    );
    // console.log(output);
    let choice_trim = choice.replace(".jpg", "");
    //console.log(choice_trim);
    let index = lines.indexOf(choice_trim);
    lines.splice(index, 1);
    // if (output.modifiedCount > 0) {
    //   console.log(`Successfully updated the status of ${choice} to S`);
    // } else {
    //   console.log(`No image found with name ${choice}`);
    // }
    photos = {
      title: lines,
      credentials: credentialUnput,
    };
    res.render("main", {
      data: photos,
    });
  } catch (err) {
    console.log(err);
  } finally {
    await client.close();
  }
});

app.get("/logout", async (req, res) => {
  choice = req.body.image;
  try {
    await client.connect();
    const db = client.db("mongodatabase");
    //console.log("logging out!!");
    const collection = db.collection("pictures");
    //update status "S" to "A" when logging out
    let output = await collection.updateMany(
      { status: { $eq: "S" } },
      { $set: { status: "A" } }
    );

    let result = await collection
      .find({ status: "A" }, { filename: 1, id: 0 })
      .toArray();

    let filenames = result.map((doc) => doc.filename.replace(".jpg", ""));

    lines.length = 0;
    lines.push(...filenames);

    req.MySession.destroy(sess);
    //req.MySession.reset(sess);
    sess = null;
    //res.send('cookie sess cleared');
    res.redirect("/");
  } catch (err) {
    console.log(err);
  } finally {
    await client.close();
  }
});

//catch undefined endpoints
app.get("*", (req, res) => {
  //  Route wildcard (*): localhost:3000/undefined endpoint
  res.send(`<h1 style='color: #ff00ff;'>BAD ROUTE! Fix your URL.</h1>`);
});

const server = app.listen(HTTP_PORT, function () {
  console.log(`Listening on port ${HTTP_PORT}`);
});
