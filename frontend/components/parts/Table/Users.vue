<template>
  <n-data-table
    :bordered="false"
    :columns="columns"
    :data="Object.values(data)"
    :default-expanded-row-keys="[1]"
    :indent="0"
    :row-key="row => row.batch || Number(`${row.airdrop_status}${row.id}`)"
    :pagination="{ pageSize: PaginationValues.PAGE_DEFAULT_LIMIT }"
  />
</template>

<script lang="ts" setup>
import type { DataTableColumns } from 'naive-ui';
import { AirdropStatus, PaginationValues } from '~/lib/values/general.values';

type Batch = {
  batch: number;
  date: string;
  email_sent_time: string;
  children: UserInterface[];
};

const props = defineProps({
  autoIncrement: { type: Boolean, default: true },
  users: { type: Array<UserInterface>, required: true },
  wallet: { type: Boolean, default: false },
});

const data = computed(() => {
  // TODO: group data by createTime, so all users with the same createTime are grouped together as children
  return props.users.reduce(
    (acc, user) => {
      const date = dateTimeToDateAndTime(user?.createTime || '');
      if (!acc[date]) {
        acc[date] = {
          batch: (Object.keys(acc).length || 0) + 1,
          date,
          email_sent_time: dateTimeToDate(user?.createTime || ''),
          children: [],
        };
      }
      acc[date].children.push(user);
      return acc;
    },
    {} as Record<string, Batch>
  );
});

const createColumns = (): DataTableColumns<UserInterface> => {
  return [
    {
      key: 'id',
      title: 'ID',
      width: 50,
    },
    {
      key: 'method',
      title: 'Method',
      render(row: UserInterface | Batch) {
        return 'batch' in row
          ? h('strong', { class: 'text-grey-dark' }, `Batch ${row.batch}`)
          : row.email
            ? 'Email Airdrop'
            : 'Wallet Airdrop';
      },
    },
    {
      key: 'email',
      title: 'Email/Wallet',
      className: '!text-grey-dark',
      minWidth: 100,
      ellipsis: {
        tooltip: true,
      },
      render(row: UserInterface) {
        return row.email || row.wallet || '';
      },
    },
    ...(!props.autoIncrement
      ? [
          {
            key: 'nft_id',
            title: 'Assigned NFT',
            render(row: UserInterface) {
              return row?.nft_id || '';
            },
          },
        ]
      : [
          {
            key: 'amount',
            title: 'NFT amount',
            render(row: UserInterface) {
              return row?.amount || '1';
            },
          },
        ]),
    {
      key: 'airdrop_status',
      title: 'Status',
      minWidth: 100,
      render(row: UserInterface) {
        return 'batch' in row
          ? h('strong', { class: 'text-grey-dark' }, dateTimeToDate(row?.email_sent_time || ''))
          : row.airdrop_status
            ? h(resolveComponent('AirdropStatus'), { status: row.airdrop_status || 0 })
            : '';
      },
    },
    {
      key: 'email_sent_time',
      title: 'Distributed',
      minWidth: 100,
      render(row: UserInterface) {
        return 'batch' in row
          ? h('strong', { class: 'text-grey-dark' }, dateTimeToDate(row?.email_sent_time || ''))
          : dateTimeToDate(row?.email_sent_time || '');
      },
    },
    {
      key: 'action_remove',
      title: 'Actions',
      render(row: UserInterface) {
        if (row.airdrop_status === AirdropStatus.PENDING) {
          return h('button', { class: 'icon-delete text-xl', onClick: () => {} }, '');
        }
        return '';
      },
    },
  ];
};
const columns = createColumns();
</script>
