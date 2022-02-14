const messageConsumer = require("@diva/common/messaging/MessageConsumer");
const { setLoggerDefaultMeta, logger: log } = require("@diva/common/logger");
const generateUuid = require("@diva/common/generateUuid");
const connector = require("./Connector");
const serviceName = require("./package.json").name;
const { getOperation } = require("./utils/utils");

const serviceId = generateUuid("service");

setLoggerDefaultMeta({ serviceId });

const NODE_ENV = process.env.NODE_ENV || "development";
const KAFKA_CONSUMER_TOPICS = process.env.KAFKA_CONSUMER_TOPICS
  ? JSON.parse(process.env.KAFKA_CONSUMER_TOPICS)
  : ["entity.events", "datanetwork.events"];

log.info(`✅ Booting ${serviceName} in ${NODE_ENV} mode`);

const onMessage = async (message) => {
  try {
    const parsedMassage = JSON.parse(message.value.toString());
    const {
      type,
      object: { id },
      attributedTo,
    } = parsedMassage.payload;
    if (parsedMassage.channel === "datanetwork.events") {
      // TODO as a quick prototype, we just reindex connected entities on edge event
      const connectedEntities = attributedTo.map(
        ({ object: { id: entityId } }) => ({
          id: entityId,
        })
      );
      for (const entityData of connectedEntities) {
        await connector.index(entityData.id);
      }
    } else {
      await getOperation(type)(id);
    }
    log.info(`💬 Processed message type "${type}" for entity "${id}"`);
  } catch (err) {
    log.error(err);
  }
};

(async () => {
  try {
    await connector.init();
    await connector.createIndex("entities");
    await messageConsumer.init(
      KAFKA_CONSUMER_TOPICS.map((topic) => ({ topic, spec: "asyncapi" })),
      serviceName
    );
    await messageConsumer.consume(onMessage);
    log.info(`✅ All components booted successfully 🚀`);
  } catch (e) {
    log.error(`${e.message}`);
    process.exit(1);
  }
})();
