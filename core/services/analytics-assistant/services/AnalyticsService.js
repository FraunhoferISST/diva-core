const ElasticsearchConnector = require("@diva/common/databases/ElasticsearchConnector");

const esConnector = new ElasticsearchConnector();

class AnalyticsService {
  async init() {
    return esConnector.connect();
  }

  async countDocumentsByIndex(indexSelection = "*") {
    try {
      const { count } = await esConnector.client.count({
        index: indexSelection,
        body: { query: { match_all: {} } },
      });

      return count.toString();
    } catch (e) {
      if (e.body.error.type === "index_not_found_exception") {
        return "0";
      }
      throw new Error(e.message);
    }
  }

  async entityDistribution() {
    try {
      const res = await esConnector.client.search({
        index: "*,-.*",
        size: 0,
        body: {
          query: { match_all: {} },
          aggs: {
            entityDistribution: {
              terms: { field: "entityType" },
            },
          },
        },
      });

      const total = res.body.hits.total.value;
      const distribution = [];
      res.body.aggregations?.entityDistribution.buckets.forEach((b) => {
        distribution.push({
          entityType: b.key,
          count: b.doc_count,
          percentage: b.doc_count / total,
        });
      });
      return distribution;
    } catch (e) {
      throw new Error(e.message);
    }
  }

  async resourceTypeDistribution() {
    try {
      const res = await esConnector.client.search({
        index: "entities",
        size: 0,
        body: {
          query: {
            match: {
              entityType: "resource",
            },
          },
          aggs: {
            resourceTypeDistribution: {
              terms: { field: "resourceType" },
            },
          },
        },
      });

      const total = res.body.hits.total.value;
      const distribution = [];
      res.body.aggregations?.resourceTypeDistribution.buckets.forEach((b) => {
        distribution.push({
          resourceType: b.key,
          count: b.doc_count,
          percentage: b.doc_count / total,
        });
      });
      return distribution;
    } catch (e) {
      if (e?.meta.body.status === 404) {
        // index_not_found_exception
        return [];
      }
      throw new Error(e.message);
    }
  }

  async resourceMimeTypeDistribution() {
    try {
      const res = await esConnector.client.search({
        index: "entities",
        size: 0,
        body: {
          query: {
            term: {
              resourceType: {
                value: "file",
                boost: 1.0,
              },
            },
          },
          aggs: {
            mimeTypeDistribution: {
              terms: { field: "mimeType" },
            },
          },
        },
      });

      const total = res.body.hits.total.value;
      const distribution = [];
      res.body.aggregations?.mimeTypeDistribution.buckets.forEach((b) => {
        distribution.push({
          mimeType: b.key,
          count: b.doc_count,
          percentage: b.doc_count / total,
        });
      });
      return distribution;
    } catch (e) {
      if (e?.meta.body.status === 404) {
        // index_not_found_exception
        return [];
      }
      throw new Error(e.message);
    }
  }

  async getReviewsStats(id) {
    const res = await esConnector.client.search({
      index: "entities",
      size: 0,
      body: {
        query: {
          bool: {
            must: [
              {
                match: {
                  attributedTo: id,
                },
              },
              {
                match: {
                  entityType: "review",
                },
              },
            ],
          },
        },
        aggs: {
          values: {
            filters: {
              filters: {
                totalReviews: {
                  bool: {
                    must: [
                      {
                        match: {
                          attributedTo:
                            "resource:uuid:4ce1fa1a-d409-493c-8440-edd98c0bbee1",
                        },
                      },
                      {
                        match: {
                          entityType: "review",
                        },
                      },
                    ],
                  },
                },
              },
            },
          },
          avgRating: {
            avg: {
              field: "rating",
            },
          },
        },
      },
    });
    return {
      avgRating: res.body.aggregations?.avgRating.value,
      reviewsCount:
        res.body.aggregations?.values?.buckets?.totalReviews?.doc_count,
    };
  }
}

module.exports = new AnalyticsService();
