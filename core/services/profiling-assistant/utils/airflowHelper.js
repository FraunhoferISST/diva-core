const { dagNotFoundError } = require("./errors");

const dags = [
  {
    title: "text",
    criteria: {
      resourceTypes: ["file"],
      mimeTypes: ["application/pdf", "text/plain"],
      distributionTypes: ["divaLake"],
    },
  },
  {
    title: "image",
    criteria: {
      resourceTypes: ["file"],
      mimeTypes: ["image/jpeg"],
      distributionTypes: ["divaLake"],
    },
  },
  {
    title: "tabledata",
    criteria: {
      resourceTypes: ["file"],
      mimeTypes: ["text/csv", "application/x-sas-data"],
      distributionTypes: ["divaLake"],
    },
  },
  {
    title: "github",
    criteria: {
      resourceTypes: ["github:project"],
      mimeTypes: [],
      distributionTypes: [],
    },
  },
];

const getDag = (resource) => {
  const matchingDag = dags.filter(
    ({ criteria }) =>
      (criteria.resourceTypes.includes(resource.resourceType) &&
        criteria.mimeTypes.includes(resource.mimeType) &&
        resource.distributions?.some(({ type }) =>
          criteria.distributionTypes.includes(type)
        )) ||
      (criteria.resourceTypes.includes(resource.resourceType) &&
        resource.resourceType === "github:project")
  )[0];

  if (matchingDag) return matchingDag;
  throw dagNotFoundError;
};

const buildAirflowConfig = (entity, actorId) => ({
  conf: {
    entityId: entity.id,
    actorId,
    uniqueFingerprint: entity.uniqueFingerprint,
    mimeType: entity.mimeType,
  },
});

module.exports = {
  getDag,
  buildAirflowConfig,
};
