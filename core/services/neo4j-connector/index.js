const messageConsumer = require("@diva/common/messaging/MessageConsumer");
const Connector = require("./Connector");
const serviceName = require("./package.json").name;
const {
  getDbByEntityId,
  getOperation,
  createConstraints,
} = require("./utils/utils");

const KAFKA_CONSUMER_TOPICS = process.env.KAFKA_CONSUMER_TOPICS
  ? JSON.parse(process.env.KAFKA_CONSUMER_TOPICS)
  : [
      "resource.events",
      "asset.events",
      "user.events",
      "review.events",
      "service.events",
    ];

const onMessage = async (message) => {
  try {
    const parsedMassage = JSON.parse(message.value.toString());
    const {
      type,
      object: { id },
    } = parsedMassage.payload;
    const entityType = getDbByEntityId(id);
    await getOperation(type)(entityType, id);
    console.info(`💬 Processed message type "${type}" for entity "${id}"`);
  } catch (err) {
    console.error(err);
  }
};

(async () => {
  try {
    await Connector.init();

    await createConstraints(KAFKA_CONSUMER_TOPICS.map((t) => t.split(".")[0]));

    await messageConsumer.init(
      KAFKA_CONSUMER_TOPICS.map((topic) => ({ topic, spec: "asyncapi" })),
      serviceName
    );
    await messageConsumer.consume(onMessage);

    console.info("✅ Neo4J connector is running!");
  } catch (e) {
    process.exit(1);
  }
})();