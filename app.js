const http = require("http");
const fs = require("fs");
const he = require("he");

const express = require("express");
const multer = require("multer");
const csv = require("fast-csv");

const upload = multer({ dest: "tmp/csv/" });
const app = express();
const server = http.createServer(app);
const port = 3000;

const { Sequelize, DataTypes, Op } = require("sequelize");

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

      /*
        1. Remove # at start
        2. Check alphanumeric valid for id, login
        3. Check positive number for salary
      */

      // Removes # at start
      let nonCommentedRows = fileRows.filter((rowArr) => rowArr[0][0] !== "#");
      console.log(nonCommentedRows);

      // Check alphanumeric for id
      const regexAlphaNumeric = RegExp(/^[a-z0-9]+$/i);
      const regexNumeric = RegExp(/^\-?[0-9]+(e[0-9]+)?(\.[0-9]+)?$/);
      const hasInvalidId = nonCommentedRows.filter(
        (rowArr) =>
          !(
            regexAlphaNumeric.test(rowArr[0]) &&
            regexAlphaNumeric.test(rowArr[1]) &&
            regexNumeric.test(rowArr[3]) &&
            parseFloat(rowArr[3]) >= 0
          )
      );

      if (hasInvalidId.length > 0) {
        res.status(500);
        res.send("Invalid CSV Data");
        return;
      }

      let temp = nonCommentedRows[0];

      try {
        const result = await dbInstance.transaction(async (t) => {
          const result = await users.findAll({
            where: {
              id: temp[0],
            },
          });

          if (result.length === 0) {
            const user = await users.create(
              {
                id: temp[0],
                login: temp[1],
                name: temp[2],
                salary: parseFloat(temp[3]),
              },
              { transaction: t }
            );
          } else {
            const possibleConflict = await users.findAll({
              where: {
                login: temp[1],
              },
            });
            if (complexResult.length === 0) {
              const user = await users.upsert(
                {
                  id: temp[0],
                  login: temp[1],
                  name: temp[2],
                  salary: parseFloat(temp[3]),
                },
                { transaction: t }
              );
            } else {
              /* Login exist alr, therefore, conflict,
                1. Change possibleConflict to temp id
                2. Change 
                ???
              */
            }
          }

          await t.commit();
        });
      } catch (error) {
        console.log(error);
        res.status(500);
        res.send(error);
      }

      // try {
      //   const result = await dbInstance.transaction(async (t) => {
      //     /*
      //       First, we need to check if the id exist
      //         If it does not, we can just insert
      //         If it does, then complex case.
      //           If there is no common login, update
      //           If there is a common login, swap
      //     */
      //     const result = await users.findAll({
      //       where: {
      //         id: temp[0],
      //       },
      //     });
      //     if (result.length === 0) {
      //       // If it does not exist, we can just insert
      //       console.log("case 1");
      //       const user = await users.create(
      //         {
      //           id: temp[0],
      //           login: temp[1],
      //           name: temp[2],
      //           salary: parseFloat(temp[3]),
      //         },
      //         { transaction: t }
      //       );
      //     } else {
      //       // It exist, complex case
      //       const complexResult = await users.findAll({
      //         where: {
      //           login: temp[1],
      //         },
      //       });
      //       console.log(complexResult);

      //       if (complexResult.length === 0 || complexResult[0].id === temp.id) {
      //         // If there is no common login, update
      //         console.log("case 2");
      //         const user = await users.upsert(
      //           {
      //             id: temp[0],
      //             login: temp[1],
      //             name: temp[2],
      //             salary: parseFloat(temp[3]),
      //           },
      //           { transaction: t }
      //         );
      //       } else {
      //         // I have found a case where there exist a login that belongs to a different id;
      //         // Handle swaps
      //         console.log("case 3");

      //         const tempId = 99;
      //         const oldData = complexResult[0];
      //         console.log(oldData);
      //         const user = await users.update(
      //           {
      //             id: tempId,
      //           },
      //           {
      //             where: {
      //               id: oldData.id,
      //             },
      //             transaction: t,
      //           }
      //         );

      //         const newUser = await users.create(
      //           {
      //             id: temp[0],
      //             login: temp[1],
      //             name: temp[2],
      //             salary: parseFloat(temp[3]),
      //           },
      //           { transaction: t }
      //         );

      //         const updateTemp = await users.update(
      //           {
      //             id: oldData[0],
      //           },
      //           {
      //             where: {
      //               id: tempId,
      //             },
      //             transaction: t,
      //           }
      //         );
      //       }
      //     }
      //     await t.commit();
      //   });
      // } catch (error) {
      //   console.log(error);
      //   res.status(500);
      //   res.send(error);
      // }
    });
});

