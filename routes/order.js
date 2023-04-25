const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
// Require the MongoDB driver
const MongoClient = require("mongodb").MongoClient;
// MongoDB connection URL and database name
const uri = "XXX";
const dbName = "mongodatabase";
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// const choice = require("../server");
// console.log(typeof choice);

const preventDirectAccess = (req, res) => {
  res.redirect("/");
};
router.get("/", preventDirectAccess, (req, res) => {
  res.render("order");
});

// router.post("/", async (req, res) => {
//     // choice= data;
//   // choice = "Hands.jpg";
//   // //req.session.choice = choice; // Remember the choice in the session
//   // console.log(choice);
//   try {
//     await client.connect();
//     const db = client.db("mongodatabase");
//     const collection = db.collection("pictures");

//     const data = await collection.findOne({ filename: choice});
//     //console.log(data);

//     if (data) {
//       // The corresponding image was found
//       data.filename = data.filename.replace(".jpg", "");

//       res.render("order", { data: data });
//     } else {
//       // The corresponding image was not found
//       console.log(`No image found with name ${choice}`);
//       res.render("order", { data: data });
//     }
//   } catch (err) {
//     console.log(err);
//     res.render("order", { message: err.message });
//   } finally {
//     await client.close();
//   }
// });

module.exports = router;
