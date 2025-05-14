<script lang="ts" setup>
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
const userStore = useUserStore();
const { saveRecipients } = useUser();
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
      return !selectedMethod.value;
    case Step.DATA:
      return items.value.length === 0 || availableNFTs.value < 0;
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

const rowKey = (row: UserInterface) =>
  items.value.findIndex(item => item.email === row?.email || item.wallet === row?.wallet);

const keys = () => items.value.map(item => (isMethodWallet.value ? item.wallet : item.email));
const hasEmptyRow = () => keys().some(item => item === '' || item === null);
const areKeysUnique = () => new Set(keys()).size === keys().length;

const addNewUser = () => {
  if (hasEmptyRow()) {
    editingRow.value = keys().indexOf(null) || keys().indexOf('');
  } else {
    items.value.push(createEmptyUser());
    editingRow.value = items.value.length - 1;
  }
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
  } else if (!isMethodWallet.value && (!row.email || !row.email_start_send_time || !validateEmail(row.email))) {
    message.warning('Please enter a valid email address and start time');
  } else if (!areKeysUnique()) {
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
      if (emailAlreadyExists(item?.email || '')) {
        message.warning(`Email: ${item.email} is already on the list`);
      } else {
        items.value.unshift(item as UserInterface);
      }
    });
  }
  if (availableNFTs.value < 0) {
    message.warning(`You uploaded too many NFTs. Please remove ${Math.abs(availableNFTs.value)} NFTs on next step.`);
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
  userStore.balance = 0;

  uploadStep.value = res ? Step.DEPLOYED : Step.REVIEW;
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
        <h4 v-if="isMethodWallet">Upload your CSV file with recipients’ wallet addresses</h4>
        <h4 v-else>Upload your CSV file with recipients’ emails</h4>
        <div v-if="isMethodWallet" class="mt-2 mb-4">
          Select and upload the CSV file containing wallet addresses to which you wish to distribute NFTs.
        </div>
        <div v-else class="mt-2 mb-4">
          Select and upload the CSV file containing emails to which you wish to distribute NFTs.
        </div>
        <span class="text-xs">
          Need help structuring your CSV file?
          <a :href="`/files/${exampleFile}`" target="_blank"> Download CSV sample </a>
        </span>
      </div>
      <FormUpload :auto-increment="autoIncrement" :wallet="isMethodWallet" @proceed="onFileUploaded" />
    </div>
    <div v-else-if="uploadStep === Step.DATA">
      <div class="flex justify-between items-center mb-6">
        <div v-if="isMethodWallet">
          <h3 class="mb-2">List of NFT wallet airdrop</h3>
          <span>Please check list before proceed</span>
        </div>
        <div v-else>
          <h3 class="mb-2">List of NFT email airdrop</h3>
          <span>Please check list before proceed</span>
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
    </div>
    <PreviewUpload
      v-else-if="uploadStep === Step.REVIEW"
      :num-of-nfts="items.length"
      :max-supply="maxSupply"
      @back="uploadStep = Step.DATA"
      @deploy="deploy"
    />
    <AnimationDeploy v-else-if="uploadStep === Step.DEPLOYING" class="min-h-full" />
    <AirdropDeployed v-else-if="uploadStep === Step.DEPLOYED" class="min-h-full" @close="$emit('close')" />

    <template v-if="uploadStep < Step.REVIEW" #footer>
      <div class="flex w-full items-center justify-between gap-4 px-10 py-3">
        <p v-if="uploadStep === Step.DATA">
          <strong>Total credits: </strong>
          <span>{{ userStore.balance }} credits</span>
        </p>
        <span v-else></span>
        <div class="flex items-center gap-2">
          <Btn v-if="uploadStep === Step.UPLOAD" class="min-w-40" type="secondary" @click="uploadStep -= 1"> Back </Btn>
          <Btn class="min-w-40" :disabled="isButtonDisabled" @click="uploadStep += 1">
            <span v-if="uploadStep === Step.UPLOAD && items.length === 0"> Skip </span>
            <span v-else> Continue </span>
          </Btn>
        </div>
      </div>
    </template>
  </drawer>
</template>
