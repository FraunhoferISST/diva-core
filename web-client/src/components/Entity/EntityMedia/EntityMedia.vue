<template>
  <div>
    <v-btn
      v-if="type === 'avatar'"
      icon
      width="100px"
      height="100px"
      @click="toggleEditor"
    >
      <entity-avatar
        size="100"
        :entity-id="entity.id"
        :image-id="entity.entityIcon"
        :entity-title="entity.title || entity.username"
      />
    </v-btn>
    <entity-banner
      v-else
      size="300"
      :entity-id="entity.id"
      :image-id="entity.entityBanner"
      :entity-title="entity.title || entity.username"
    ></entity-banner>
    <entity-media-editor :open.sync="showEditor" :entity="entity" />
  </div>
</template>

<script>
import EntityAvatar from "@/components/Entity/EntityAvatar";
import EntityBanner from "@/components/Entity/EntityBanner";
import EntityMediaEditor from "@/components/Entity/EntityMedia/EntityMediaEditor";
export default {
  name: "EntityMedia",
  components: { EntityMediaEditor, EntityAvatar, EntityBanner },
  props: {
    entity: {
      type: Object,
      required: true,
    },
    type: {
      type: String,
      default: "avatar",
    },
  },
  data: () => ({
    showEditor: false,
  }),
  methods: {
    toggleEditor() {
      this.showEditor = !this.showEditor;
    },
  },
};
</script>

<style scoped></style>
