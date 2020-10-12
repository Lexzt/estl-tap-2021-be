const { expect } = require("chai");
const { stub, resetHistory } = require("sinon");
const proxyquire = require("proxyquire");

const { makeMockModels } = require("sequelize-test-helpers");

const { mockData } = require("../../../src/utils/fakeUser");

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

describe("src/utils/getUsersCount", () => {
  const users = { count: stub(), findAll: stub() };
  const mockModels = makeMockModels(users);

  const getUsersCount = proxyquire("../../../src/utils/getUsersCount", {
    "../models/users": mockModels,
  });

  let result;

  context("Invalid Params (Min Salary)", () => {
    const req = mockRequest({});
    const res = mockResponse();

    req.query.minSalary = 1000;
    req.query.maxSalary = 2000;

    it("Return 400, Missing Min Salary", async () => {
      delete req.query.minSalary;

      result = await getUsersCount(req, res);
      expect(result.status.calledWith(400)).to.be.true;
      expect(
        result.json.calledWith({
          message: "Missing Request Params",
        })
      ).to.be.true;
    });

    it("Return 400, Negative Min Salary", async () => {
      req.query.minSalary = -1;

      result = await getUsersCount(req, res);
      expect(result.status.calledWith(400)).to.be.true;
      expect(
        result.json.calledWith({
          message: "Missing Request Params",
        })
      ).to.be.true;
    });

    it("Return 400, String Min Salary", async () => {
      req.query.minSalary = "a";

      result = await getUsersCount(req, res);
      expect(result.status.calledWith(400));
      expect(
        result.json.calledWith({
          message: "Invalid Request Params 4",
        })
      ).to.be.true;
    });

    it("Return 400, Min Salary > Max Salary", async () => {
      req.query.minSalary = 2000;
      req.query.maxSalary = 1000;

      result = await getUsersCount(req, res);
      expect(result.status.calledWith(400)).to.be.true;
      expect(
        result.json.calledWith({
          message: "Invalid Request Params 4",
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

      result = await getUsersCount(req, res);
      expect(result.status.calledWith(400)).to.be.true;
      expect(
        result.json.calledWith({
          message: "Missing Request Params",
        })
      ).to.be.true;
    });

    it("Return 400, Negative Max Salary", async () => {
      req.query.maxSalary = -1;

      result = await getUsersCount(req, res);
      expect(result.status.calledWith(400)).to.be.true;
      expect(
        result.json.calledWith({
          message: "Missing Request Params",
        })
      ).to.be.true;
    });

    it("Return 400, String Max Salary", async () => {
      req.query.maxSalary = "a";

      result = await getUsersCount(req, res);
      expect(result.status.calledWith(400));
      expect(
        result.json.calledWith({
          message: "Invalid Request Params 4",
        })
      ).to.be.true;
    });

    it("Return 400, Min Salary < Max Salary", async () => {
      req.query.minSalary = 2000;
      req.query.maxSalary = 1000;

      result = await getUsersCount(req, res);
      expect(result.status.calledWith(400)).to.be.true;
      expect(
        result.json.calledWith({
          message: "Invalid Request Params 4",
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

      users.count.resolves(0);
      result = await getUsersCount(req, res);
    });

    after(resetHistory);

    it("Return 200, No elements", () => {
      expect(result.status.calledWith(200)).to.be.true;
      expect(result.json.calledWith({ results: 0 })).to.be.true;
    });
  });

  context("Populated Database", () => {
    const fakeUsers = [
      mockData(),
      mockData(),
      mockData(),
      mockData(),
      mockData(),
    ];

    before(async () => {
      const req = mockRequest({});
      const res = mockResponse();

      req.query.minSalary = 1000;
      req.query.maxSalary = 2000;

      users.count.resolves(fakeUsers.length);
      result = await getUsersCount(req, res);
    });

    after(resetHistory);

    it("Return 200", () => {
      expect(result.status.calledWith(200)).to.be.true;
      expect(
        result.json.calledWith({
          results: fakeUsers.length,
        })
      ).to.be.true;
    });
  });
});
