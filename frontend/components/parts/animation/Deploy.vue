<template>
  <div class="flex-cc min-h-52">
    <div class="text-center">
      <AnimationLoader :size="128" />
      <h2 v-if="title">{{ title }}</h2>
      <h2>Sending invites</h2>
      <p class="mb-8 whitespace-pre-line text-body">
        <span v-if="content"> {{ content }} </span>
        <span v-else> We’re building and making it live — hang tight!</span>
      </p>
    </div>
  </div>
</template>

<script lang="ts" setup>
defineProps({
  title: { type: String, default: '' },
  content: { type: String, default: '' },
});
</script>
