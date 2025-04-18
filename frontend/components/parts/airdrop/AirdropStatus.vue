<template>
  <Tag :type="getAirdropStatus(status)">
    <span class="first-letter:uppercase">{{ AirdropStatus[status].replaceAll('_', ' ').toLocaleLowerCase() }}</span>
  </Tag>
</template>

<script lang="ts" setup>
import { AirdropStatus } from '~/lib/values/general.values';

defineProps({
  status: {
    type: Number as PropType<AirdropStatus>,
    default: AirdropStatus.PENDING,
  },
});

/** Deployment status */
function getAirdropStatus(status: number) {
  switch (status) {
    case AirdropStatus.EMAIL_SENT:
    case AirdropStatus.IN_WAITING_LINE:
    case AirdropStatus.TRANSACTION_CREATED:
    case AirdropStatus.WALLET_LINKED:
      return 'info';
    case AirdropStatus.AIRDROP_COMPLETED:
      return 'success';
    case AirdropStatus.AIRDROP_CLAIM_EXPIRED:
      return 'warning';
    case AirdropStatus.EMAIL_ERROR:
    case AirdropStatus.AIRDROP_ERROR:
      return 'error';
    default:
      return 'default';
  }
}
</script>
