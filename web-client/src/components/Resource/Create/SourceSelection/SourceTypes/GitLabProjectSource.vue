<template>
  <v-container class="pa-0 fluid">
    <v-row>
      <v-col cols="12">
        <custom-header
          text="Specify project title and project id for new GitLab Project"
        />
      </v-col>
      <v-col cols="12">
        <v-row dense v-for="(resource, i) in computedSource.resources" :key="i">
          <v-col cols="12" :md="6">
            <div class="d-flex align-center pb-2">
              <source-text-input
                label="GitLab Project URL"
                :value.sync="resource.gitLabProjectUrl"
                :rules="urlValidationRules"
              />
              <v-tooltip top open-delay="600" max-width="400px" v-if="i === 0">
                <template #activator="{ on, attrs }">
                  <v-icon color="primary" large v-bind="attrs" v-on="on">
                    info_outline
                  </v-icon>
                </template>
                <span>E.g. "https://gitlab.my-company.com"</span>
              </v-tooltip>
            </div>
          </v-col>
          <v-col cols="6" :md="6">
            <div class="d-flex align-center">
              <source-text-input
                label="GitLab Project ID"
                :value.sync="resource.gitLabProjectId"
                :rules="idValidationRules"
              />
              <v-tooltip top open-delay="600" max-width="400px" v-if="i === 0">
                <template #activator="{ on, attrs }">
                  <v-icon color="primary" large v-bind="attrs" v-on="on">
                    info_outline
                  </v-icon>
                </template>
                <span>ID looks like this: 4356</span>
              </v-tooltip>
              <div class="pl-2" v-if="computedSource.resources.length > 1">
                <v-btn icon color="error" @click="() => onRemoveTab(i)">
                  <v-icon small color="error"> close </v-icon>
                </v-btn>
              </div>
            </div>
          </v-col>
        </v-row>
      </v-col>
      <v-col cols="12">
        <v-btn icon color="primary">
          <v-icon dense color="primary" @click="onAdd"> add </v-icon>
        </v-btn>
      </v-col>
      <v-col cols="12">
        <v-alert text dense type="info" class="ma-0">
          Your can add multiple GitLab Projects at once. We require a project
          name and the project id. Later you can enrich it with more useful
          metadata.
        </v-alert>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import CustomHeader from "@/components/Base/CustomHeader";
import SourceTextInput from "@/components/Resource/Create/SourceSelection/SourceCreationFields/SourceTextInput";
export default {
  name: "GitLabProjectSource",
  components: {
    SourceTextInput,
    CustomHeader,
  },
  props: {
    source: {
      type: Object,
      required: true,
    },
  },
  data: () => ({
    gitLabAccountResource: {
      title: "",
      gitLabProjectId: "",
      gitLabProjectUrl: "",
      resourceType: "gitlab:project",
      entityType: "resource",
      error: "",
      warning: "",
      imported: false,
      loading: true,
    },
    urlValidationRules: [
      (value) => !!value || "GitLab Project URL is required",
      (value) => {
        let url;
        try {
          url = new URL(value);
        } catch (_) {
          return false;
        }
        return (
          url.protocol === "http:" ||
          url.protocol === "https:" ||
          "GitLab Project URL is not valid"
        );
      },
    ],
    idValidationRules: [
      (value) => {
        const pattern = /^[0-9]+$/g;
        return pattern.test(value) || "Invalid GitLab Project ID";
      },
    ],
  }),
  watch: {
    isReady() {
      this.computedSource.isReady = this.isReady;
    },
  },
  computed: {
    isReady() {
      return this.computedSource.resources.every(
        ({ gitLabProjectId, gitLabProjectUrl }) =>
          gitLabProjectId && gitLabProjectUrl
      );
    },
    computedSource: {
      get() {
        return this.source;
      },
      set(val) {
        this.$emit("update:source", val);
      },
    },
  },
  methods: {
    create() {
      return Promise.all(
        this.computedSource.resources.map((resource) => {
          resource.loading = true;
          resource.imported = false;
          resource.warning = "";
          resource.error = "";

          const {
            gitLabProjectId,
            gitLabProjectUrl,
            resourceType,
            entityType,
          } = resource;
          resource.title = gitLabProjectUrl;
          return this.$api.resources
            .create({
              title: gitLabProjectUrl,
              gitLabProjectId,
              gitLabProjectUrl,
              resourceType,
              entityType,
            })
            .then(({ data }) => {
              resource.id = data;
              resource.imported = true;
            })
            .catch((e) => {
              resource.error =
                e?.response?.data?.message ??
                e?.message ??
                "Some error occurred";
            })
            .finally(() => {
              resource.loading = false;
            });
        })
      );
    },
    onAdd() {
      this.computedSource.resources.push({ ...this.gitLabAccountResource });
    },
    onRemoveTab(i) {
      this.computedSource.resources.splice(i, 1);
    },
  },
  mounted() {
    this.computedSource.onCreate = this.create;
    this.computedSource.resources = [{ ...this.gitLabAccountResource }];
  },
};
</script>

<style scoped lang="scss"></style>
