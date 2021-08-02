const boot = require("../server");
const { passport } = require("../utils/passport");
const { db } = require("../utils/database");
const usersRouter = require("../routes/reviews");
const userImagesRouter = require("../routes/userImages");
const messagesProducerService = require("../services/MessagesProducerService");
const { loadAsyncAPISpec } = require("../utils/validation/messagesValidation");
const { loadSchemas } = require("../utils/validation/jsonSchemaValidation");

const port = 0;

const createTestServer = async () =>
  boot(async (app) => {
    app.use(passport.initialize());

    app.use("/users", usersRouter);
    app.use("/userImages", userImagesRouter);

    await Promise.all([
      db.connect("userTestDb"),
      messagesProducerService.init(() =>
        console.log("Faked Sending message in test mode")
      ),
      loadSchemas(),
      loadAsyncAPISpec(),
    ]);
  }, port);

module.exports = createTestServer;