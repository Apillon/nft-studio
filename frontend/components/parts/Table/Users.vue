<template>
  <n-data-table
    :bordered="false"
    :columns="columns"
    :data="Object.values(data)"
    :default-expanded-row-keys="[1]"
    :indent="0"
    :loading="userStore.loading"
    :row-key="row => row.batch || Number(`${row.airdrop_status}${row.id}`)"
    :pagination="{ pageSize: PaginationValues.PAGE_DEFAULT_LIMIT }"
  />
</template>

<script lang="ts" setup>
import { useMessage, type DataTableColumns } from 'naive-ui';
import { dateTimeToDate, dateTimeToDateAndTime } from '~/lib/misc/dates';
import { AirdropStatus, PaginationValues } from '~/lib/values/general.values';

type Batch = {
  batch: number;
  date: string;
  email_sent_time: string;
  children: UserInterface[];
};

const props = defineProps({
  autoIncrement: { type: Boolean, default: true },
  search: { type: String, default: null },
  users: { type: Array<UserInterface>, required: true },
});
const message = useMessage();
const userStore = useUserStore();
const { fetchStatistics } = useUser();
const { handleError } = useErrors();
const loading = ref<number>(-1);

const data = computed(() => {
  if (props.search) {
    return props.users;
  }
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
              return 'batch' in row ? null : row?.amount || '1';
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
        const actions = [];
        if (row.airdrop_status === AirdropStatus.PENDING) {
          actions.push(
            h('button', { class: 'icon-delete text-xl', onClick: () => handleDeleteUser(Number(row.id)) }, '')
          );
        }
        return h('div', { class: 'flex gap-3 justify-end items-center' }, actions);
      },
    },
  ];
};
const columns = createColumns();

async function handleDeleteUser(id: number) {
  loading.value = id;

  try {
    await $api.delete('/users/' + id);

    // Remove the user from the table
    userStore.users = userStore.users.filter(user => user.id !== id);

    await fetchStatistics();
    message.success('User successfully deleted.');
  } catch (e) {
    handleError(e);
    message.error('Failed to delete user, please try again later.');
  } finally {
    loading.value = -1;
  }
}
</script>
