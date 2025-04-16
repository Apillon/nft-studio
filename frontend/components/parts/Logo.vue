<template>
  <img src="/images/logo/simplet.svg" :width="width" :height="height" :alt="alt" />
</template>

<script lang="ts" setup>
defineProps({
  alt: { type: String, default: 'Apillon logo' },
  height: { type: Number, default: 28 },
  width: { type: Number, default: 189 },
});
</script>
