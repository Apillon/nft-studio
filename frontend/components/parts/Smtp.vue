<template>
  <div v-if="authStore.smtpConfigured === false" class="fixed right-4 z-50" :style="{ bottom: `${bottom}px` }">
    <button
      class="n-button w-9 h-9 rounded-full !bg-bg-darker hover:!bg-bg-dark transition-colors"
      @click="authStore.smtpConfiguredAlert = !authStore.smtpConfiguredAlert"
    >
      <NuxtIcon name="logo/apillon-icon" filled />
    </button>

    <transition name="fade" appear>
      <div
        v-if="authStore.smtpConfiguredAlert"
        class="absolute right-12 bottom-12 min-w-60 sm:min-w-[32rem] max-w-lg"
        :class="$style.bg"
      >
        <div class="relative bg-bg-light border border-black rounded-lg pl-8 p-2" :class="$style.arrow">
          <div class="absolute top-3 left-2">
            <NuxtIcon name="icon/alert" class="text-pink text-lg" filled />
          </div>
          <button
            class="n-button absolute flex-cc -top-4 -right-4 w-8 h-8 !bg-white border border-solid border-grey rounded-full"
            @click="authStore.smtpConfiguredAlert = false"
          >
            <NuxtIcon name="action/close" class="text-bg-dark text-xs" filled />
          </button>
          <h6 class="mb-1">Heads up: your emails might get lost.</h6>
          <p class="text-black leading-normal">
            You're still using the default sender, which is fine for testing—but not for prime time. Want them to land
            properly?
          </p>
          <h6 class="mt-2 inline-block">
            <NuxtLink href="https://app.apillon.io/dashboard/simplet/list" class="font-bold underline" target="_blank">
              Set up your own SMTP server here</NuxtLink
            >
            before going live.
          </h6>
        </div>
      </div>
    </transition>
  </div>
</template>

<script lang="ts" setup>
defineProps({
  bottom: { type: Number, default: 16 },
});
const authStore = useAuthStore();

onMounted(() => {
  authStore.getConfig();
});
</script>

<style lang="postcss" module>
.arrow {
  &::after,
  &::before {
    content: ' ';
    @apply absolute left-full block h-0 w-0 pointer-events-none border-transparent border-solid;
  }

  &::after {
    @apply top-2/3 border-transparent border-l-white border-8;
  }
  &::before {
    @apply top-2/3 border-transparent border-l-black border-[9px] -mt-[1px];
  }
}
.bg {
  &::before {
    content: ' ';
    @apply absolute -top-8 -left-16 -right-16 -bottom-20 bg-white blur-[80px] -z-1;
  }
}
</style>
