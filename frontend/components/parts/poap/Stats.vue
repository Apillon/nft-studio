<template>
  <Tag v-if="status !== null" :type="getPoapStatus(status)">
    <span class="first-letter:uppercase leading-normal">
      <slot>
        <template v-if="status === PoapStatus.WAITING">Waiting</template>
        <template v-else-if="status === PoapStatus.IN_PROGRESS">Event running</template>
        <template v-else>Concluded</template>
      </slot>
    </span>
  </Tag>
</template>

<script lang="ts" setup>
import { PoapStatus } from '~/lib/values/general.values';

defineProps({
  status: { type: Number, default: null },
});

/** Poap status */
function getPoapStatus(status: number) {
  switch (status) {
    case PoapStatus.WAITING:
      return 'info';
    case PoapStatus.IN_PROGRESS:
      return 'success';
    default:
      return 'default';
  }
}
</script>
