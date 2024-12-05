const express = require("express");
const app = express();
const dotenv = require("dotenv");
dotenv.config();
const { dbConnection } = require("./config/database");
dbConnection();
const fileUpload = require("express-fileupload");

const path = require('path');
app.use(
  fileUpload({
    useTempFiles: true, 
    tempFileDir: path.join(__dirname, 'tmp'), // Use local tmp directory
  })
);


app.use(express.json());
app.use(express.static(__dirname + "/public"));

app.use(`/${process.env.STUDENT_ID}`, require("./routes/content"));
app.use(`/${process.env.STUDENT_ID}`, require("./routes/follow"));
app.use(`/${process.env.STUDENT_ID}`, require("./routes/user"));

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/public/index.html");
});

app.listen(5000, function () {
  console.log("Server is running");
});
