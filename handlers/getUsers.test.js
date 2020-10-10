const { getUserCount, getUsers } = require("./getUsers");

const mockRequest = (body) => ({
  query: {
    minSalary: random2Dp(),
    maxSalary: random2Dp(),
    offset: 0,
    limit: 30,
    sort: "+name",
  },
  body,
});

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

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

const users = jest.createMockFromModule("../models/users");
users.users = {};
users.users.findAll = jest.fn().mockReturnValue([]);
console.log(users);

describe("Users", () => {
  test("should 400 if missing min salary", async () => {
    const req = mockRequest({});
    const res = mockResponse();

    delete req.minSalary;

    await getUsers(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Missing Request Params",
    });
  });

  test("should 400 if missing max salary", async () => {
    const req = mockRequest({});
    const res = mockResponse();

    delete req.maxSalary;

    await getUsers(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Missing Request Params",
    });
  });

  test("should 400 if missing offset", async () => {
    const req = mockRequest({});
    const res = mockResponse();

    delete req.offset;

    await getUsers(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Missing Request Params",
    });
  });

  test("should 400 if missing limit", async () => {
    const req = mockRequest({});
    const res = mockResponse();

    delete req.limit;

    await getUsers(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Missing Request Params",
    });
  });

  test("should 400 if missing sort", async () => {
    const req = mockRequest({});
    const res = mockResponse();

    delete req.sort;

    await getUsers(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Missing Request Params",
    });
  });

  test("should 200 if nothing missing", async () => {
    const req = mockRequest({});
    const res = mockResponse();

    req.query.minSalary = 1000;
    req.query.maxSalary = 2000;

    await getUsers(req, res);
    console.log(res.json);
    expect(res.status).toHaveBeenCalledWith(200);
    // expect(res.json).toHaveBeenCalledWith({
    //   message: "Missing Request Params",
    // });
  });
});
