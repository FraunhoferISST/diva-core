const messageConsumer = require("@diva/common/messaging/MessageConsumer");
const { minioConnector } = require("../utils/MinIoConnector");
const { name: serviceName } = require("../package.json");

const KAFKA_CONSUMER_TOPICS = [
  {
    topic: "entity.events",
    spec: {
      name: "asyncapi",
    },
  },
];

class EventsHandlerService {
  async init() {
    await messageConsumer.init(
      KAFKA_CONSUMER_TOPICS,
      `${serviceName}-consumer`
    );
    await minioConnector;
    return messageConsumer.consume(this.onMessage.bind(this));
  }

  async onMessage(message) {
    const parsedMassage = JSON.parse(message.value.toString());
    const {
      type,
      object: { id },
    } = parsedMassage.payload;
    if (type === "delete" && id.startsWith("resource:")) {
      await minioConnector.removeObjects([id]);
    }
  }
}

module.exports = new EventsHandlerService();
