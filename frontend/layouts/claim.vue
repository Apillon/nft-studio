<template>
  <n-config-provider :theme="lightTheme" :theme-overrides="NaiveTheme" class="flex h-full flex-col">
    <n-message-provider placement="bottom-right" :keep-alive-on-hover="true" :duration="3000" closable>
      <n-layout class="relative h-screen" :native-scrollbar="false">
        <div ref="headerRef">
          <Header logo-center :hide-login="!!($route.query?.txHash && $route.query?.image)" />
        </div>
        <div class="container max-w-6xl py-8 flex flex-col justify-center box-border" :style="containerStyle">
          <slot />
        </div>
        <div ref="footerRef" class="justify-center">
          <Footer />
        </div>
      </n-layout>
    </n-message-provider>
  </n-config-provider>
</template>

<script lang="ts" setup>
import { lightTheme } from 'naive-ui';
import { NaiveTheme } from '~/lib/config/naive';

const { width } = useWindowSize();

/** Heading height */
const height = ref<number>(0);
const headerRef = ref<HTMLElement>();
const footerRef = ref<HTMLElement>();

const containerStyle = computed(() => {
  return {
    minHeight: `calc(100vh - ${height.value}px)`,
  };
});

onMounted(() => {
  setHeight();
});

watch(
  () => width.value,
  _ => {
    setHeight();
  }
);
function setHeight() {
  height.value = (headerRef.value?.clientHeight || 0) + (footerRef.value?.clientHeight || 0) + 20;
}
</script>
