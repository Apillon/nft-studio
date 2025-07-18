<script lang="ts" setup>
import { useMessage } from 'naive-ui';
import { isAddress } from 'viem';
import { AirdropStatus, AirdropMethod } from '~/lib/values/general.values';

enum Step {
  TYPE = 1,
  UPLOAD = 2,
  DATA = 3,
  REVIEW = 4,
  DEPLOYING = 5,
  DEPLOYED = 6,
}

const emit = defineEmits(['close']);
const props = defineProps({
  autoIncrement: { type: Boolean, default: true },
  type: { type: Number, default: 0 },
});
const message = useMessage();
const authStore = useAuthStore();
const userStore = useUserStore();
const { saveRecipients, sendEmails } = useUser();
const { getMaxSupply } = useClaim();

const maxSupply = await getMaxSupply();
const editingRow = ref(-1);
const items = ref<UserInterface[]>([]);
const uploadStep = ref<number>(props.type > 0 ? Step.UPLOAD : Step.TYPE);
const steps = [
  { label: 'Method', value: Step.TYPE },
  { label: 'Upload', value: Step.UPLOAD },
  { label: 'Data', value: Step.DATA },
  { label: 'Review', value: Step.REVIEW },
];
const selectedMethod = ref<number>(props.type);
const methods = [
  {
    value: AirdropMethod.EMAIL,
    title: 'NFT Email Airdrop',
    content: 'Upload a list of emails and send minting invites.',
    icon: 'icon/airdrop',
  },
  {
    value: AirdropMethod.WALLET,
    title: 'NFT Wallet Airdrop',
    content: 'Upload a list of wallet addresses and send minting invites.',
    icon: 'icon/wallet',
  },
];

const availableNFTs = computed(() => maxSupply - userStore.users.length - items.value.length);

const isButtonDisabled = computed(() => {
  switch (uploadStep.value) {
    case Step.TYPE:
      return !selectedMethod.value || availableNFTs.value <= 0;
    case Step.DATA:
      return items.value.length === 0 || availableNFTs.value < 0 || hasEmptyRow() || editingRow.value >= 0;
    default:
      return false;
  }
});
const isMethodWallet = computed(() => selectedMethod.value === AirdropMethod.WALLET);
const exampleFile = computed(() => {
  const isWallet = isMethodWallet.value ? '-wallet' : '';
  const isAutoIncrement = props.autoIncrement ? '' : '-nft';
  return `example${isWallet}${isAutoIncrement}.csv`;
});

const isStep = (step: number) => uploadStep.value === step;
const rowKey = (row: UserInterface) =>
  items.value.findIndex(item => (isMethodWallet.value ? item.wallet === row?.wallet : item.email === row?.email));

