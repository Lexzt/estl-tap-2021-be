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

const random2Dp = () => {
  return (
    Math.floor(
      Math.random() * (10000 * precision - 1000 * precision) + 1 * precision
    ) /
    (1 * precision)
  );
};

const mockData = () => {
  return {
    id: makeid(15),
    login: makeid(15),
    name: makeid(5),
    salary: random2Dp(),
  };
};

module.exports = {
  mockData,
  random2Dp,
  makeid,
};
