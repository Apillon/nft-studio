<script lang="ts" setup>
import { lightTheme } from 'naive-ui';
import { NaiveTheme } from '~/lib/config/naive';
</script>

<template>
  <div class="h-full">
    <n-config-provider :theme="lightTheme" :theme-overrides="NaiveTheme" class="flex h-full flex-col">
      <n-message-provider placement="bottom-right" :keep-alive-on-hover="true" :duration="3000" closable>
        <NuxtLayout>
          <NuxtPage />
        </NuxtLayout>
      </n-message-provider>

      <n-global-style />
    </n-config-provider>
  </div>
</template>
