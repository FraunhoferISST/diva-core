const express = require("express");
const cors = require("cors");
const path = require("path");
const axios = require("axios");
const urljoin = require("url-join");
const OpenApiValidator = require("express-openapi-validator");
const { logger: log, httpLogger, httpErrorLogger } = require("../logger");
const workDir = require("../utils/workDir");

const NODE_ENV = process.env.NODE_ENV || "development";
const POLICY_MIDDLEWARE = process.env.POLICY_MIDDLEWARE || "active";
const BUSINESS_DECISION_POINT_URL =
  process.env.BUSINESS_DECISION_POINT_URL || "http://localhost:3001/";

const SERVICE_NAME = require(path.join(`${workDir}`, "/package.json")).name;

const corsDefaults = {
  origin: process.env.CORS_ALLOW_ORIGIN || "*",
  methods: ["GET", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "x-diva", "Authorization"],
};

const hideReqCredentials = (req) => ({
  ...req,
  headers: {
    ...req.headers,
    ...(req.headers?.authorization ? { authorization: "[MASKED]" } : {}),
  },
});

const {
  createError,
  isCustomError,
  isOpenAPISpecValidationError,
  createOpenAPIValidationError,
  AccessDeniedError,
} = require("../Error");

const errorHandler = (err, _req, res, next) => {
  if (!res.headersSent) {
    let formattedError = err;
    if (isOpenAPISpecValidationError(err)) {
      formattedError = createOpenAPIValidationError(err);
    } else if (!isCustomError(err)) {
      formattedError = createError({ message: err.toString() });
    }
    res.status(formattedError.code).send(formattedError);
    // destructure to remove error stack trace!
    return next({ ...formattedError });
  }
};

const policyRulesMiddleware = async (req, res, next) => {
  req.headers.serviceName = SERVICE_NAME;
  return axios
    .post(
      urljoin(BUSINESS_DECISION_POINT_URL, "enforcePolicies"),
      {
        headers: req.headers,
        body: req.body,
        method: req.method,
        path: req.path,
        query: req.query,
        params: { ...(req.params ?? {}), ...(req.openapi.pathParams ?? {}) },
      },
      {
        headers: {
          "x-diva": JSON.stringify({ actorId: req.headers.diva.actorId }),
        },
      }
    )
    .then(({ data }) => {
      if (data.decision === true) {
        req.policyPayload = data.payload;
        next();
      } else {
        throw createError({
          ...AccessDeniedError,
          ...(data.message ? { errors: { message: data.message } } : {}),
        });
      }
    })
    .catch((e) => {
      if (e?.code === 403) {
        next(e);
      } else {
        next(
          createError({
            type: "PoliciesServiceUnavailable",
            message: `Couldn't ensure policies: ${e.toString()}`,
            code: e.status ?? 500,
          })
        );
      }
    });
};

class Server {
  constructor(port, serviceName = SERVICE_NAME) {
    this.port = port;
    this.serviceName = serviceName;
    this.app = express();
  }

  initBasicMiddleware({ corsOptions = {} } = {}) {
    log.info(`✅ Setting up basic API middleware`);
    this.app.use(express.json({ limit: "10mb", extended: true }));
    this.app.use(express.urlencoded({ limit: "10mb", extended: false }));
    this.app.use(cors({ ...corsDefaults, ...corsOptions }));
    this.app.use((req, res, next) => {
      req.headers.diva = JSON.parse(req.headers["x-diva"] ?? "{}");
      next();
    });
    this.app.use((req, res, next) =>
      httpLogger(hideReqCredentials(req), res, next)
    );
  }

  addMiddleware(...args) {
    this.app.use(...args);
  }

  addErrorLoggingMiddleware() {
    log.info(`✅ Setting up API error logging middleware`);
    this.addMiddleware((err, req, res, next) =>
      httpErrorLogger(err, hideReqCredentials(req), res, next)
    );
  }

  addOpenApiValidatorMiddleware(
    apiSpec = path.join(`${workDir}`, "/apiDoc/openapi.yml")
  ) {
    log.info(`✅ Setting up OpenAPI validation middleware`);
    this.addMiddleware(
      OpenApiValidator.middleware({
        apiSpec,
      })
    );
    if (NODE_ENV === "development") {
      this.addMiddleware("/api", (req, res) => res.json(apiSpec));
    }
  }

  addPolicyValidatorMiddleware() {
    if (POLICY_MIDDLEWARE === "inactive") {
      log.info(
        `🚫 Policy validation middleware has been deactivated by .env-flag`
      );
    } else {
      log.info(`✅ Setting up Policy validation middleware`);
      this.addMiddleware(policyRulesMiddleware);
    }
  }

  async boot() {
    log.info(`✅ Booting API server...`);
    return new Promise((resolve, reject) => {
      try {
        this.addMiddleware(errorHandler);
        this.addErrorLoggingMiddleware();
        const expressServer = this.app.listen(this.port, () => {
          log.info(
            `✅ REST API ready at port ${expressServer.address().port} 🌐`
          );
          resolve(expressServer);
        });
      } catch (e) {
        log.error(e);
        reject(e);
      }
    });
  }
}

module.exports = Server;
