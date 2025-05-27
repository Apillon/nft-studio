<template>
  <slot v-if="smtpConfigured" />
  <div v-else class="bg-bg-light border border-black p-6 rounded-lg">
    <h4 class="mb-3">SMTP not configured</h4>
    <p class="text-pink">Email delivery is not guaranteed until SMTP is configured.</p>
    <h6 class="mt-2 inline-block text-xs">Setup SMTP</h6>
    <IconInfo tooltip="Open dashboard and configure Simplet's SMTP." size="sm" />
    <BtnLink class="max-w-xl" link="https://app.apillon.io/" />
  </div>
</template>

<script lang="ts" setup>
const config = useRuntimeConfig();

const smtpConfigured = ref(!!config.public.SMTP_HOST && config.public.SMTP_HOST !== 'nft_studio_mail');
</script>
