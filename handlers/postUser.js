const multer = require("multer");
const csv = require("fast-csv");
const fs = require("fs");
const upload = multer({ dest: "tmp/csv/" });

const users = require("../models/users").users;
const database = require("../config/database").database;

async function postUser(req, res) {
  const fileRows = [];

  // open uploaded file
  csv
    .parseFile(req.file.path)
    .on("data", function (data) {
      fileRows.push(data);
    })
    .on("end", async () => {
      if (fileRows.length === 0 || fileRows.length === 1) {
        res.status(500);
        res.send("Error: Empty File");
        return;
      }

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

      let temp = nonCommentedRows[5];
      const t = await database.transaction();
      try {
        const result = await users.findAll({
          where: {
            id: temp[0],
          },
          lock: true,
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
          console.log("case 1");
        } else {
          const possibleConflict = await users.findAll({
            where: {
              login: temp[1],
            },
            lock: true,
          });
          if (possibleConflict.length === 0) {
            const user = await users.upsert(
              {
                id: temp[0],
                login: temp[1],
                name: temp[2],
                salary: parseFloat(temp[3]),
              },
              { transaction: t }
            );
            console.log("case 2");
          } else {
            /* Login exist alr, therefore, conflict,
                1. Change possibleConflict to temp id
                2. Change 
                ???
              */
            console.log("case 3");
          }
        }

        setTimeout(async () => {
          console.log("hello commited!");
          await t.commit();
          res.send("Updated!");
        }, 15000);

        // const result = await dbInstance.transaction(async (t) => {
        //   const result = await users.findAll({
        //     where: {
        //       id: temp[0],
        //     },
        //   });

        //   if (result.length === 0) {
        //     const user = await users.create(
        //       {
        //         id: temp[0],
        //         login: temp[1],
        //         name: temp[2],
        //         salary: parseFloat(temp[3]),
        //       },
        //       { transaction: t }
        //     );
        //   } else {
        //     const possibleConflict = await users.findAll({
        //       where: {
        //         login: temp[1],
        //       },
        //     });
        //     if (possibleConflict.length === 0) {
        //       const user = await users.upsert(
        //         {
        //           id: temp[0],
        //           login: temp[1],
        //           name: temp[2],
        //           salary: parseFloat(temp[3]),
        //         },
        //         { transaction: t }
        //       );
        //     } else {
        //       /* Login exist alr, therefore, conflict,
        //         1. Change possibleConflict to temp id
        //         2. Change
        //         ???
        //       */
        //     }
        //   }

        //   setTimeout(async () => {
        //     console.log("hello commited!");
        //     await t.commit();
        //   }, 15000);
        // });
      } catch (error) {
        await t.rollback();
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
}

module.exports = {
  postUser,
};
