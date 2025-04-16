<template>
  <n-data-table
    :bordered="false"
    :columns="columns"
    :data="users"
    :pagination="{ pageSize: PaginationValues.PAGE_DEFAULT_LIMIT }"
  />
</template>

<script lang="ts" setup>
import type { DataTableColumns } from 'naive-ui';
import { AirdropStatus, PaginationValues } from '~/lib/values/general.values';

const props = defineProps({
  autoIncrement: { type: Boolean, default: true },
  users: { type: Array<UserInterface>, required: true },
  wallet: { type: Boolean, default: false },
});
const emit = defineEmits(['addUser', 'removeUser']);
const message = useMessage();

const createColumns = (): DataTableColumns<UserInterface> => {
  return [
    {
      key: 'email',
      title: 'Email',
      render(row: UserInterface, index: number) {
        return h('span', { class: 'whitespace-nowrap text-grey-dark' }, row.email || '');
      },
    },
    {
      key: 'nft_id',
      title: 'NFT ID',
      render(row: UserInterface, index: number) {
        return h('span', { class: 'whitespace-nowrap' }, row.nft_id || '');
      },
    },
    {
      key: 'wallet',
      title: 'Wallet',
      minWidth: 100,
      render(row: UserInterface) {
        return h(resolveComponent('TableEllipsis'), { text: row.wallet }, '');
      },
    },
    {
      key: 'tx_hash',
      title: 'Transaction hash',
      minWidth: 100,
      render(row: UserInterface) {
        return h(resolveComponent('TableEllipsis'), { text: row.tx_hash }, '');
      },
    },
    {
      key: 'airdrop_status',
      title: 'Status',
      minWidth: 100,
      render(row: UserInterface) {
        return AirdropStatus[row.airdrop_status].replaceAll('_', ' ');
      },
    },
    {
      key: 'email_start_send_time',
      title: 'Start time',
      minWidth: 100,
      render(row: UserInterface) {
        return dateTimeToDate(row?.email_start_send_time || '');
      },
    },
    {
      key: 'email_sent_time',
      title: 'Distributed',
      minWidth: 100,
      render(row: UserInterface) {
        return dateTimeToDate(row?.email_sent_time || '');
      },
    },
    {
      key: 'action_remove',
      title: '',
      render(row: UserInterface) {
        if (row.airdrop_status === AirdropStatus.PENDING) {
          return h('button', { class: 'icon-delete text-xl', onClick: () => removeItem(row) }, '');
        }
        return '';
      },
    },
  ];
};
const columns = createColumns();

function removeItem(user: UserInterface) {
  emit('removeUser', user.email);
}
</script>
