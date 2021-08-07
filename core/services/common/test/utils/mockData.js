const faker = require("faker");

const mockData = {
  users: {
    createRandom: () => ({
      username: faker.name.findName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
    }),
    data: [
      {
        username: "1",
        email: "msloss0@feedburner12.com",
        password: "60207c04-b0ab-4405-862c-68b9e564d5d4",
      },
      {
        username: "2",
        email: "gabraham1@reuters1.com",
        password: "f0704033-d3c7-4b33-9ce5-0b3f24da1ed3",
      },
      {
        username: "3",
        email: "jdmiterko2@slate2.com",
        password: "67fb019f-9571-4dee-b518-1cd195fabcdf",
      },
      {
        username: "4",
        email: "dmowatt3@discuz3.net",
        password: "5e211d61-17e1-4a54-8f35-dbbd30794acb",
      },
      {
        username: "5",
        email: "zjorcke4@vinaora4.com",
        password: "eaf337d9-05e9-4df7-a665-1e614021c286",
      },
      {
        username: "6",
        email: "rgilhooly5@gravatar5.com",
        password: "a9f79e14-d2e6-44c2-b6f0-576f4946a910",
      },
      {
        username: "7",
        email: "kpeskin6@sun6.com",
        password: "f7e67c22-c3c1-420b-8795-eb5cbca32fcd",
      },
      {
        username: "8",
        email: "dgregan7@bizjournals5.com",
        password: "e1dc95cc-b5d5-45db-9e3b-8bf018af107f",
      },
      {
        username: "9",
        email: "geyton8@sfgate4.com",
        password: "57396dc6-41a9-4988-b031-a607e52e82d5",
      },
      {
        username: "10",
        email: "ulipman9@addthis3.com",
        password: "163b98b6-add1-417f-816d-427a78d323cc",
      },
    ],
  },
  resources: {
    createRandom: (resourceType = "generic") => ({
      title: faker.lorem.sentence(),
      resourceType,
    }),
    data: [
      {
        title: "resource 1",
        resourceType: "generic",
      },
      {
        title: "resource 2",
        resourceType: "file",
        uniqueFingerprint: "sadasdsad",
      },
    ],
  },
};

module.exports = mockData;
