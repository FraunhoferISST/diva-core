//Resources
import ResourceProfiling from "@/components/Resource/Profiling/ResourceProfiling";
import ResourceSample from "@/components/Resource/Sample/ResourceSample";
//Assets
import AssetRelations from "@/components/Asset/AssetRelations/AssetRelations.vue";
//Users
import UserGeneral from "@/components/User/UserGeneral/";
import UserActivities from "@/components/User/UserActivities/";
//Entity common views
import EntityCosts from "@/components/Entity/EntityCommonComponents/Costs/EntityCosts";
import EntityHistory from "@/components/Entity/EntityCommonComponents/History/EntityHistory";
import EntityReviews from "@/components/Entity/EntityCommonComponents/Reviews/EntityReviews";
import EntityDetails from "@/views/EntityDetails";
import EntityGeneral from "@/components/Entity/EntityCommonComponents/General/EntityGeneral";
import EntityDataNetwork from "@/components/DataNetwork/EntityDataNetwork";

const ASSET_PREFIX = "asset";
const RESOURCE_PREFIX = "resource";
const USER_PREFIX = "user";
const ENTITY_PREFIX = "entity";

const entityCommonRoutes = (prefix = ENTITY_PREFIX) => [
  {
    path: "costs",
    name: `${prefix}_details_costs`,
    component: EntityCosts,
    props: true,
  },
  {
    path: "history",
    name: `${prefix}_details_history`,
    component: EntityHistory,
    props: true,
  },
  {
    path: "reviews",
    name: `${prefix}_details_reviews`,
    component: EntityReviews,
    props: true,
  },
  {
    path: "datanetwork",
    name: `${prefix}_details_datanetwork`,
    component: EntityDataNetwork,
    props: true,
  },
];

const entityRoutesFactory = ({
  collection = "entities",
  prefix = ENTITY_PREFIX,
  startView = EntityDetails,
  generalView = EntityGeneral,
  routes = undefined,
} = {}) => {
  return {
    path: `${collection}/:id`,
    name: collection,
    component: startView,
    props: (route) => ({
      id: route.params.id,
      routes,
    }),
    redirect: {
      name: `${prefix}_details_general`,
    },
    children: [
      {
        path: "general",
        name: `${prefix}_details_general`,
        component: generalView,
        props: true,
      },
      ...entityCommonRoutes(prefix),
    ],
  };
};

const resourceConfig = entityRoutesFactory({
  collection: "resources",
  prefix: RESOURCE_PREFIX,
  routes: [
    {
      title: "Overview",
      icon: "short_text",
      name: "resource_details_general",
    },
    {
      title: "Costs",
      icon: "attach_money",
      name: "resource_details_costs",
    },
    {
      title: "Profiling",
      icon: "developer_board",
      name: "resource_details_profiling",
    },
    {
      title: "Sample",
      icon: "description",
      name: "resource_details_sample",
    },
    {
      title: "History",
      icon: "history",
      name: "resource_details_history",
    },
    {
      title: "Reviews",
      icon: "question_answer",
      name: "resource_details_reviews",
    },
    {
      title: "Data Network",
      icon: "timeline",
      name: "resource_details_datanetwork",
    },
  ],
});
//Resource specific routes
resourceConfig.children.push(
  {
    path: "profiling",
    name: "resource_details_profiling",
    component: ResourceProfiling,
    props: true,
  },
  {
    path: "sample",
    name: "resource_details_sample",
    component: ResourceSample,
    props: true,
  }
);

const assetConfig = entityRoutesFactory({
  collection: "assets",
  prefix: ASSET_PREFIX,
  routes: [
    {
      title: "General",
      icon: "short_text",
      name: "asset_details_general",
    },
    {
      title: "Costs",
      icon: "attach_money",
      name: "asset_details_costs",
    },
    {
      title: "History",
      icon: "history",
      name: "asset_details_history",
    },
    {
      title: "Reviews",
      icon: "question_answer",
      name: "asset_details_reviews",
    },
    {
      title: "Relations",
      icon: "timeline",
      name: "asset_details_relations",
    },
    {
      title: "Data Network",
      icon: "insights",
      name: "asset_details_datanetwork",
    },
  ],
});
//Asset specific routes
assetConfig.children.push({
  path: "relations",
  name: "asset_details_relations",
  component: AssetRelations,
  props: true,
});

const usersConfig = entityRoutesFactory({
  collection: "users",
  prefix: USER_PREFIX,
  generalView: UserGeneral,
  routes: [
    {
      title: "Overview",
      icon: "short_text",
      name: "user_details_general",
    },
    {
      title: "History",
      icon: "history",
      name: "user_details_history",
    },
    {
      title: "Activities",
      icon: "bolt",
      name: "user_details_activities",
    },
    {
      title: "Data Network",
      icon: "timeline",
      name: "user_details_datanetwork",
    },
  ],
});
//User specific routes
usersConfig.children.push({
  path: "activities",
  name: "user_details_activities",
  component: UserActivities,
  props: true,
});

const entityConfig = entityRoutesFactory();
export default [resourceConfig, assetConfig, usersConfig, entityConfig];
