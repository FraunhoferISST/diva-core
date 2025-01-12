const urljoin = require("url-join");
const AsyncApiValidator = require("asyncapi-validator");
const asyncapiParser = require("@asyncapi/parser");
const axios = require("axios");
const path = require("path");
const { createError } = require("../Error");
const { serviceInstanceId } = require("../utils/serviceInstanceId");
const workDir = require("../utils/workDir");

const { serviceId } = require(path.join(`${workDir}`, "/package.json"));

const ENTITY_MANAGEMENT_URL =
  process.env.ENTITY_MANAGEMENT_URL || "http://localhost:3000";

const fetchSpec = (specName) =>
  axios.get(urljoin(ENTITY_MANAGEMENT_URL, "/asyncapis/byName/", specName), {
    headers: {
      "x-diva": JSON.stringify({
        actorId: serviceId,
        serviceInstanceId,
      }),
    },
  });

const loadAsyncAPISpec = async (spec) => {
  let specification;
  if (spec.specification) {
    specification = spec.specification;
  } else {
    const { data } = await fetchSpec(spec.name);
    specification = data;
  }

  return AsyncApiValidator.fromSource(
    (await asyncapiParser.parse(specification))._json,
    {
      msgIdentifier: "name",
    }
  );
};
const validateMessage = (
  specName,
  validator,
  msg,
  { messageName, channel, operation = "publish" }
) => {
  try {
    return validator.validate(messageName, msg, channel, operation);
  } catch (validationError) {
    throw createError({
      type: validationError.name,
      message:
        validationError.message ||
        `Supplied message for the operation "${validationError.key}" violates "${specName}" schema`,
      code: 406,
      errors: validationError.errors,
    });
  }
};

class MessagesValidator {
  constructor() {
    this.validators = [];
  }

  /**
   * @param {Object[]} specs - array of objects including specification name and the specification object
   * @param {string} specs[].name - name of the specification
   * @param {Object} [specs[].specification] - corresponding AsyncAPI Specification object, if not provided, the specification will be fetched by name
   * @returns {Promise<void>}
   */
  async init(specs) {
    this.validators = Object.fromEntries(
      await Promise.all(
        specs.map(async (spec) => [spec.name, await loadAsyncAPISpec(spec)])
      )
    );
  }

  validate(specName, msg, specInfo) {
    const validator = this.validators[specName];
    return validateMessage(specName, validator, msg, specInfo);
  }
}

module.exports = MessagesValidator;