app.get("/users/count", async (req, res) => {
  const { minSalary, maxSalary } = req.query;
  if (!minSalary || !maxSalary) {
    res.status(400);
    res.send("Missing Request Params");
    return;
  }

  const regexNumeric = RegExp(/^\-?[0-9]+(e[0-9]+)?(\.[0-9]+)?$/);

  if (
    !regexNumeric.test(minSalary) ||
    !regexNumeric.test(maxSalary) ||
    parseFloat(minSalary) < 0 ||
    parseFloat(minSalary) > parseFloat(maxSalary)
  ) {
    res.status(400);
    res.send("Invalid Request Params 3");
    return;
  }

  const dbResults = await users.count({
    where: {
      salary: {
        [Op.between]: [
          parseFloat(req.query.minSalary),
          parseFloat(req.query.maxSalary),
        ],
      },
    },
  });

  res.send({
    results: dbResults,
  });
});

app.get("/users", async (req, res) => {
  const { minSalary, maxSalary, offset, limit, sort } = req.query;
  if (!minSalary || !maxSalary || !offset || !limit || !sort) {
    res.status(400);
    res.send("Missing Request Params");
    return;
  }

  const regexNumeric = RegExp(/^\-?[0-9]+(e[0-9]+)?(\.[0-9]+)?$/);

  // Due to how + signs get ignored for some reason, I am assuming something
  // If no sign is given, asc is default.
  // If - sign is given, desc is adopted.
  const parsedFilter = he.decode(sort);
  console.log(parsedFilter);

  if (parsedFilter[0] === "+") {
    qtn = sort.substr(1, sort.length);
    sortBy = "ASC";
  } else if (parsedFilter[0] === "-") {
    qtn = sort.substr(1, sort.length);
    sortBy = "DESC";
  } else {
    res.status(400);
    res.send("Invalid Request Params 1");
    return;
  }
  // let qtn = "";
  // let sortBy; // true - asc, false = desc;
  // if (sort[0] === " ") {
  //   qtn = sort.substr(1, sort.length);
  //   sortBy = "ASC";
  // } else if (sort[0] === "-") {
  //   qtn = sort.substr(1, sort.length);
  //   sortBy = "DESC";
  // } else {
  //   res.status(400);
  //   res.send("Invalid Request Params 1");
  //   return;
  // }

  if (
    !(qtn === "name" || qtn === "id" || qtn === "salary" || qtn === "login")
  ) {
    res.status(400);
    res.send("Invalid Request Params 2");
    return;
  }

  if (
    !regexNumeric.test(minSalary) ||
    !regexNumeric.test(maxSalary) ||
    !regexNumeric.test(offset) ||
    !regexNumeric.test(limit) ||
    parseFloat(offset) < 0 ||
    parseFloat(limit) > 30 ||
    parseFloat(minSalary) < 0 ||
    parseFloat(minSalary) > parseFloat(maxSalary)
  ) {
    res.status(400);
    res.send("Invalid Request Params 3");
    return;
  }

  const dbResults = await users.findAll({
    where: {
      salary: {
        [Op.between]: [
          parseFloat(req.query.minSalary),
          parseFloat(req.query.maxSalary),
        ],
      },
    },
    limit: parseFloat(req.query.limit),
    offset: parseFloat(req.query.offset),
    order: [[qtn, sortBy]],
  });

  const results = {
    results: dbResults.map((dbRow) => ({
      id: dbRow.id,
      name: dbRow.name,
      login: dbRow.login,
      salary: dbRow.salary,
    })),
  };

  console.log(results);
  res.send(results);
});

app.get("/fakedata", async (req, res) => {
  let precision = 100; // 2 decimals
  function makeid(length) {
    var result = "";
    var characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

  const mockData = () => {
    let randomnum =
      Math.floor(
        Math.random() * (10000 * precision - 1000 * precision) + 1 * precision
      ) /
      (1 * precision);
    return {
      id: makeid(15),
      login: makeid(15),
      name: makeid(5),
      salary: randomnum,
    };
  };

  try {
    const result = await dbInstance.transaction(async (t) => {
      const promiseArr = [];
      for (let i = 0; i < 100; i++) {
        promiseArr.push(users.create(mockData(), { transaction: t }));
      }
      await Promise.all(promiseArr);
      await t.commit();
    });
  } catch (error) {
    console.log(error);
  }
});

// Start server
function startServer() {
  server.listen(port, function () {
    console.log("Express server listening on ", port);
  });
}

setImmediate(startServer);
