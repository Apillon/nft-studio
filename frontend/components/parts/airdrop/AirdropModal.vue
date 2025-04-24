<script lang="ts" setup>
import type { DataTableColumns } from 'naive-ui';
import { NButton, NDatePicker, NInput, NInputNumber } from 'naive-ui';
import { AirdropStatus, PaginationValues } from '~/lib/values/general.values';

enum Step {
  TYPE = 1,
  UPLOAD = 2,
  DATA = 3,
  REVIEW = 4,
  DEPLOYING = 5,
  DEPLOYED = 6,
}
enum Method {
  EMAIL = 1,
  WALLET = 2,
}

const emit = defineEmits(['close']);
const props = defineProps({
  autoIncrement: { type: Boolean, default: true },
});
const message = useMessage();
const { saveRecipients } = useUser();

const page = ref(1);
const editingRow = ref(-1);
const items = ref<UserInterface[]>([]);
const uploadStep = ref<number>(Step.TYPE);
const steps = [
  { label: 'Method', value: Step.TYPE },
  { label: 'Upload', value: Step.UPLOAD },
  { label: 'Data', value: Step.DATA },
  { label: 'Review', value: Step.REVIEW },
];
const selectedMethod = ref<number>(0);
const methods = [
  {
    value: Method.EMAIL,
    title: 'NFT Email Airdrop',
    content: 'Upload a list of emails and send minting invites.',
    icon: 'icon/airdrop',
  },
  {
    value: Method.WALLET,
    title: 'NFT Wallet Airdrop',
    content: 'Upload a list of emails and send minting invites.',
    icon: 'icon/wallet',
  },
];

const isButtonDisabled = computed(() => {
  switch (uploadStep.value) {
    case Step.TYPE:
      return !selectedMethod.value;
    case Step.UPLOAD:
    case Step.DATA:
      return items.value.length === 0;
    default:
      return false;
  }
});
const isMethodWallet = computed(() => selectedMethod.value === Method.WALLET);
const exampleFile = computed(() => {
  const isWallet = isMethodWallet.value ? '-wallet' : '';
  const isAutoIncrement = props.autoIncrement ? '' : '-nft';
  return `example${isWallet}${isAutoIncrement}.csv`;
});

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
                    editingRow.value = -1;
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
                    editingRow.value = -1;
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
                    editingRow.value = -1;
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
                editingRow.value = -1;
              }
            },
          });
        }
        return row?.amount ? `${row.amount}` : '';
      },
    });
  }
  {
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
                editingRow.value = -1;
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
              onClick: () => updateUser(row),
            }),
          ]);
        } else {
          return h('div', { class: 'flex justify-end gap-2' }, [
            h(NButton, {
              class: 'w-8 h-8 icon-edit text-xl ',
              ghost: true,
              onClick: () => (editingRow.value = index),
            }),
            h(NButton, {
              class: 'w-8 h-8 icon-delete text-xl text-pink',
              ghost: true,
              onClick: () => removeUser(row),
            }),
          ]);
        }
      },
    },
  ];
};

const rowKey = (row: UserInterface) =>
  items.value.findIndex(item => item.email === row?.email || item.wallet === row?.wallet);

const isEditingRow = (i: number) =>
  editingRow.value === (page.value - 1) * PaginationValues.PAGE_DEFAULT_LIMIT + i;
const keys = () => items.value.map(item => (isMethodWallet.value ? item.wallet : item.email));
const hasEmptyRow = () => keys().some(item => item === '');
const areKeysUnique = () => new Set(keys()).size === keys.length;
const addNewUser = () => {
  items.value.push(createEmptyUser());
  editingRow.value = items.value.length - 1;
};
const createEmptyUser = (): UserInterface => ({
  airdrop_status: AirdropStatus.PENDING,
  amount: 1,
  email: null,
  email_sent_time: null,
  email_start_send_time: new Date().toDateString(),
  nft_id: null,
  wallet: null,
});
const updateUser = async (row: UserInterface) => {
  if (isMethodWallet.value && !row.wallet) {
    message.warning('Please enter a valid wallet address');
  } else if (
    !isMethodWallet.value &&
    (!row.email || !row.email_start_send_time || !validateEmail(row.email))
  ) {
    message.warning('Please enter a valid email address and start time');
  } else if (areKeysUnique()) {
    message.warning('Please enter unique email addresses or wallet addresses');
  } else {
    editingRow.value = -1;
  }
};