const keys = () => items.value.map(item => (isMethodWallet.value ? item.wallet : item.email));
const hasEmptyRow = () => keys().some(item => item === '' || item === null);
const areKeysUnique = () => new Set(keys()).size === keys().length;
const validateEmail = (email: string) => {
  return String(email)
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
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
const updateUser = (row: UserInterface) => {
  if (isMethodWallet.value && (!row.wallet || !isAddress(row.wallet))) {
    message.warning('Please enter a valid wallet address');
  } else if (!isMethodWallet.value && (!row.email || !validateEmail(row.email))) {
    message.warning('Please enter a valid email address');
  } else if (!areKeysUnique()) {
    message.warning('Please enter unique email addresses or wallet addresses');
  } else {
    editingRow.value = -1;
  }
};
const addNewUser = () => {
  if (editingRow.value >= 0 && editingRow.value < items.value.length) {
    updateUser(items.value[editingRow.value]);
    if (editingRow.value >= 0) return;
  }
  if (hasEmptyRow()) {
    editingRow.value = keys().findIndex(item => item === '' || item === null);
  } else {
    items.value.push(createEmptyUser());
    editingRow.value = items.value.length - 1;
  }
};

function onFileUploaded(csvData: CsvItem[]) {
  const data: UserInterface[] = csvData.map(item => Object.assign(createEmptyUser(), item));

  let uploadedAll = true;
  data.forEach(item => {
    if (!isMethodWallet.value && emailAlreadyExists(item?.email || '')) {
      message.warning(`Email: ${item.email} is already on the list`);
      uploadedAll = false;
    } else if (isMethodWallet.value && walletAlreadyExists(item?.wallet || '')) {
      message.warning(`Wallet: ${item.wallet} is already on the list`);
      uploadedAll = false;
    } else {
      items.value.unshift(item as UserInterface);
    }
  });
  if (uploadedAll) {
    uploadStep.value = Step.DATA;
  }

  if (availableNFTs.value < 0) {
    const type = isMethodWallet.value ? 'wallets' : 'emails';
    message.warning(
      `You uploaded too many ${type}. Please remove ${Math.abs(availableNFTs.value)} ${type} on next step.`
    );
  }
}

function emailAlreadyExists(email: string) {
  return items.value.some(item => item.email === email) || userStore.users.some(item => item.email === email);
}
function walletAlreadyExists(wallet: string) {
  return items.value.some(item => item.wallet === wallet) || userStore.users.some(item => item.wallet === wallet);
}

function removeUser(user: UserInterface) {
  if (editingRow.value === rowKey(user)) {
    editingRow.value = -1;
  }
  if (isMethodWallet.value) {
    items.value = items.value.filter(item => item.wallet !== user.wallet);
  } else {
    items.value = items.value.filter(item => item.email !== user.email);
  }
}

async function deploy() {
  uploadStep.value = Step.DEPLOYING;
  const res = await saveRecipients(items.value);
  if (res) {
    await sendEmails();
  }
  userStore.balance = 0;

  uploadStep.value = res ? Step.DEPLOYED : Step.DATA;
}
</script>

<template>
  <drawer
    :progress="uploadStep * 16"
    :steps="steps"
    :active-step="uploadStep"
    title="NFT email airdrop"
    @close="emit('close')"
  >
    <div v-if="isStep(Step.TYPE)" class="max-w-lg w-full mx-auto pt-4 lg:pt-0">
      <Tag v-if="availableNFTs <= 0" type="error" class="absolute top-2 left-1/2 -translate-x-1/2">
        You have exceeded the maximum number of NFTs available for airdrop.
      </Tag>
      <h4>Select distribution methods</h4>
      <div class="mt-2 mb-4">How do you want to distribute your NFTs? Choose an option below.</div>
      <CardSelect
        v-for="method in methods"
        :key="method.value"
        v-bind="method"
        :class="{ 'pointer-events-none': availableNFTs <= 0 }"
        :disabled="availableNFTs <= 0"
        :selected="selectedMethod === method.value"
        :alert="!authStore.smtpConfigured && method.value === AirdropMethod.EMAIL ? 'Needs setup' : ''"
        @click="selectedMethod = method.value"
      />
    </div>
    <div v-else-if="isStep(Step.UPLOAD)" class="max-w-lg w-full mx-auto">
      <div class="mb-4">
        <h4 v-if="isMethodWallet">Upload your wallet list</h4>
        <h4 v-else>Upload your email list</h4>
        <div v-if="isMethodWallet" class="mt-2 mb-4">
          Drop in your CSV file with the wallet addresses you want to send NFTs to.
        </div>
        <div v-else class="mt-2 mb-4">Drop in your CSV file with the email addresses you want to send NFTs to.</div>
        <span class="text-xs">
          Need help structuring your CSV file?
          <a :href="`/files/${exampleFile}`" target="_blank"> Download CSV sample </a>
        </span>
      </div>
      <FormUpload :auto-increment="autoIncrement" :wallet="isMethodWallet" @proceed="onFileUploaded" />
      <div class="my-6">
        <span class="text-xs">OR add manually</span>
      </div>
      <CardSelect
        :icon-class="`min-w-12 rounded bg-grey-placeholder ${isMethodWallet ? 'p-3' : 'p-[14px]'}`"
        :icon="isMethodWallet ? 'icon/wallet' : 'icon/email'"
        :title="isMethodWallet ? 'Add wallets manually' : 'Add emails manually'"
        :content="isMethodWallet ? 'Enter wallet addresses one by one' : 'Enter email addresses one by one'"
        @click="uploadStep = Step.DATA"
      />
    </div>
    <div v-else-if="isStep(Step.DATA)">
      <div class="flex justify-between items-center mb-6">
        <div>
          <h3 class="mb-2">Your NFT {{ isMethodWallet ? 'Wallet' : 'Email' }} Mint list</h3>
          <span>Please check the list before proceeding.</span>
        </div>
        <Btn v-if="availableNFTs > 0" type="secondary" @click="uploadStep = Step.UPLOAD"> Upload more </Btn>
      </div>

      <TableAirdrop
        :auto-increment="autoIncrement"
        :type="selectedMethod"
        :data="items"
        :editing="editingRow"
        :row-key="rowKey"
        @update:row="(v: number) => (editingRow = v)"
        @update:user="updateUser"
        @delete:user="removeUser"
      />
      <div v-if="availableNFTs > 0" class="lg:-mt-8">
        <Btn type="secondary" @click="addNewUser"> Add recipient </Btn>
      </div>
      <Smtp v-if="selectedMethod === AirdropMethod.EMAIL" :bottom="100" />
    </div>
    <PreviewUpload
      v-else-if="isStep(Step.REVIEW)"
      :is-method-wallet="isMethodWallet"
      :num-of-nfts="items.length"
      :max-supply="maxSupply"
      @back="uploadStep = Step.DATA"
      @deploy="deploy"
    />
    <AnimationDeploy v-else-if="isStep(Step.DEPLOYING)" class="min-h-full" />
    <AirdropDeployed
      v-else-if="isStep(Step.DEPLOYED)"
      class="min-h-full"
      :is-method-wallet="isMethodWallet"
      @close="$emit('close')"
    />

    <template v-if="uploadStep < Step.REVIEW" #footer>
      <div class="flex w-full items-center justify-between gap-4 px-10 py-3">
        <p v-if="isStep(Step.DATA)">
          <strong>Total credits: </strong>
          <span>{{ userStore.balance }} credits</span>
        </p>
        <span v-else></span>
        <div class="flex items-center gap-2">
          <Btn v-if="uploadStep > Step.TYPE" class="min-w-40" type="secondary" @click="uploadStep -= 1"> Back </Btn>
          <Btn class="min-w-40" :disabled="isButtonDisabled" @click="uploadStep += 1"> Continue </Btn>
        </div>
      </div>
    </template>
  </drawer>
</template>
