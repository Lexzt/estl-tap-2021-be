const { Op } = require("sequelize");
const users = require("../models/users");
const database = require("../../config/database");

const regexAlphaNumeric = RegExp(/^[a-z0-9]+$/i);
const regexNumeric = RegExp(/^\-?[0-9]+(e[0-9]+)?(\.[0-9]+)?$/);

async function postUser(req, res) {
  // Check if ID is valid
  const { id } = req.params;
  const { login, name, salary } = req.body;

  let salaryCheck;
  if (typeof salary === "string") {
    salaryCheck = parseFloat(salary.trim()) >= 0;
  } else {
    salaryCheck = salary >= 0;
  }

  if (
    !(
      regexAlphaNumeric.test(id.trim()) &&
      regexAlphaNumeric.test(login.trim()) &&
      regexAlphaNumeric.test(name.trim()) &&
      regexNumeric.test(salary) &&
      salaryCheck
    )
  ) {
    return res.status(400).json({ message: "Invalid Body" });
  }
  const t = await database.transaction();
  try {
    // Check if Name or ID exist in DB
    const dbResults = await users.findAll({
      where: {
        [Op.or]: [
          {
            id: {
              [Op.eq]: id,
            },
            login: {
              [Op.eq]: login,
            },
          },
        ],
      },
    });

    if (dbResults.length > 0) {
      return res
        .status(400)
        .json({ message: "Overlapping/Non-unique ID/Name" });
    }

    const createResult = await users.create(
      {
        id: id,
        login: login,
        name: name,
        salary: parseFloat(salary),
      },
      { transaction: t }
    );

    const results = {
      id: createResult.id,
      name: createResult.name,
      login: createResult.login,
      salary: createResult.salary,
    };
    await t.commit();
    return res.status(200).json(results);
  } catch (error) {
    console.log(error);
    await t.rollback();
    return res.status(400).json({ message: error });
  }
}

async function patchUser(req, res) {
  // Check if ID is valid
  const { id } = req.params;
  const { login, name, salary } = req.body;

  let salaryCheck;
  if (typeof salary === "string") {
    salaryCheck = parseFloat(salary.trim()) >= 0;
  } else {
    salaryCheck = salary >= 0;
  }

  if (
    !(
      regexAlphaNumeric.test(id.trim()) &&
      regexAlphaNumeric.test(login.trim()) &&
      regexAlphaNumeric.test(name.trim()) &&
      regexNumeric.test(salary) &&
      salaryCheck
    )
  ) {
    return res.status(400).json({ message: "Invalid Body" });
  }

  const t = await database.transaction();

  try {
    // Check if ID exist in DB
    const idResults = await users.findAll(
      {
        where: {
          id: {
            [Op.eq]: id,
          },
        },
      },
      { transaction: t }
    );
    if (idResults.length === 0) {
      return res.status(400).json({ message: "Missing/Invalid ID" });
    }

    // Check if login exist in DB
    const loginResults = await users.findAll(
      {
        where: {
          login: {
            [Op.eq]: login,
          },
        },
      },
      { transaction: t }
    );

    if (loginResults[0].id !== idResults[0].id) {
      return res.status(400).json({ message: "Overlapping/Non-unique Login" });
    }

    const updateResult = await users.update(
      {
        id: id,
        login: login,
        name: name,
        salary: parseFloat(salary),
      },
      {
        where: {
          id: id,
        },
        transaction: t,
      }
    );

    const results = {
      id: updateResult.id,
      name: updateResult.name,
      login: updateResult.login,
      salary: updateResult.salary,
    };
    await t.commit();
    return res.status(200).json(results);
  } catch (error) {
    console.log(error);
    await t.rollback();
    return res.status(400).json({ message: error });
  }
}

async function getUser(req, res) {
  const { id } = req.params;
  if (!id || !regexAlphaNumeric.test(id)) {
    return res.status(400).json({ message: "Missing Id" });
  }
  const dbResults = await users.findOne({
    where: {
      id: {
        [Op.eq]: id,
      },
    },
  });

  const results = {
    id: dbResults.id,
    name: dbResults.name,
    login: dbResults.login,
    salary: dbResults.salary,
  };

  return res.status(200).json(results);
}

async function deleteUser(req, res) {
  const { id } = req.params;
  if (!id || !regexAlphaNumeric.test(id)) {
    return res.status(400).json({ message: "Missing Id" });
  }
  const dbResults = await users.findOne({
    where: {
      id: {
        [Op.eq]: id,
      },
    },
  });

  const nameForPrint = dbResults.name;
  await dbResults.destroy();
  return res.status(200).json({ message: `${id} - ${nameForPrint} Deleted` });
}

// async function fakedata(req, res) {
//   let precision = 100; // 2 decimals
//   function makeid(length) {
//     var result = "";
//     var characters =
//       "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
//     var charactersLength = characters.length;
//     for (var i = 0; i < length; i++) {
//       result += characters.charAt(Math.floor(Math.random() * charactersLength));
//     }
//     return result;
//   }

//   const mockData = () => {
//     let randomnum =
//       Math.floor(
//         Math.random() * (10000 * precision - 1000 * precision) + 1 * precision
//       ) /
//       (1 * precision);
//     return {
//       id: makeid(15),
//       login: makeid(15),
//       name: makeid(5),
//       salary: randomnum,
//     };
//   };

//   const t = await database.transaction();
//   try {
//     const promiseArr = [];
//     for (let i = 0; i < 100; i++) {
//       promiseArr.push(users.create(mockData(), { transaction: t }));
//     }
//     await Promise.all(promiseArr);
//     await t.commit();
//   } catch (error) {
//     console.log(error);
//     await t.rollback();
//   }
// }

module.exports = {
  postUser,
  patchUser,
  getUser,
  deleteUser,
  //   fakedata,
};
