const { expect } = require("chai");
const { stub, resetHistory } = require("sinon");
const proxyquire = require("proxyquire");
const { makeMockModels } = require("sequelize-test-helpers");

const mockRequest = (body) => ({
  file: {
    path: "",
  },
  body,
});

const mockResponse = () => {
  const res = {};
  res.status = stub().returns(res);
  res.json = stub().returns(res);
  return res;
};

describe("src/utils/postUsers", () => {
  const users = { findAll: stub() };
  const mockUsersModels = makeMockModels(users);
  const postUsers = proxyquire("../../../src/utils/postUsers", {
    "../models/users": mockUsersModels,
  });

  const database = { transaction: stub() };
  const mockDatabaseModels = makeMockModels(database);
  const transaction = proxyquire("../../../config/database", {
    sequelize: { mockDatabaseModels },
  });

  let result;

  context("Empty CSV Upload", () => {
    it("Return 500, Empty File", async () => {
      const req = mockRequest({});
      const res = mockResponse();

      req.file.path = "./empty.csv";

      result = await postUsers(req, res);
      expect(result.status.calledWith(500)).to.be.true;
      expect(
        result.json.calledWith({
          message: "Empty File",
        })
      ).to.be.true;
    });

    it("Return 500, Empty Header Only", async () => {
      const req = mockRequest({});
      const res = mockResponse();

      req.file.path = "./empty-header.csv";

      result = await postUsers(req, res);
      expect(result.status.calledWith(500)).to.be.true;
      expect(
        result.json.calledWith({
          message: "Empty File",
        })
      ).to.be.true;
    });
  });

  context("Invalid Entries CSV Upload", () => {
    it("Return 500, Invalid Login", async () => {
      const req = mockRequest({});
      const res = mockResponse();

      req.file.path = "./invalid-login.csv";

      result = await postUsers(req, res);
      expect(result.status.calledWith(500)).to.be.true;
      expect(
        result.json.calledWith({
          message: "File contains invalid CSV Data",
        })
      ).to.be.true;
    });

    it("Return 500, Invalid name", async () => {
      const req = mockRequest({});
      const res = mockResponse();

      req.file.path = "./invalid-name.csv";

      result = await postUsers(req, res);
      expect(result.status.calledWith(500)).to.be.true;
      expect(
        result.json.calledWith({
          message: "File contains invalid CSV Data",
        })
      ).to.be.true;
    });

    it("Return 500, Invalid salary", async () => {
      const req = mockRequest({});
      const res = mockResponse();

      req.file.path = "./invalid-salary.csv";

      result = await postUsers(req, res);
      expect(result.status.calledWith(500)).to.be.true;
      expect(
        result.json.calledWith({
          message: "File contains invalid CSV Data",
        })
      ).to.be.true;
    });
  });

  context("Invalid Entries CSV Upload", () => {
    it("Return 500, Invalid Login", async () => {
      const req = mockRequest({});
      const res = mockResponse();

      req.file.path = "./invalid-login.csv";

      result = await postUsers(req, res);
      expect(result.status.calledWith(500)).to.be.true;
      expect(
        result.json.calledWith({
          message: "File contains invalid CSV Data",
        })
      ).to.be.true;
    });
  });
});
