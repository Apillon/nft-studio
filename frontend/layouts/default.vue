<template>
  <n-config-provider :theme="lightTheme" :theme-overrides="NaiveTheme" class="flex h-full flex-col">
    <n-message-provider
      placement="bottom-right"
      :keep-alive-on-hover="true"
      :duration="3000"
      closable
    >
      <n-layout class="relative h-screen" :native-scrollbar="false">
        <div ref="headerRef">
          <Header admin />
        </div>
        <div class="container my-8">
          <slot />
        </div>
      </n-layout>
    </n-message-provider>
  </n-config-provider>
</template>

<script lang="ts" setup>
import { lightTheme } from 'naive-ui';
import { NaiveTheme } from '~/lib/config/naive';
</script>
