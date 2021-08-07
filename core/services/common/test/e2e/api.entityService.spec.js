const chai = require("chai");
const chaiResponseValidator = require("chai-openapi-response-validator");
const Request = require("../utils/Request");
const mockData = require("../utils/mockData");

chai.use(require("chai-sorted"));

chai.use(chaiResponseValidator(`${process.cwd()}/apiDoc/openapi.yml`));

const { expect } = chai;

/**
 * Executes tests on GET operation on an entity. The tests expect that the mock data for corresponding entity is already
 * loaded in the test DB instance.
 * @param {string} collectionName - collection name, e.g. "users", "assets"
 */
const runGetTests = (collectionName = "resources") => {
  const endpoint = `/${collectionName}`;
  const testData = mockData[collectionName].data;
  it("satisfies OpenAPI spec", async function () {
    const res = await this.request.runRequest(
      this.request.makeBaseRequest(endpoint)
    );
    expect(res).to.satisfyApiSpec;
    expect(res.statusCode).to.equal(200);
  });
  it("returns collection corresponding to response format", async function () {
    const res = await this.request.runRequest(
      this.request.makeBaseRequest(endpoint)
    );
    expect(res.statusCode).to.equal(200);
    expect(res.body).to.be.an("object");
    expect(res.body).to.have.property("collection");
    expect(res.body).to.have.property("total");
    expect(res.body).to.have.property("collectionSize");
    expect(res.body.collection.length).to.equal(testData.length);
  });
  it("applies projection correctly", async function () {
    const res = await this.request.runRequest(
      this.request.makeBaseRequest(
        `/${collectionName}?fields=creatorId,created`
      )
    );
    const entity = res.body.collection[0];
    expect(res.statusCode).to.equal(200);
    expect(entity).to.be.an("object");
    expect(entity).to.have.property("creatorId");
    expect(entity).to.have.property("created");
  });
  it("applies page size correctly", async function () {
    const {
      body: { collectionSize, collection },
    } = await this.request.runRequest(
      this.request.makeBaseRequest(`/${collectionName}?pageSize=5`)
    );
    expect(collectionSize).to.equal(5);
    expect(collection).to.have.lengthOf(5);
  });
};

/**
 * Executes tests on GET/{id} operation on an entity. The tests expect that the mock data for corresponding entity is already
 * loaded in the test DB instance.
 * @param {string} collectionName - collection name, e.g. "users", "assets"
 */
const runGetByIdTests = (collectionName) => {
  const endpoint = `/${collectionName}`;
  it("satisfies OpenAPI spec", async function () {
    const res = await this.request.runRequest(
      this.request.makeBaseRequest(`${endpoint}/${this.testEntities[0].id}`)
    );
    expect(res).to.satisfyApiSpec;
    expect(res.statusCode).to.equal(200);
  });
  it("returns entity by id", async function () {
    const { body } = await this.request.runRequest(
      this.request.makeBaseRequest(`${endpoint}/${this.testEntities[0].id}`)
    );
    expect(body).to.be.an("object");
    expect(body.id).to.eql(this.testEntities[0].id);
  });
  it("returns status code 404 if entity not found by id", async function () {
    const fakeUuid = `${collectionName.substring(
      0,
      collectionName.length - 1
    )}:uuid:a458ae26-8c06-4101-a699-0ef6300b155d`;
    const res = await this.request.runRequest(
      this.request.makeBaseRequest(`${endpoint}/${fakeUuid}`)
    );
    expect(res.statusCode).to.equal(404);
  });
  it("returns consistent error object on errors", async function () {
    const res = await this.request.runRequest(
      this.request.makeBaseRequest(`${endpoint}/notExists`)
    );
    expect(res).to.satisfyApiSpec;
  });
  it("applies projection correctly", async function () {
    const res = await this.request.runRequest(
      this.request.makeBaseRequest(
        `${endpoint}/${this.testEntities[0].id}?fields=creatorId`
      )
    );
    const entity = res.body;
    expect(entity).to.be.an("object");
    expect(entity).to.have.property("creatorId");
    expect(Object.keys(entity)).to.have.lengthOf(1);
  });
};

