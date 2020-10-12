const { Op } = require("sequelize");
const users = require("../models/users");

const regexNumeric = RegExp(/^\-?[0-9]+(e[0-9]+)?(\.[0-9]+)?$/);

async function getUserCount(req, res) {
  const { minSalary, maxSalary } = req.query;
  if (!minSalary || !maxSalary) {
    return res.status(400).json({ message: "Missing Request Params" });
  }

  if (
    !regexNumeric.test(minSalary) ||
    !regexNumeric.test(maxSalary) ||
    parseFloat(minSalary) < 0 ||
    parseFloat(minSalary) > parseFloat(maxSalary)
  ) {
    return res.status(400).json({ message: "Invalid Request Params 4" });
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
module.exports = getUserCount;
