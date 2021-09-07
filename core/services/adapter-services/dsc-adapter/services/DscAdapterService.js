const axios = require("axios");
const MongoDBConnector = require("@diva/common/databases/MongoDBConnector");

const resourceDbName = process.env.MONGO_RESOURCE_DB_NAME || "resourcesDb";
const resourceCollectionName =
  process.env.MONGO_RESOURCE_COLLECTION_NAME || "resources";
const dscCollectionName = process.env.MONGO_DSC_COLLECTION_NAME || "dsc";
const mongoConnector = new MongoDBConnector(resourceDbName, [
  resourceCollectionName,
  dscCollectionName,
]);

const {
  isOffered,
  catalogExists,
  createCatalog,
  updateOfferResourceAndRule,
  createOfferFromResource,
  deleteOfferResource,
  updateOfferEntities,
  getOffer,
} = require("../utils/dscApi");
const {
  createRepresentations,
  hasSupportedDistributions,
  createArtifact,
} = require("../utils/utils");
const {
  unsupportedDistributionsError,
  alreadyOfferedError,
  notOfferedError,
} = require("../utils/errors");
const { microserviceId } = require("../utils/info");
const buildPolicy = require("../utils/policyBuilder/buildPolicy");

const RESOURCE_MANAGEMENT_URL =
  process.env.RESOURCE_MANAGEMENT_URL || "http://localhost:3000";

const patchResource = (resourceId, patch, actorid = microserviceId) =>
  axios.patch(`${RESOURCE_MANAGEMENT_URL}/resources/${resourceId}`, patch, {
    headers: {
      "x-actorid": actorid,
    },
  });

const getResource = (id) =>
  mongoConnector.collections[resourceCollectionName].findOne(
    { id },
    {
      projection: {
        _id: 0,
        title: true,
        description: true,
        dsc: true,
        distributions: true,
        keywords: true,
        byteSize: true,
        mimeType: true,
      },
    }
  );

const prepareDscData = (resource, policy) => {
  const { dsc, distributions, ...rest } = resource;
  return {
    representation: createRepresentations(resource),
    artifact: createArtifact(resource),
    policy: buildPolicy(policy),
    resource: rest,
  };
};

const createDscPatch = (dsc) => ({
  dsc: dsc || null,
});

class DscAdapterService {
  async init() {
    await mongoConnector.connect();
    this.dscCollection = mongoConnector.collections[dscCollectionName];
    this.dscInfo = await this.dscCollection.findOne({});
    if (!this.dscInfo || !(await catalogExists(this.dscInfo?.catalogId))) {
      await this.dscCollection.deleteMany({});
      const { id: catalogId } = await createCatalog("Diva Catalog");
      this.dscCollection.insertOne({ catalogId });
      this.dscInfo = { catalogId };
      console.info(`Created catalog "${catalogId}"`);
    }
    console.info(`Using catalog "${this.dscInfo.catalogId}" `);
  }

  async createOffer(resourceId, policy, actorId) {
    const resource = await getResource(resourceId);
    const offerId = resource?.dsc?.offer?.offerId;
    if (offerId && (await isOffered(offerId))) {
      throw alreadyOfferedError;
    }
    if (!hasSupportedDistributions(resource.distributions)) {
      throw unsupportedDistributionsError;
    }
    const offer = await createOfferFromResource(
      prepareDscData(resource, policy),
      this.dscInfo.catalogId
    );
    await patchResource(
      resourceId,
      createDscPatch({ policy, offer }),
      actorId
    ).catch((e) => {
      deleteOfferResource(offer);
      throw e;
    });
    return offer;
  }

  async getOffer(offerId) {
    return getOffer(offerId);
  }

  async updateOffer(resourceId, offerId, policy, actorId) {
    const resource = await getResource(resourceId, this.collection);
    if (!(await isOffered(offerId))) {
      throw notOfferedError;
    }
    if (!hasSupportedDistributions(resource.distributions)) {
      throw unsupportedDistributionsError;
    }
    return updateOfferResourceAndRule(
      resource.dsc.offer,
      prepareDscData(resource, policy)
    ).then(() =>
      patchResource(
        resourceId,
        createDscPatch({ ...resource.dsc, policy }),
        actorId
      )
    );
  }

  async handleUpdateEvent(resourceId) {
    const resource = await getResource(resourceId, this.collection);
    const offerId = resource?.dsc?.offer?.offerId;
    if (offerId) {
      if (
        (await isOffered(offerId)) &&
        hasSupportedDistributions(resource.distributions)
      ) {
        return updateOfferEntities(
          resource.dsc.offer,
          prepareDscData(resource, resource.dsc.policy)
        );
      }
      return patchResource(resourceId, createDscPatch());
    }
  }

  async deleteOffer(resourceId, offerId, actorId) {
    const resource = await getResource(resourceId, this.collection);
    if (await isOffered(offerId)) {
      await deleteOfferResource(resource.dsc.offer);
    }
    return patchResource(resourceId, createDscPatch(), actorId);
  }

  async handleDeleteEvent(resourceId) {
    const resource = await getResource(resourceId, this.collection);
    const offerId = resource?.dsc?.offer?.offerId;
    if (offerId && (await isOffered(offerId))) {
      return deleteOfferResource(resource.dsc.offer);
    }
  }
}

module.exports = new DscAdapterService();