/**
 * Executes tests on POST operation on an entity. The tests expect that the mock data for corresponding entity is already
 * loaded in the test DB instance.
 * @param {string} collectionName - collection name, e.g. "users", "assets"
 * @param {string} uniqueField - unique collection property, e.g. "email", "uniqueFingerPrint"
 */
const runPostTests = (collectionName, uniqueField) => {
  const endpoint = `/${collectionName}`;
  const createRandomEntity = mockData[collectionName].createRandom;
  const evilEntity = {
    ...createRandomEntity(),
    evilProp: "should violate schema!!!",
  };

  it("satisfies OpenAPI spec", async function () {
    const res = await this.request.runRequest(
      this.request.makeBodyRequest(endpoint, createRandomEntity())
    );
    expect(res).to.satisfyApiSpec;
  });
  it("returns 201 on successful creation", async function () {
    const res = await this.request.runRequest(
      this.request.makeBodyRequest(endpoint, createRandomEntity())
    );
    expect(res.status).to.equal(201);
  });
  it("persists new entity to database", async function () {
    const newEntity = createRandomEntity();
    const { text: newEntityId } = await this.request.runRequest(
      this.request.makeBodyRequest(endpoint, newEntity)
    );
    const res = await this.request.runRequest(
      this.request.makeBaseRequest(`${endpoint}/${newEntityId}`)
    );
    expect(res.status).to.equal(200);
    // expect(res.body).to.be.an("object").that.includes(newEntity);
  });
  it("throws error on schema violation", async function () {
    const res = await this.request.runRequest(
      this.request.makeBodyRequest(endpoint, evilEntity)
    );
    expect(res.body).have.a.property("errors");
    expect(res.body.errors).to.be.an("array");
    // expect(res.statusCode).to.equal(400);
  });
  it("does not persist an entity that violates the schema", async function () {
    await this.request.runRequest(
      this.request.makeBodyRequest(endpoint, evilEntity)
    );
    const insertedEvilEntity = await this.dbCollection.findOne({
      [uniqueField]: evilEntity[uniqueField],
    });
    expect(insertedEvilEntity).to.equal(undefined);
  });
  it("throws error with code 409 for uniqueness violation", async function () {
    const res = await this.request.runRequest(
      this.request.makeBodyRequest(endpoint, mockData[collectionName].data[0])
    );
    expect(res.statusCode).to.equal(409);
    expect(res.body).have.a.property("errors");
    expect(res.body.errors).to.be.an("array");
  });
  it("does not persist a new entity if uniqueness violated", async function () {
    const alreadyInsertedEntity = mockData[collectionName].data[0];
    await this.request.runRequest(
      this.request.makeBodyRequest(endpoint, mockData[collectionName].data[0])
    );
    const existingEntities = await this.dbCollection
      .find({
        [uniqueField]: alreadyInsertedEntity[uniqueField],
      })
      .toArray();
    expect(existingEntities.length).to.equal(1);
  });
  it("returns consistent error object on errors", async function () {
    const res = await this.request.runRequest(
      this.request.makeBodyRequest(endpoint, evilEntity, "post")
    );
    expect(res).to.satisfyApiSpec;
  });
};

/**
 * Executes tests on DELETE operation on an entity. The tests expect that the mock data for corresponding entity is already
 * loaded in the test DB instance. Always execute this test after all other CRUD tests!!!
 * @param {string} collectionName - collection name, e.g. "users", "assets"
 */
