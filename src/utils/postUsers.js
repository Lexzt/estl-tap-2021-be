const fs = require("fs");

const users = require("../models/users");
const database = require("../../config/database");

const { makeid } = require("./fakeUser");

let isUploading = false;

async function postUser(req, res) {
  const fileRows = [];
  // open uploaded file
  if (isUploading) {
    res.send("Currently Uploading Data, please wait");
    return;
  }

  const fileContents = fs.readFileSync(req.file.path);
  const lines = fileContents.toString().split(/\r?\n/);
  for (var i = 0; i < lines.length; i++) {
    const splitLines = lines[i].toString().split(",");
    if (splitLines.length === 4) {
      fileRows.push(lines[i].toString().split(","));
    }
  }

  if (fileRows.length === 0 || fileRows.length === 1) {
    return res.status(500).json({ message: "Empty File" });
  }

  fileRows.shift();

  /*
    1. Remove # at start
    2. Check alphanumeric valid for id, login
    3. Check positive number for salary
  */

  // Removes # at start
  let nonCommentedRows = fileRows.filter((rowArr) => rowArr[0][0] !== "#");

  // Check alphanumeric for id
  const regexAlphaNumeric = RegExp(/^[a-z0-9]+$/i);
  const regexNumeric = RegExp(/^\-?[0-9]+(e[0-9]+)?(\.[0-9]+)?$/);

  const hasInvalidId = nonCommentedRows.filter(
    (rowArr) =>
      !(
        regexAlphaNumeric.test(rowArr[0].trim()) &&
        regexAlphaNumeric.test(rowArr[1].trim()) &&
        regexAlphaNumeric.test(rowArr[2].trim()) &&
        regexNumeric.test(rowArr[3].trim()) &&
        parseFloat(rowArr[3].trim()) >= 0
      )
  );

  if (hasInvalidId.length > 0) {
    return res.status(500).json({ message: "File contains invalid CSV Data" });
  }

  isUploading = true;
  const t = await database.transaction();

  try {
    /*
      3 Cases

      1. ID && Login does not exist
          Create and append into DB.

      2. ID does not exist && Login exist
          Update by ID salary, name

      3. ID exist and Login is different
          Swap

          e.g.

          DB holds
          1, J, j, 1
          2, M, m, 2

          Added:
          1, M, a, 3

          Result:
          2, J, j, 1
          1, M, a, 3
      */

    const dbAppendPromises = nonCommentedRows.map(async (row) => {
      const idExist = await users.findAll({
        where: {
          id: row[0],
        },
      });

      const loginExist = await users.findAll({
        where: {
          login: row[1],
        },
      });

      if (idExist.length === 0 && loginExist.length === 0) {
        return users.create(
          {
            id: row[0],
            login: row[1],
            name: row[2],
            salary: parseFloat(row[3]),
          },
          { transaction: t }
        );
      } else {
        if (idExist.length === 0 && loginExist.length === 1) {
          return users.update(
            {
              id: row[0],
              login: row[1],
              name: row[2],
              salary: parseFloat(row[3]),
            },
            {
              where: {
                login: row[1],
              },
              transaction: t,
            }
          );
        } else {
          const tempId = makeid(15);
          await users.update(
            {
              id: tempId,
            },
            {
              where: {
                id: row[0],
              },
              transaction: t,
            }
          );

          const prevId = loginExist[0].id;
          await users.update(
            {
              id: row[0],
              login: row[1],
              name: row[2],
              salary: parseFloat(row[3]),
            },
            {
              where: {
                login: row[1],
              },
              transaction: t,
            }
          );

          return users.update(
            {
              id: prevId,
            },
            {
              where: {
                id: tempId,
              },
              transaction: t,
            }
          );
        }
      }
    });

    Promise.all(dbAppendPromises)
      .then(async (result) => {
        isUploading = false;
        await t.commit();
        return res.status(200).json({ message: "Data Uploaded" });
      })
      .catch(async (error) => {
        console.log("error ", error);
        await t.rollback();
        throw error;
      });
  } catch (error) {
    console.log(error);
    await t.rollback();
    return res.status(500).json({ message: error });
  }
}

module.exports = postUser;
