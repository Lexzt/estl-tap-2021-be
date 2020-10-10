const { Op } = require("sequelize");
const he = require("he");
const users = require("../models/users").users;

const regexNumeric = RegExp(/^\-?[0-9]+(e[0-9]+)?(\.[0-9]+)?$/);

async function getUserCount(req, res) {
  const { minSalary, maxSalary } = req.query;
  if (!minSalary || !maxSalary) {
    res.status(400);
    res.send("Missing Request Params");
    return;
  }

  if (
    !regexNumeric.test(minSalary) ||
    !regexNumeric.test(maxSalary) ||
    parseFloat(minSalary) < 0 ||
    parseFloat(minSalary) > parseFloat(maxSalary)
  ) {
    res.status(400);
    res.send("Invalid Request Params 4");
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

  return res.status(200).json({
    results: dbResults,
  });
}

async function getUsers(req, res) {
  const { minSalary, maxSalary, offset, limit, sort } = req.query;
  if (!minSalary || !maxSalary || !offset || !limit || !sort) {
    res.status(400);
    res.send("Missing Request Params");
    return;
  }

  // Decodes the +/- sign as a HTML encoded input
  const parsedFilter = he.decode(sort);
  if (parsedFilter[0] === "+") {
    sortBy = "ASC";
  } else if (parsedFilter[0] === "-") {
    sortBy = "DESC";
  } else {
    res.status(400);
    res.send("Invalid Request Params 1");
    return;
  }
  qtn = sort.substr(1, sort.length);

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

  res.send(results);
}

module.exports = {
  getUserCount,
  getUsers,
};
