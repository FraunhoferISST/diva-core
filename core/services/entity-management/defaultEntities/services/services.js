module.exports = [
  // internal services
  {
    title: "Entity Management Service",
    description:
      "Manages metadata of entities and publishes CRUD events to kafka",
    serviceName: "entity-management",
    id: "service:uuid:f1bfc29c-6cda-4e38-b5ef-1c6ba8134ff3",
    serviceType: "internal",
    entityType: "service",
  },
  {
    title: "Business Decision Point",
    description: "Manages policies and rules",
    serviceName: "business-decision-point",
    id: "service:uuid:037ca2aa-571b-4b8a-9eed-7f344cc28447",
    serviceType: "internal",
    entityType: "service",
  },
  {
    title: "Business Rules Executor",
    description: "Executes business rules on messages",
    serviceName: "business-rules-executor",
    id: "service:uuid:0354104d-550d-40a7-81ab-587ff4c5633a",
    serviceType: "internal",
    entityType: "service",
  },
  // FaaS Bots
  {
    title: "Similarity Network Bot",
    description:
      "Runs as cron job. Calculates similarity between entities according to keyword similarity and content similarity (if available)",
    serviceName: "similarity-network-bot",
    id: "service:uuid:f144b46a-6dfe-4dac-8fbc-611622e57394",
    serviceType: "faas",
    entityType: "service",
  },
  {
    title: "Entity Delete Bot",
    description:
      "Runs as cron job. Deletes entities that have a entityToBeDeleted date that is expired.",
    serviceName: "entity-delete-bot",
    id: "service:uuid:8640d5de-91fe-486a-9378-b8350ede33a5",
    serviceType: "faas",
    entityType: "service",
  },
  {
    title: "Entity Archive Bot",
    description:
      "Runs as cron job. Archives entities that have a entityToBeArchived date that is expired.",
    serviceName: "entity-archive-bot",
    id: "service:uuid:cfca72e0-4db4-47ea-bba5-0881be5e670a",
    serviceType: "faas",
    entityType: "service",
  },
  // FaaS
  {
    title: "Keywords Similarity Hash Generator",
    description:
      "Can be triggered through airflow to calculate a similarity hash for keywords.",
    serviceName: "keywords-similarity-hash-generator",
    id: "service:uuid:ff98d351-7fe5-433f-bf68-90545c70de6b",
    serviceType: "faas",
    entityType: "service",
  },
  {
    title: "Entity Management Sink",
    description:
      "Service that can patch an entities analytics results from a workflow.",
    serviceName: "entity-management-sink",
    id: "service:uuid:9ac1e8f9-cfe8-4ae4-81bc-07151c7c4978",
    serviceType: "faas",
    entityType: "service",
  },
  // FaaS Image Analytics
  {
    title: "Image Caption Generator",
    description:
      "A wrapper FaaS that triggers a caption generator IBM service.",
    serviceName: "image-caption-generator",
    id: "service:uuid:1eea5348-ed9c-49cb-81c3-20f2e9f852cf",
    serviceType: "faas",
    entityType: "service",
  },
  {
    title: "Image Metadata Extractor",
    description: "Service that extracts EXIF metadata from jpgs.",
    serviceName: "image-metadata-extractor",
    id: "service:uuid:8cb29cd9-2b12-4547-b440-08cb9028bf5a",
    serviceType: "faas",
    entityType: "service",
  },
  {
    title: "Image Object Detection",
    description: "A wrapper FaaS that triggers a object detection IBM service.",
    serviceName: "image-object-detection",
    id: "service:uuid:6e918b98-c83a-45f4-95eb-5d51385741e5",
    serviceType: "faas",
    entityType: "service",
  },
  {
    title: "Image Sample Extractor",
    description: "Service that creates a thumbnail from an jpg or png.",
    serviceName: "image-sample-extractor",
    id: "service:uuid:4865fa98-7b0d-4db3-a211-7ccf60afc038",
    serviceType: "faas",
    entityType: "service",
  },
  {
    title: "Image Text Extractor",
    description: "Service that uses OCR to extract text from an picture.",
    serviceName: "image-text-extractor",
    id: "service:uuid:5e65756f-5761-41ce-ab9a-1ee7b5c8f662",
    serviceType: "faas",
    entityType: "service",
  },
  // FaaS Table Data
  {
    title: "Table Data Apriori Associations Extractor",
    description: "Service that calculates associations between columns.",
    serviceName: "table-data-apriori-associations-extractor",
    id: "service:uuid:6ade4eb1-00fd-4cfa-a605-4d5ab25c8efc",
    serviceType: "faas",
    entityType: "service",
  },
  {
    title: "Table Data Column Statistican",
    description:
      "Service that calculates standard statistics for each column in the table.",
    serviceName: "table-data-column-statistican",
    id: "service:uuid:8bb987fa-d9bf-4a35-b8ba-dc90b9f3f987",
    serviceType: "faas",
    entityType: "service",
  },
  {
    title: "Table Data Metadata Extractor",
    description: "Service that extracts metadata from a csv file.",
    serviceName: "table-data-metadata-extractor",
    id: "service:uuid:f76cd916-ed17-41d9-b07a-31b39fcb1a4c",
    serviceType: "faas",
    entityType: "service",
  },
  {
    title: "Table Data Sample Extractor",
    description: "Service that extracts ~20 rows from the table as sample.",
    serviceName: "table-data-sample-extractor",
    id: "service:uuid:8e34555c-601f-4f87-9caa-1fbcca9ba4b2",
    serviceType: "faas",
    entityType: "service",
  },
  {
    title: "Table Data Schema Extractor",
    description: "Service that extracts the schema of the table.",
    serviceName: "table-data-schema-extractor",
    id: "service:uuid:aa48a478-010e-4b27-95b4-94461a2cf8f5",
    serviceType: "faas",
    entityType: "service",
  },
  {
    title: "Table Data to CSV",
    description: "Service that (currently only) transforms sas7bdat to csv.",
    serviceName: "table-data-to-csv",
    id: "service:uuid:19232684-53f1-4235-8656-0731ee63bcf0",
    serviceType: "faas",
    entityType: "service",
  },
  // Faas Text
  {
    title: "Text Core Phrase Extractor",
    description:
      "Service that extractes core phrases according to a set of algorithms.",
    serviceName: "text-core-phrase-extractor",
    id: "service:uuid:570a8fc7-47eb-44d0-8200-e6655b60b09a",
    serviceType: "faas",
    entityType: "service",
  },
  {
    title: "Text Keyword Extractor",
    description: "Service that extracts keywords from a text.",
    serviceName: "text-keyword-extractor",
    id: "service:uuid:a0bc8f6b-824c-4a0f-9db5-5f684a34b8bb",
    serviceType: "faas",
    entityType: "service",
  },
  {
    title: "Text Language Guesser",
    description: "Service that guesses the language of a text.",
    serviceName: "text-language-guesser",
    id: "service:uuid:2c2455be-4865-431b-9e0f-d8f256109788",
    serviceType: "faas",
    entityType: "service",
  },
  {
    title: "Text Metadata Extractor",
    description:
      "Service that extracts metadata from pdf, word and other text files.",
    serviceName: "text-metadata-extractor",
    id: "service:uuid:5c1c1105-ba6c-40aa-b07d-77068b0bc974",
    serviceType: "faas",
    entityType: "service",
  },
  {
    title: "Text Personal Data Evaluation",
    description:
      "Service that calculates GDPR metric according to count of personal data.",
    serviceName: "text-personal-data-evaluation",
    id: "service:uuid:10dade28-97b7-4ae8-b1d2-95ca4afe004b",
    serviceType: "faas",
    entityType: "service",
  },
  {
    title: "Text Similarity Hash Generator",
    description:
      "Service that generates a similarity hash from the content of the text.",
    serviceName: "text-similarity-hash-generator",
    id: "service:uuid:c63d828a-3077-4769-8386-4bc9de86e97d",
    serviceType: "faas",
    entityType: "service",
  },
  {
    title: "Text Statistican",
    description: "Service that calculates statistics from a text.",
    serviceName: "text-statistican",
    id: "service:uuid:9b3b637c-5627-42a3-b984-0fa8953fb126",
    serviceType: "faas",
    entityType: "service",
  },
  {
    title: "TIKA Extraction",
    description:
      "Service that extracts the raw text from an pdf, word and other file formats.",
    serviceName: "tika-extraction",
    id: "service:uuid:2045664d-6325-4526-a280-fc5793bcb730",
    serviceType: "faas",
    entityType: "service",
  },
];
