/* eslint-disable prefer-arrow-callback */
const path = require("path");
require("dotenv").config({
  path: path.resolve(__dirname, `../.env.test`),
});
const {
  runGetTests,
  runGetByIdTests,
  runPostTests,
  runPatchTests,
  runDeleteTests,
} = require("@diva/common/test/e2e/api.entityService.spec");
const Request = require("@diva/common/test/utils/Request");
const mockData = require("@diva/common/test/utils/mockData");
const insertMockData = require("@diva/common/test/utils/insertMockData");
const chai = require("chai");

const {
  MONGO_DB_NAME = "usersDbTest",
  MONGO_COLLECTION_NAME = "usersTest",
  HISTORY_DB_NAME = "historiesDbTest",
  HISTORY_COLLECTION_NAME = "historiesTest",
} = process.env;

const serverCreationPromise = require("../../index");
const {
  usersMongoDbConnector,
  historyMongoDbConnector,
} = require("../../utils/mongoDbConnectors");

const { expect } = chai;

describe("User API", () => {
  /**
   * Global available Requests instance initialized through the "before" hook
   * @type {{Request}} - required for all tests below
   */
  this.request = {};
  /**
   * Global available set of users (entities) inserted through the API. This users can be used to test the CRUD operations
   * on /users collection
   * @type [{id: string, password: string, email: string, username: string}]
   */
  this.testEntities = [];

  let server;

  before(async function () {
    this.timeout(20000);
    await usersMongoDbConnector.connect();
    await usersMongoDbConnector.database.dropDatabase();
    server = await serverCreationPromise;
    this.request = new Request(server);
    await historyMongoDbConnector.database.dropDatabase();
    this.dbCollection =
      usersMongoDbConnector.collections[MONGO_COLLECTION_NAME];
    const insertedUsers = await insertMockData(MONGO_COLLECTION_NAME, server);
    this.testEntities = insertedUsers.map((id, index) => ({
      id,
      ...mockData[MONGO_COLLECTION_NAME].data[index],
    }));
  });

  after(async () => {
    await usersMongoDbConnector.database.dropDatabase();
    await historyMongoDbConnector.database.dropDatabase();
    await usersMongoDbConnector.disconnect();
    await historyMongoDbConnector.disconnect();
    await server.close();
    // process.exit(0);
  });

  describe("Test database", function () {
    it("has mock data", function (done) {
      usersMongoDbConnector.collections[MONGO_COLLECTION_NAME].countDocuments()
        .then((count) => {
          expect(count).to.equal(this.testEntities.length);
          done();
        })
        .catch(done);
    });
  });

  describe("Common CRUD operations", function () {
    describe(`# GET /${MONGO_COLLECTION_NAME}`, function () {
      runGetTests(MONGO_COLLECTION_NAME);
    });
    describe(`# GET /${MONGO_COLLECTION_NAME}/{id}`, function () {
      runGetByIdTests(MONGO_COLLECTION_NAME);
    });
    describe(`# POST /${MONGO_COLLECTION_NAME}/{id}`, function () {
      runPostTests(MONGO_COLLECTION_NAME, "email");
    });
    describe(`# PATCH /${MONGO_COLLECTION_NAME}/{id}`, function () {
      runPatchTests(MONGO_COLLECTION_NAME, "username", "email");
    });
    describe(`# DELETE /${MONGO_COLLECTION_NAME}/{id}`, function () {
      runDeleteTests(MONGO_COLLECTION_NAME);
    });
  });
});
