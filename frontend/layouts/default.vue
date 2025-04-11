<template>
  <n-layout class="relative h-screen" :native-scrollbar="false">
    <div ref="headerRef">
      <Header admin />
    </div>
    <div class="container my-8">
      <slot />
    </div>
  </n-layout>
</template>

<script lang="ts" setup></script>
