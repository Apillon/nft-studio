<script lang="ts" setup>
const { claimTypeName } = useScreen();
useHead({ title: claimTypeName });
</script>

<template>
  <div class="h-full">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>
