const { Op } = require("sequelize");
const he = require("he");
const users = require("../models/users");

const regexNumeric = RegExp(/^\-?[0-9]+(e[0-9]+)?(\.[0-9]+)?$/);

async function getUsers(req, res) {
  const { minSalary, maxSalary, offset, limit, sort } = req.query;
  if (
    (typeof offset === "number" && offset < 0) ||
    (typeof offset === "string" && !offset)
  ) {
    return res.status(400).json({ message: "Missing Request Params" });
  }

  if (
    (typeof limit === "number" && limit < 0) ||
    (typeof limit === "string" && !limit)
  ) {
    return res.status(400).json({ message: "Missing Request Params" });
  }

  if (!minSalary || !maxSalary || !sort) {
    return res.status(400).json({ message: "Missing Request Params" });
  }

  // Decodes the +/- sign as a HTML encoded input
  const parsedFilter = he.decode(sort);
  if (parsedFilter[0] === "+") {
    sortBy = "ASC";
  } else if (parsedFilter[0] === "-") {
    sortBy = "DESC";
  } else {
    return res.status(400).json({ message: "Invalid Request Params 1" });
  }
  qtn = sort.substr(1, sort.length);

  if (
    !(qtn === "name" || qtn === "id" || qtn === "salary" || qtn === "login")
  ) {
    return res.status(400).json({ message: "Invalid Request Params 2" });
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
    return res.status(400).json({ message: "Invalid Request Params 3" });
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

  return res.status(200).json(results);
}
module.exports = getUsers;