function onFileUploaded(csvData: CsvItem[]) {
  const data: UserInterface[] = csvData.map(item => Object.assign(createEmptyUser(), item));

  if (!Array.isArray(items.value) || items.value.length === 0) {
    items.value = data;
  } else {
    data.forEach(item => {
      if (emailAlreadyExists(item.email)) {
        message.warning(`Email: ${item.email} is already on the list`);
      } else {
        items.value.unshift(item as UserInterface);
      }
    });
  }
}

function emailAlreadyExists(email: string) {
  return items.value.some(item => item.email === email);
}

function removeUser(user: UserInterface) {
  if (isMethodWallet.value) {
    items.value = items.value.filter(item => item.wallet !== user.wallet);
  } else {
    items.value = items.value.filter(item => item.email !== user.email);
  }
}

async function deploy() {
  uploadStep.value = Step.DEPLOYING;
  const res = await saveRecipients(items.value);

  uploadStep.value = res ? Step.UPLOAD : Step.REVIEW;
  if (res) emit('close');
}
</script>

<template>
  <drawer
    :progress="uploadStep * 16"
    :steps="steps"
    :active-step="uploadStep"
    title="NFT mail airdrop"
  >
    <div v-if="uploadStep === Step.TYPE" class="max-w-lg w-full mx-auto">
      <h4>Select distribution methods</h4>
      <div class="mt-2 mb-4">How do you want to distribute your NFTs? Choose an option below.</div>
      <CardSelect
        v-for="method in methods"
        :key="method.value"
        v-bind="method"
        :selected="selectedMethod === method.value"
        @click="selectedMethod = method.value"
      />
    </div>
    <div v-else-if="uploadStep === Step.UPLOAD" class="max-w-lg w-full mx-auto">
      <div class="mb-4">
        <h4>Upload your CSV file with recipients’ emails</h4>
        <div class="mt-2 mb-4">
          Select and upload the CSV file containing emails to which you wish to distribute NFTs.
        </div>
        <span class="text-xs">
          Need help structuring your CSV file?
          <a :href="`/files/${exampleFile}`" target="_blank"> Download CSV sample </a>
        </span>
      </div>
      <FormUpload
        :auto-increment="autoIncrement"
        :wallet="isMethodWallet"
        @proceed="onFileUploaded"
      />
    </div>
    <div v-else-if="uploadStep === Step.DATA">
      <div class="flex justify-between items-center mb-6">
        <div>
          <h3 class="mb-2">List of NFT mail airdrop</h3>
          <span>Please check list before proceed</span>
        </div>

        <Btn type="secondary" @click="uploadStep = Step.UPLOAD"> Upload more </Btn>
      </div>

      <n-data-table
        :bordered="false"
        :columns="createColumns()"
        :data="items"
        :pagination="{ pageSize: PaginationValues.PAGE_DEFAULT_LIMIT }"
        :row-key="rowKey"
        @update:page="p => (page = p)"
      />
      <div class="lg:-mt-8">
        <Btn type="secondary" @click="addNewUser"> Add recipient </Btn>
      </div>
    </div>
    <PreviewUpload
      v-else-if="uploadStep === Step.REVIEW"
      :num-of-nfts="items.length"
      @back="uploadStep = Step.DATA"
      @deploy="deploy"
    />
    <AnimationDeploy v-else-if="uploadStep === Step.DEPLOYING" class="min-h-full" />

    <template v-if="uploadStep < Step.REVIEW" #footer>
      <div class="flex w-full items-center justify-between gap-4 px-10 py-3">
        <p v-if="uploadStep === Step.DATA">
          <strong>Total credits: </strong>
          <span>28 000 credits</span>
        </p>
        <span v-else></span>
        <div class="flex items-center gap-2">
          <Btn
            v-if="uploadStep === Step.UPLOAD"
            class="min-w-40"
            type="secondary"
            @click="uploadStep -= 1"
          >
            Back
          </Btn>
          <Btn class="min-w-40" :disabled="isButtonDisabled" @click="uploadStep += 1">Continue</Btn>
        </div>
      </div>
    </template>
  </drawer>
</template>
