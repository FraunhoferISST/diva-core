<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12" md="6" class="d-flex">
        <card header="Recent resources">
          <dashboard-recent-resources />
        </card>
      </v-col>
      <v-col cols="12" md="6" class="d-flex">
        <card header="Recent assets">
          <dashboard-recent-assets />
        </card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import Card from "@/components/Base/Card";
import DashboardRecentResources from "@/components/Dashboard/DashboardRecentActivities/DashboardRecentResources";
import DashboardRecentAssets from "@/components/Dashboard/DashboardRecentActivities/DashboardRecentAssets";
export default {
  name: "DashboardRecentActivities",
  components: {
    DashboardRecentAssets,
    DashboardRecentResources,
    Card,
  },
};
</script>

<style scoped lang="scss"></style>
