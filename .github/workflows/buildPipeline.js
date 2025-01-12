const fs = require("fs");
const path = require("path");

const CORE_SERVICES_DOCKERFILE = "core/services/Dockerfile"

const genericTemplate = fs.readFileSync("./templates/publish-generic-image.yml", "utf8");
const nodeTemplate = fs.readFileSync("./templates/publish-node-image.yml", "utf8");
const pythonTemplate = fs.readFileSync("./templates/publish-python-image.yml", "utf8");

const coreServicesBasePath = path.join(__dirname, `../../core/services/`)
const coreServices = fs
    .readdirSync(coreServicesBasePath)
    .filter(dir => fs.lstatSync(path.join(coreServicesBasePath,dir)).isDirectory())
    .filter((dir) => !["adapter-services", "common", "node_modules", "eslint-config",].includes(dir))
    .map((dir) => ({
        name: require(path.join("../../core/services", dir, "package.json")).name,
        path: `core/services/${dir}`,
        context: `core`,
        relativePath: dir,
        dockerfile: CORE_SERVICES_DOCKERFILE,
        type: "node",
    }));

const adapterServicesBasePath = path.join(__dirname, "../../core/services/adapter-services");
const adapterServices = fs
    .readdirSync(adapterServicesBasePath)
    .map((dir) => ({
        name: require(path.join(
            adapterServicesBasePath,
            dir,
            "package.json"
        )).name,
        context: `core`,
        path: `core/services/adapter-services/${dir}`,
        relativePath: `adapter-services/${dir}`,
        dockerfile: CORE_SERVICES_DOCKERFILE,
        type: "node",
    }));

const faasNodeServicesBasePath = path.join(__dirname, "../../faas");
const faasNodeServices = fs
    .readdirSync(faasNodeServicesBasePath)
    .filter(dir => fs.lstatSync(path.join(faasNodeServicesBasePath, dir)).isDirectory())
    .map((dir) => ({
        dir,
        contents: fs.readdirSync(path.join("../../faas", dir)),
    }))
    .filter(({ contents }) => contents.includes("package.json"))
    .map(({ dir }) => ({
        name: require(path.join("../../faas", dir, "package.json")).name,
        path: `faas/${dir}`,
        relativePath: dir,
        dockerfile: `faas/${dir}/Dockerfile`,
        type: "node",
        context: `faas/${dir}`,
    }));

const faasPythonServicesBasePath = path.join(__dirname, "../../faas");
const faasPythonServices = fs
    .readdirSync(faasPythonServicesBasePath)
    .filter(dir => fs.lstatSync(path.join(faasNodeServicesBasePath, dir)).isDirectory())
    .map((dir) => ({
        dir,
        contents: fs.readdirSync(path.join(faasPythonServicesBasePath, dir)),
    }))
    .filter(({ contents }) => contents.includes("setup.py"))
    .map(({ dir }) => ({
        name: dir,
        path: `faas/${dir}`,
        relativePath: dir,
        dockerfile: `faas/${dir}/Dockerfile`,
        type: "python",
        context: `faas/${dir}`
    }));

const services = [
    ...coreServices,
    ...adapterServices,
    ...faasNodeServices,
    ...faasPythonServices,
    {
        name: "web-client",
        path: "web-client",
        dockerfile: "web-client/Dockerfile",
        type: "node",
        context: "web-client"
    },
    {
        name: "tika-extraction",
        path: "faas/tika-extraction",
        relativePath: "tika-extraction",
        dockerfile: "faas/tika-extraction/Dockerfile",
        type: "generic",
        version: "1.0.0",
        context: "faas/tika-extraction"
    },
];

const buildConfig = (template, service) =>
    fs.writeFileSync(
        `publish-${service.name}-image.yml`,
        template
            .replace(/%%name%%/g, service.name)
            .replace(/%%path%%/g, service.path)
            .replace(/%%relativePath%%/g, service.relativePath)
            .replace(/%%dockerfile%%/g, service.dockerfile)
            .replace(/%%version%%/g, service.version)
            .replace(/%%context%%/g, service.context)
    );

const buildGenericServicePipeline = (service) =>
    buildConfig(genericTemplate, service);

const buildNodeServicePipeline = (service) =>
    buildConfig(nodeTemplate, service);

const buildPythonServicePipeline = (service) =>
    buildConfig(pythonTemplate, service);

const templateMap = {
    "generic": buildGenericServicePipeline,
    "node": buildNodeServicePipeline,
    "python": buildPythonServicePipeline,
}

for (const service of services) {
    templateMap[service.type](service)
}
