const { Op } = require("sequelize");
const users = require("../models/users");

const regexAlphaNumeric = RegExp(/^[a-z0-9]+$/i);

async function postUser(req, res) {
  console.log(req.params);
  console.log(req.body);
  //   const { id } = req.params;
  //   if (!id || !regexAlphaNumeric.test(id)) {
  //     return res.status(400).json({ message: "Missing Id" });
  //   }
  //   const dbResults = await users.findOne({
  //     where: {
  //       id: {
  //         [Op.eq]: id,
  //       },
  //     },
  //   });

  //   const results = {
  //     id: dbResults.id,
  //     name: dbResults.name,
  //     login: dbResults.login,
  //     salary: dbResults.salary,
  //   };

  //   return res.status(200).json(results);
}

async function patchUser(req, res) {
  //   console.log(req.params);
  //   const { id } = req.params;
  //   if (!id || !regexAlphaNumeric.test(id)) {
  //     return res.status(400).json({ message: "Missing Id" });
  //   }
  //   const dbResults = await users.findOne({
  //     where: {
  //       id: {
  //         [Op.eq]: id,
  //       },
  //     },
  //   });
  //   const results = {
  //     id: dbResults.id,
  //     name: dbResults.name,
  //     login: dbResults.login,
  //     salary: dbResults.salary,
  //   };
  //   return res.status(200).json(results);
}

async function getUser(req, res) {
  console.log(req.params);
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
module.exports = {
  postUser,
  patchUser,
  getUser,
  deleteUser,
};
