const http = require("http");
const fs = require("fs");

const express = require("express");
const multer = require("multer");
const csv = require("fast-csv");

const Router = express.Router;
const upload = multer({ dest: "tmp/csv/" });
const app = express();
const router = new Router();
const server = http.createServer(app);
const port = 3000;

const { Sequelize, DataTypes } = require("sequelize");

// app.get("/", (req, res) => {
//   res.send("Hello World!");
// });

const dbInstance = new Sequelize(
  "mysql://root:Webcast.ly695@sys.cwwkcgormh6v.ap-southeast-1.rds.amazonaws.com:3306/estl"
);

const users = dbInstance.define("users", {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false,
    unique: true,
  },
  login: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  salary: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});

const init = async () => {
  try {
    await dbInstance.authenticate();
    console.log("Connection has been established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
};
init();

app.post("/", upload.single("file"), (req, res) => {
  const fileRows = [];
  console.log(csv);

  // open uploaded file
  csv
    .parseFile(req.file.path)
    .on("data", function (data) {
      fileRows.push(data);
    })
    .on("end", async () => {
      console.log(fileRows);
      fs.unlinkSync(req.file.path);

      fileRows.shift(); // removes headers
      const filteredRows = fileRows.filter(
        (row) =>
          !(
            row.map((e) => e.includes("#")).filter((e) => e === true).length > 0
          )
      );
      console.log(filteredRows);

      let temp = filteredRows[0];
      console.log(temp);
      try {
        const result = await dbInstance.transaction(async (t) => {
          const user = await users.create(
            {
              id: temp[0],
              login: temp[1],
              name: temp[2],
              salary: parseFloat(temp[3]),
            },
            { transaction: t }
          );
          return user;
        });
      } catch (error) {
        console.log(error);
      }
    });
  res.send("Hello World!");
});

app.use("/upload-csv", router);

// Start server
function startServer() {
  server.listen(port, function () {
    console.log("Express server listening on ", port);
  });
}

setImmediate(startServer);
