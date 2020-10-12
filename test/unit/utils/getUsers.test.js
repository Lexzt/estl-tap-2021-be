const { expect } = require("chai");
const { match, stub, resetHistory, mock } = require("sinon");
const proxyquire = require("proxyquire");

const { makeMockModels } = require("sequelize-test-helpers");

const mockRequest = (body) => ({
  query: {
    minSalary: 1000,
    maxSalary: 2000,
    offset: 0,
    limit: 30,
    sort: "+name",
  },
  body,
});

const mockResponse = () => {
  const res = {};
  res.status = stub().returns(res);
  res.json = stub().returns(res);
  return res;
};

describe("src/utils/getUsers", () => {
  const users = { findAll: stub() };
  const mockModels = makeMockModels(users);

  const getUsers = proxyquire("../../../src/utils/getUsers", {
    "../models/users": mockModels,
  });

  let result;

  context("Invalid Params (Offset)", () => {
    const req = mockRequest({});
    const res = mockResponse();

    req.query.minSalary = 1000;
    req.query.maxSalary = 2000;

    it("Return 400, Missing offset", async () => {
      delete req.query.offset;

      result = await getUsers(req, res);
      expect(result.status.calledWith(400)).to.be.true;
      expect(
        result.json.calledWith({
          message: "Invalid Request Params 3",
        })
      ).to.be.true;
    });

    it("Return 400, Negative offset", async () => {
      req.query.offset = -1;

      result = await getUsers(req, res);
      expect(result.status.calledWith(400)).to.be.true;
      expect(
        result.json.calledWith({
          message: "Missing Request Params",
        })
      ).to.be.true;
    });

    it("Return 400, String offset", async () => {
      req.query.offset = "a";

      result = await getUsers(req, res);
      expect(result.status.calledWith(400));
      expect(
        result.json.calledWith({
          message: "Invalid Request Params 3",
        })
      ).to.be.true;
    });
  });

  context("Invalid Params (Limit)", () => {
    const req = mockRequest({});
    const res = mockResponse();

    req.query.minSalary = 1000;
    req.query.maxSalary = 2000;

    it("Return 400, Missing Limit", async () => {
      delete req.query.limit;

      result = await getUsers(req, res);
      expect(result.status.calledWith(400)).to.be.true;
      expect(
        result.json.calledWith({
          message: "Invalid Request Params 3",
        })
      ).to.be.true;
    });

    it("Return 400, Negative Limit", async () => {
      req.query.limit = -1;

      result = await getUsers(req, res);
      expect(result.status.calledWith(400)).to.be.true;
      expect(
        result.json.calledWith({
          message: "Missing Request Params",
        })
      ).to.be.true;
    });

    it("Return 400, String Limit", async () => {
      req.query.limit = "a";

      result = await getUsers(req, res);
      expect(result.status.calledWith(400));
      expect(
        result.json.calledWith({
          message: "Invalid Request Params 3",
        })
      ).to.be.true;
    });
  });

  context("Invalid Params (Min Salary)", () => {
    const req = mockRequest({});
    const res = mockResponse();

    req.query.minSalary = 1000;
    req.query.maxSalary = 2000;

    it("Return 400, Missing Min Salary", async () => {
      delete req.query.minSalary;

      result = await getUsers(req, res);
      expect(result.status.calledWith(400)).to.be.true;
      expect(
        result.json.calledWith({
          message: "Missing Request Params",
        })
      ).to.be.true;
    });

    it("Return 400, Negative Min Salary", async () => {
      req.query.minSalary = -1;

      result = await getUsers(req, res);
      expect(result.status.calledWith(400)).to.be.true;
      expect(
        result.json.calledWith({
          message: "Missing Request Params",
        })
      ).to.be.true;
    });

    it("Return 400, String Min Salary", async () => {
      req.query.minSalary = "a";

      result = await getUsers(req, res);
      expect(result.status.calledWith(400));
      expect(
        result.json.calledWith({
          message: "Invalid Request Params 3",
        })
      ).to.be.true;
    });

    it("Return 400, Min Salary > Max Salary", async () => {
      req.query.minSalary = 2000;
      req.query.maxSalary = 1000;

      result = await getUsers(req, res);
      expect(result.status.calledWith(400)).to.be.true;
      expect(
        result.json.calledWith({
          message: "Invalid Request Params 3",
        })
      ).to.be.true;
    });
  });

  context("Invalid Params (Max Salary)", () => {
    const req = mockRequest({});
    const res = mockResponse();

    req.query.minSalary = 1000;
    req.query.maxSalary = 2000;

    it("Return 400, Missing Max Salary", async () => {
      delete req.query.maxSalary;

      result = await getUsers(req, res);
      expect(result.status.calledWith(400)).to.be.true;
      expect(
        result.json.calledWith({
          message: "Missing Request Params",
        })
      ).to.be.true;
    });

    it("Return 400, Negative Max Salary", async () => {
      req.query.maxSalary = -1;

      result = await getUsers(req, res);
      expect(result.status.calledWith(400)).to.be.true;
      expect(
        result.json.calledWith({
          message: "Missing Request Params",
        })
      ).to.be.true;
    });

    it("Return 400, String Max Salary", async () => {
      req.query.maxSalary = "a";

      result = await getUsers(req, res);
      expect(result.status.calledWith(400));
      expect(
        result.json.calledWith({
          message: "Invalid Request Params 3",
        })
      ).to.be.true;
    });

    it("Return 400, Min Salary < Max Salary", async () => {
      req.query.minSalary = 2000;
      req.query.maxSalary = 1000;

      result = await getUsers(req, res);
      expect(result.status.calledWith(400)).to.be.true;
      expect(
        result.json.calledWith({
          message: "Invalid Request Params 3",
        })
      ).to.be.true;
    });
  });

  context("Invalid Params (Sort)", () => {
    const req = mockRequest({});
    const res = mockResponse();

    req.query.minSalary = 1000;
    req.query.maxSalary = 2000;

    it("Return 400, Missing Sort", async () => {
      delete req.query.sort;

      result = await getUsers(req, res);
      expect(result.status.calledWith(400)).to.be.true;
      expect(
        result.json.calledWith({
          message: "Missing Request Params",
        })
      ).to.be.true;
    });

    it("Return 400, Invalid Sort", async () => {
      req.query.sort = "asort";

      result = await getUsers(req, res);
      expect(result.status.calledWith(400)).to.be.true;
      expect(
        result.json.calledWith({
          message: "Invalid Request Params 1",
        })
      ).to.be.true;
    });

    it("Return 400, String Max Salary", async () => {
      req.query.sort = "+hello";

      result = await getUsers(req, res);
      expect(result.status.calledWith(400));
      expect(
        result.json.calledWith({
          message: "Invalid Request Params 2",
        })
      ).to.be.true;
    });
  });

  context("Empty Database", () => {
    before(async () => {
      const req = mockRequest({});
      const res = mockResponse();

      req.query.minSalary = 1000;
      req.query.maxSalary = 2000;

      users.findAll.resolves([]);
      result = await getUsers(req, res);
    });

    after(resetHistory);

    it("Return 200, Empty Array", () => {
      expect(result.status.calledWith(200));
    });
  });
});
