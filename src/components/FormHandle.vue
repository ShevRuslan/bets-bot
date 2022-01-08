<template>
  <q-card class="q-pa-lg wrapper-form">
    <q-file v-model="fileBot" dense outlined label="Бот" style="width: 140px" />
    <q-file
      v-model="fileProxy"
      dense
      outlined
      label="Прокси"
      style="width: 140px"
    />
    <q-btn color="primary" label="Начать парсинг" @click="startParse" />
    <q-btn color="negative" label="Прекратить парсинг" @click="stopParse" />
    <div>Время последнего парсинга: {{ formatDate(timeUpdate) }}</div>
  </q-card>
</template>

<script>
import { ref } from "vue";
import Api from "../services/api";
import { date } from "quasar";
export default {
  setup() {
    const fileBot = ref(null);
    const fileProxy = ref(null);
    let timeUpdate = ref("");
    const startParse = () => {
      const formData = new FormData();
      formData.append("fileBot", fileBot.value);
      formData.append("fileProxy", fileProxy.value);
      Api.startParse(formData);
    };
    const stopParse = () => {
      Api.stopParse();
    };
    setInterval(async () => {
      const { lastTimeUpdate } = await Api.getLastTimeUpdate();
      timeUpdate.value = lastTimeUpdate;
    }, 5000);
    const formatDate = (timestamp) => {
      return date.formatDate(timestamp, "YYYY-MM-DD HH:mm:ss");
    };
    return {
      fileBot,
      fileProxy,
      timeUpdate,
      startParse,
      stopParse,
      formatDate,
    };
  },
};
</script>

<style lang="scss" scoped>
.wrapper-form {
  width: 100%;
  height: 60px;
  display: flex;
  align-items: center;
  gap: 24px;
}
</style>
