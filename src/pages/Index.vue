<template>
  <q-page class="flex q-pa-md">
    <FormHandle />
  </q-page>
</template>

<script>
import FormHandle from "../components/FormHandle.vue";
import { defineComponent } from "vue";

export default defineComponent({
  name: "PageIndex",
  components: {
    FormHandle,
  },
});
</script>
