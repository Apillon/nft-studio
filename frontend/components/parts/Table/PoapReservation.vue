<template>
  <n-data-table
    :columns="columns"
    :data="userStore.users"
    :loading="userStore.loading"
    :pagination="{ pageSize: PaginationValues.PAGE_DEFAULT_LIMIT }"
    :bordered="false"
  >
    <template #empty>You dont have any reservation yet.</template>
  </n-data-table>
</template>

<script lang="ts" setup>
import type { DataTableColumns } from 'naive-ui';
import { PaginationValues } from '~/lib/values/general.values';

const userStore = useUserStore();
const { getUsers } = useUser();

onMounted(() => {
  getUsers();
});

const columns: DataTableColumns<any> = [
  {
    title: 'Email',
    key: 'email',
    className: '!text-grey-dark',
    minWidth: 150,
  },
  {
    title: 'Wallet',
    key: 'wallet',
    minWidth: 100,
  },
  {
    title: 'Tx hash',
    key: 'txHash',
    minWidth: 100,
  },
  {
    title: 'Airdrop status',
    key: 'airdropStatus',
    minWidth: 100,
    render(row: any) {
      return h(resolveComponent('AirdropStatus'), { status: row.airdrop_status || 0 });
    },
  },
];
</script>
