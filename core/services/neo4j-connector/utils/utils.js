const Connector = require("../Connector");

const getDbByEntityId = (id) => {
  const entityType = id.slice(0, id.indexOf(":"));
  return {
    dbName: `${entityType}sDb`,
    collection: `${entityType}s`,
  };
};

const operationsMap = {
  create: Connector.create,
  update: Connector.update,
  delete: Connector.delete,
};

const getOperation = (type) => operationsMap[type];

module.exports = {
  getDbByEntityId,
  getOperation,
};
