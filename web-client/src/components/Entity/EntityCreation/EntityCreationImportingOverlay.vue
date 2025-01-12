<template>
  <div class="importing-overlay px-12 pt-10" :class="{ open: open }">
    <div v-if="open" class="importing-overlay-container">
      <div class="importing-overlay-btn" v-if="isImportingDone">
        <v-btn color="error" text @click="close">
          <v-icon small> close </v-icon>
        </v-btn>
      </div>
      <div class="pb-2">
        <v-chip-group v-model="selectedFilters" column mandatory multiple>
          <v-chip
            small
            color="info"
            active
            filter
            outlined
            value="loading"
            v-if="importing > 0"
          >
            In progress {{ importing }}
          </v-chip>
          <v-chip
            small
            color="success"
            active
            filter
            outlined
            value="success"
            v-if="success > 0"
          >
            Success {{ success }}
          </v-chip>
          <v-chip
            small
            color="warning"
            active
            filter
            outlined
            value="warning"
            v-if="warnings > 0"
          >
            Warning {{ warnings }}
          </v-chip>
          <v-chip
            small
            color="error"
            active
            filter
            outlined
            value="error"
            v-if="errors > 0"
          >
            Error {{ errors }}
          </v-chip>
        </v-chip-group>
        <v-container class="pa-0" fluid>
          <v-row v-if="selectedSource.resources.length === 0">
            <v-col
              cols="12"
              class="d-flex justify-center align-center"
              v-if="!fatalError"
            >
              <vue-ellipse-progress
                color="#2d68fc"
                :prgress="0"
                loading
                :size="150"
                :thickness="1"
                :empty-thickness="0"
              >
                <template #legend-caption>
                  <p>Waiting for data</p>
                </template>
              </vue-ellipse-progress>
            </v-col>
            <v-col cols="12" class="d-flex justify-center align-center" v-else>
              <v-alert text color="error">
                Couldn't proceed with the importing due to some error. Please
                check supplied data and try again.
              </v-alert>
            </v-col>
          </v-row>
        </v-container>
      </div>
      <div class="importing-overlay-resources">
        <v-container class="pa-0" fluid>
          <v-row
            class="importing-resources-container"
            ref="resourcesContainer"
            dense
          >
            <v-col
              cols="12"
              md="6"
              v-for="(entity, i) in paginatedResources"
              :key="i"
            >
              <entity-importing-card :entity="entity" />
            </v-col>
            <v-col cols="12" class="pa-0 py-2">
              <observer @intersect="loadFilteredResourcesPage" />
            </v-col> </v-row
        ></v-container>
      </div>
      <div>
        <div class="d-flex justify-space-between align-center py-4">
          <p class="ma-0">
            <span>{{ done }}</span>
            <span>/</span>
            <span>{{ resourcesCount }}</span>
          </p>
          <v-btn
            text
            color="red"
            rounded
            :disabled="isImportingDone"
            v-if="selectedSource.onCancel"
            @click="cancel"
          >
            Cancel import
          </v-btn>
        </div>
      </div>
    </div>
    <horizontal-progress :loading="!isImportingDone" :progress="progress" />
    <v-snackbar
      rounded
      text
      v-model="snackbar"
      :timeout="10000"
      absolute
      :color="snackbarColor"
    >
      <b>{{ snackbarText }}</b>
    </v-snackbar>
  </div>
</template>