const runDeleteTests = (collectionName) => {
  it("satisfies OpenAPI spec", async function () {
    const res = await this.request.runRequest(
      this.request.makeBaseRequest(
        `/${collectionName}/${this.testEntities[0].id}`,
        "delete"
      )
    );
    expect(res.statusCode).to.equal(200);
    expect(res).to.satisfyApiSpec;
  });
  it("removes entity from database", async function () {
    await this.request.runRequest(
      this.request.makeBaseRequest(
        `/${collectionName}/${this.testEntities[1].id}`,
        "delete"
      )
    );
    const deletedEntity = await this.dbCollection.findOne({
      id: this.testEntities[1].id,
    });
    expect(deletedEntity).to.be.undefined;
  });
  it("returns consistent error object on errors", async function () {
    const res = await this.request.runRequest(
      this.request.makeBaseRequest(`/${collectionName}/notExists`, "delete")
    );
    expect(res).to.satisfyApiSpec;
  });
};

const runPatchTests = (collectionName, patchField, uniqueField) => {
  const patch = {
    [patchField]: mockData[collectionName].createRandom()[patchField],
  };
  const badPatch = {
    someNotAllowedProp: "someNotAllowedProp",
  };
  const endpoint = `/${collectionName}`;

  it("satisfies OpenAPI spec", async function () {
    const res = await this.request.runRequest(
      this.request.makeBodyRequest(
        `${endpoint}/${this.testEntities[0].id}`,
        patch,
        "patch"
      )
    );
    expect(res).to.satisfyApiSpec;
  });
  it("patches the entity in the database", async function () {
    const res = await this.request.runRequest(
      this.request.makeBodyRequest(
        `${endpoint}/${this.testEntities[0].id}`,
        patch,
        "patch"
      )
    );
    const updatedEntity = await this.dbCollection.findOne({
      id: this.testEntities[0].id,
    });
    expect(res.statusCode).to.equal(200);
    expect(updatedEntity[patchField]).to.equal(patch[patchField]);
  });
  it("returns errors for schema violation", async function () {
    const res = await this.request.runRequest(
      this.request.makeBodyRequest(
        `${endpoint}/${this.testEntities[0].id}`,
        badPatch,
        "patch"
      )
    );
    expect(res.body).have.a.property("errors");
    expect(res.body.errors).to.be.an("array");
    expect(res.statusCode).to.equal(406);
  });
  it("does not patches the entity on schema violation in the database", async function () {
    await this.request.runRequest(
      this.request.makeBodyRequest(
        `${endpoint}/${this.testEntities[0].id}`,
        badPatch,
        "patch"
      )
    );
    const updatedEntity = await this.dbCollection.findOne({
      id: this.testEntities[0].id,
    });
    expect(updatedEntity).to.not.have.property(badPatch.someNotAllowedProp);
  });
  it("returns status code 409 if uniqueness violated", async function () {
    const res = await this.request.runRequest(
      this.request.makeBodyRequest(
        `${endpoint}/${this.testEntities[0].id}`,
        { [uniqueField]: this.testEntities[1][uniqueField] },
        "patch"
      )
    );
    expect(res.statusCode).to.equal(409);
  });
  it("does not patch entity in the database if uniqueness violated", async function () {
    await this.request.runRequest(
      this.request.makeBodyRequest(
        `${endpoint}/${this.testEntities[0].id}`,
        { [uniqueField]: this.testEntities[1][uniqueField] },
        "patch"
      )
    );
    const count = await this.dbCollection.countDocuments({
      [uniqueField]: this.testEntities[1][uniqueField],
    });
    expect(count).to.be.equal(1);
  });
  it("returns consistent error object on errors", async function () {
    const res = await this.request.runRequest(
      this.request.makeBodyRequest(
        `${endpoint}/${this.testEntities[0].id}`,
        badPatch,
        "patch"
      )
    );
    expect(res).to.satisfyApiSpec;
  });
  it("returns status code 404 if entity not found by id", async function () {
    const fakeUuid = `${collectionName.substring(
      0,
      collectionName.length - 1
    )}:uuid:a458ae26-8c06-4101-a699-0ef6300b155d`;

    const res = await this.request.runRequest(
      this.request.makeBodyRequest(`${endpoint}/${fakeUuid}`, patch, "patch")
    );
    expect(res.statusCode).to.equal(404);
  });
};

module.exports = {
  runGetByIdTests,
  runGetTests,
  runPostTests,
  runDeleteTests,
  runPatchTests,
};
