module.exports = [
  {
    id: "39950be5-501f-4f9e-aff8-1ae889441ac5",
    username: 1,
    email: "msloss0@feedburner.com",
    password: "60207c04-b0ab-4405-862c-68b9e564d5d4",
    creationDate: "2020-06-12T00:21:22Z",
  },
  {
    id: "ae0fd088-1498-405d-8564-21a3750b7dc4",
    username: 2,
    email: "gabraham1@reuters.com",
    password: "f0704033-d3c7-4b33-9ce5-0b3f24da1ed3",
    creationDate: "2020-09-16T05:00:55Z",
  },
  {
    id: "f885fe77-2e68-4cff-bf79-8de33eb8abfc",
    username: 3,
    email: "jdmiterko2@slate.com",
    password: "67fb019f-9571-4dee-b518-1cd195fabcdf",
    creationDate: "2020-03-02T03:41:44Z",
  },
  {
    id: "cc662c57-dd9a-494e-979b-83c6024c2dee",
    username: 4,
    email: "dmowatt3@discuz.net",
    password: "5e211d61-17e1-4a54-8f35-dbbd30794acb",
    creationDate: "2019-12-27T13:28:17Z",
  },
  {
    id: "70677c71-c125-4a09-ad77-ea68e6601254",
    username: 5,
    email: "zjorcke4@vinaora.com",
    password: "eaf337d9-05e9-4df7-a665-1e614021c286",
    creationDate: "2020-04-23T19:58:11Z",
  },
  {
    id: "3b17f1ab-e1d9-467b-ab37-21aa5d6c20c0",
    username: 6,
    email: "rgilhooly5@gravatar.com",
    password: "a9f79e14-d2e6-44c2-b6f0-576f4946a910",
    creationDate: "2020-09-21T17:24:27Z",
  },
  {
    id: "23fd292b-1cd7-46e4-9459-aa627410d781",
    username: 7,
    email: "kpeskin6@sun.com",
    password: "f7e67c22-c3c1-420b-8795-eb5cbca32fcd",
    creationDate: "2019-12-06T11:32:58Z",
  },
  {
    id: "789e4cfc-b63e-4773-9d2b-fd51c5432233",
    username: 8,
    email: "dgregan7@bizjournals.com",
    password: "e1dc95cc-b5d5-45db-9e3b-8bf018af107f",
    creationDate: "2020-07-17T09:59:04Z",
  },
  {
    id: "67df82e8-ecbe-4c30-a8f4-e59964e188a9",
    username: 9,
    email: "geyton8@sfgate.com",
    password: "57396dc6-41a9-4988-b031-a607e52e82d5",
    creationDate: "2020-07-14T19:27:07Z",
  },
  {
    id: "9347052a-d7c6-46a9-a169-3c483f3866ed",
    username: 10,
    email: "ulipman9@addthis.com",
    password: "163b98b6-add1-417f-816d-427a78d323cc",
    creationDate: "2020-09-27T05:25:55Z",
  },
].map((u) => ({
  ...u,
  username: `${u.username} User`,
  id: `user:uuid:${u.id}`,
}));