<script>
import HorizontalProgress from "@/components/Base/HorizontalProgress";
import InfiniteScroll from "@/components/Mixins/infiniteScroll";
import Observer from "@/components/Base/Observer";
import EntityImportingCard from "@/components/Entity/EntityCreation/EntityImportingCard";
export default {
  name: "EntityCreationImportingOverlay",
  mixins: [InfiniteScroll],
  components: {
    EntityImportingCard,
    HorizontalProgress,
    Observer,
  },
  props: {
    selectedSource: {
      type: Object,
      required: true,
    },
    open: {
      type: Boolean,
      default: false,
    },
  },
  data: () => ({
    selectedFilters: ["loading", "success", "warning", "error"],
    filtersMap: {
      loading: (resource) => resource.loading,
      success: (resource) => resource.imported && !resource.warning,
      warning: (resource) => resource.warning,
      error: (resource) => resource.error,
    },
    snackbar: false,
    snackbarText: "false",
    snackbarColor: "success",
    page: 0,
    pageSize: 30,
    fatalError: false,
    isDone: false,
  }),
  watch: {
    open(newVal) {
      if (newVal) {
        setTimeout(() => {
          this.selectedSource
            .onCreate()
            .then(() => {
              this.isDone = true;
              if (this.errors > 0) {
                this.showSnackbar(
                  "The import has been completed with errors",
                  "error"
                );
              } else if (this.warnings > 0) {
                this.showSnackbar(
                  "The import has been completed with warnings",
                  "warning"
                );
              } else {
                this.showSnackbar("All data successfully imported!");
              }
            })
            .catch((e) => {
              this.fatalError = true;
              this.showSnackbar(
                `Error occurred while importing resources! ${
                  e?.response?.data?.message ?? e.toString()
                }`,
                "error"
              );
            });
        }, 500);
      }
    },
    selectedFilters() {
      this.resetPagination();
    },
  },
  computed: {
    computedOpen: {
      get() {
        return this.open;
      },
      set(value) {
        this.$emit("update:open", value);
      },
    },
    filteredResources() {
      return this.selectedSource.resources.filter((resource) =>
        this.selectedFilters.some((filterIndex) =>
          this.filtersMap[filterIndex](resource)
        )
      );
    },
    progress() {
      return (this.done * 100) / this.resourcesCount;
    },
    isImportingDone() {
      return this.isDone || this.fatalError || this.progress === 100;
    },
    errors() {
      return this.selectedSource.resources.filter(({ error }) => error).length;
    },
    warnings() {
      return this.selectedSource.resources.filter(({ warning }) => warning)
        .length;
    },
    success() {
      return this.selectedSource.resources.filter(
        ({ imported, warning }) => imported && !warning
      ).length;
    },
    done() {
      return (
        this.selectedSource.processedCount ??
        this.warnings + this.success + this.errors
      );
    },
    importing() {
      return this.resourcesCount - this.done - this.errors - this.warnings;
    },
    pages() {
      return Math.ceil(this.filteredResources.length / this.pageSize);
    },
    paginatedResources() {
      return this.filteredResources.slice(
        0,
        this.page * this.pageSize + this.pageSize
      );
    },
    resourcesCount() {
      return (
        this.selectedSource.totalCount ?? this.selectedSource.resources.length
      );
    },
  },
  methods: {
    reset() {
      this.selectedFilters = ["loading", "success", "warning", "error"];
      this.resetPagination();
      this.fatalError = false;
      this.isDone = false;
      this.snackbar = false;
    },
    resetPagination() {
      this.page = 0;
      if (this.$refs.resourcesContainer) {
        this.$refs.resourcesContainer.scrollTop = 0;
      }
    },
    close() {
      this.computedOpen = false;
      if (!this.fatalError && this.errors !== this.resourcesCount) {
        setTimeout(() => this.$emit("close"), 300);
      }
      this.reset();
    },
    showSnackbar(text, color = "success") {
      this.snackbarText = text;
      this.snackbarColor = color;
      this.snackbar = true;
    },
    cancel() {
      this.selectedSource.onCancel();
    },
    loadFilteredResourcesPage() {
      if (this.page < this.pages) {
        this.page += 1;
      }
    },
  },
};
</script>

<style scoped lang="scss">
.importing-overlay {
  transition: 0.3s;
  position: absolute;
  left: 0;
  top: 100%;
  width: 100%;
  max-height: 100%;
  height: 100%;
  background-color: white;
  z-index: 10;
  &.open {
    top: 0;
  }
}
.importing-overlay-container {
  display: flex;
  height: 100%;
  flex-direction: column;
}
.importing-overlay-btn {
  position: absolute;
  right: 0;
  top: 0;
}
.importing-overlay-resources {
  flex-grow: 1;
  position: relative;
}
.importing-resources-container {
  max-height: 100%;
  width: 100%;
  overflow: auto;
  position: absolute;
}
</style>
