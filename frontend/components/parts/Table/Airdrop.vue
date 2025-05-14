<script lang="ts" setup>
import type { DataTableColumns } from 'naive-ui';
import { NButton, NDatePicker, NInput, NInputNumber } from 'naive-ui';
import { AirdropStatus, AirdropMethod, PaginationValues } from '~/lib/values/general.values';

const emit = defineEmits(['update:user', 'delete:user', 'update:row']);
const props = defineProps({
  autoIncrement: { type: Boolean, default: true },
  editing: { type: Number, default: -1 },
  type: { type: Number, default: 0 },
});

const page = ref(1);
const editingRow = ref(props.editing);

watch(
  () => props.editing,
  val => {
    editingRow.value = val;
  }
);
const editRow = (val = -1) => {
  editingRow.value = val;
  emit('update:row', val);
};

const isMethodWallet = computed(() => props.type === AirdropMethod.WALLET);

const isEditingRow = (i: number) => editingRow.value === (page.value - 1) * PaginationValues.PAGE_DEFAULT_LIMIT + i;

const createColumns = (): DataTableColumns<UserInterface> => {
  const cols = isMethodWallet.value
    ? [
        {
          key: 'wallet',
          title: 'Wallet',
          minWidth: 100,
          render(row: UserInterface, index: number) {
            if (isEditingRow(index)) {
              return h(NInput, {
                value: row.wallet,
                onUpdateValue(v) {
                  row.wallet = v;
                },
                onKeyup(e: KeyboardEvent) {
                  if (e.key === 'Enter') {
                    editRow();
                  }
                },
              });
            }
            return h(resolveComponent('TableEllipsis'), { text: row.wallet, copy: false }, '');
          },
        },
      ]
    : [
        {
          key: 'email',
          title: 'Email',
          render(row: UserInterface, index: number) {
            if (isEditingRow(index)) {
              return h(NInput, {
                value: row.email,
                onUpdateValue(v) {
                  row.email = v;
                },
                onKeyup(e: KeyboardEvent) {
                  if (e.key === 'Enter') {
                    editRow();
                  }
                },
              });
            }
            return h('span', { class: 'text-black dark:text-white' }, row?.email || '');
          },
        },
        {
          key: 'email_start_send_time',
          title: 'Start time',
          minWidth: 100,
          render(row: UserInterface, index: number) {
            if (isEditingRow(index)) {
              return h(NDatePicker as any, {
                value: row.email_start_send_time,
                type: 'datetime',
                onUpdateValue(v: any) {
                  row.email_start_send_time = v;
                },
                onKeyup(e: KeyboardEvent) {
                  if (e.key === 'Enter') {
                    editRow();
                  }
                },
              });
            } else {
              return dateTimeToDate(row?.email_start_send_time || '');
            }
          },
        },
      ];

  if (props.autoIncrement) {
    cols.push({
      key: 'amount',
      title: 'NFT amount',
      minWidth: 80,
      render(row: UserInterface, index: number) {
        if (isEditingRow(index)) {
          return h(NInputNumber, {
            value: row.amount,
            onUpdateValue(v) {
              row.amount = v || 0;
            },
            onKeyup(e: KeyboardEvent) {
              if (e.key === 'Enter') {
                editRow();
              }
            },
          });
        }
        return row?.amount ? `${row.amount}` : '';
      },
    });
  } else {
    cols.push({
      key: 'nft_id',
      title: 'NFT ID',
      minWidth: 80,
      render(row: UserInterface, index: number) {
        if (isEditingRow(index)) {
          return h(NInputNumber, {
            value: row.nft_id,
            onUpdateValue(v) {
              row.nft_id = v || 0;
            },
            onKeyup(e: KeyboardEvent) {
              if (e.key === 'Enter') {
                editRow();
              }
            },
          });
        }
        return row?.nft_id ? `${row.nft_id}` : '';
      },
    });
  }

  return [
    ...cols,
    {
      key: 'airdrop_status',
      title: 'Status',
      minWidth: 100,
      render(row: UserInterface) {
        return AirdropStatus[row.airdrop_status].replaceAll('_', ' ');
      },
    },
    {
      key: 'actions',
      title: '',
      render(row: UserInterface, index: number) {
        if (isEditingRow(index)) {
          return h('div', { class: 'flex justify-end gap-2' }, [
            h(NButton, {
              class: 'w-8 h-8 icon-check text-xl',
              ghost: true,
              onClick: () => emit('update:user', row),
            }),
          ]);
        } else {
          return h('div', { class: 'flex justify-end gap-2' }, [
            h(NButton, {
              class: 'w-8 h-8 icon-edit text-xl ',
              ghost: true,
              onClick: () => editRow(index),
            }),
            h(NButton, {
              class: 'w-8 h-8 icon-delete text-xl text-pink',
              ghost: true,
              onClick: () => emit('delete:user', row),
            }),
          ]);
        }
      },
    },
  ];
};
</script>

<template>
  <n-data-table
    :bordered="false"
    :columns="createColumns()"
    :pagination="{ pageSize: PaginationValues.PAGE_DEFAULT_LIMIT }"
    @update:page="p => (page = p)"
  />
</template>
