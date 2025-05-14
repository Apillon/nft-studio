<template>
  <div class="pb-8">
    <div class="flex justify-between gap-8">
      <div class="mb-8 max-w-2xl lg:pr-10">
        <h6 class="mb-2 text-xs">NFT Brand Booster</h6>
        <h1 class="mb-4">Dashboard</h1>
        <div>
          Reach your audience through email or their wallet address.All NFTs are sent from your Apillon-hosted
          collection. You’ll need enough NFTs in your collection to complete the drop.
        </div>
      </div>
      <Statistics :loading="userStore.loading" :statistics="userStore.statistics" />
    </div>
    <hr class="border-grey-transparent dark:border-bg-lighter my-8" />

    <template v-if="userStore.hasUsers || userStore.loading">
      <n-space class="w-full my-8" size="large" align="center" justify="space-between">
        <div>
          <h4 class="mb-2">Your NFT Airdrops</h4>
          <FormFieldSearch v-model:value="search" />
        </div>
        <n-space size="large">
          <Btn v-if="userStore.hasPending" type="secondary" :loading="loading" @click="send"> Send emails </Btn>
          <Btn @click="openAirdrop(0)">
            <span class="inline-flex items-center gap-1">
              <NuxtIcon name="action/add" class="text-lg" />
              <span class="leading-6"> New NFT Airdrop </span>
            </span>
          </Btn>
        </n-space>
      </n-space>
      <TableUsers :users="users" />
    </template>
    <div v-else>
      <h6 class="mt-8 mb-2">Distribution methods</h6>
      <div class="flex gap-6">
        <Card
          icon="icon/airdrop"
          title="Email Mint"
          content="Upload a list of emails and send minting invites. Users will receive a branded email from you with a link to claim their NFT—no wallet required."
          :tags="['Gasless for users', 'Email user base', 'Rewards', 'Easy claim']"
        >
          <template #additional>
            <div class="flex gap-2 w-full mt-4">
              <Btn class="flex-1" type="secondary">Details</Btn>
              <Btn class="flex-1" type="primary" @click="openAirdrop(AirdropMethod.EMAIL)">Proceed</Btn>
            </div>
          </template>
        </Card>
        <Card
          icon="icon/wallet"
          title="Wallet Mint"
          content="Upload a list of emails and send minting invites. Users will receive a branded email from you with a link to claim their NFT—no wallet required."
          :tags="['Whitelisting', 'Rewards', 'Gasless for users']"
        >
          <template #additional>
            <div class="flex gap-2 w-full mt-4">
              <Btn class="flex-1" type="secondary">Details</Btn>
              <Btn class="flex-1" type="primary" @click="openAirdrop(AirdropMethod.WALLET)"> Proceed </Btn>
            </div>
          </template>
        </Card>
      </div>
    </div>

    <div v-if="modalUploadCsvVisible">
      <AirdropModal
        v-model:show="modalUploadCsvVisible"
        :auto-increment="autoIncrement"
        :type="airdropType"
        @close="modalUploadCsvVisible = false"
      />
    </div>
  </div>
</template>
<script lang="ts" setup>
import { AirdropMethod } from '~/lib/values/general.values';

const userStore = useUserStore();
const { getBalance, sendEmails } = useUser();
const { isAutoIncrement } = useClaim();

const search = ref<string>('');
const airdropType = ref<number>(0);
const loading = ref<boolean>(false);
const autoIncrement = ref<boolean>(true);
const modalUploadCsvVisible = ref<boolean>(false);

const users = computed(() =>
  !search ? userStore.users : userStore.users.filter(user => `${user.email} ${user.wallet}`.includes(search.value))
);

onMounted(async () => {
  getBalance();
  autoIncrement.value = await isAutoIncrement();
});

function openAirdrop(type: number) {
  airdropType.value = type;
  modalUploadCsvVisible.value = true;
}

/** Send emails, so users will be able to claim NFTs */
async function send() {
  loading.value = true;
  await sendEmails();
  loading.value = false;
}
</script>
