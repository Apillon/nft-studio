<template>
  <div class="flex flex-col gap-4 max-w-lg mx-auto">
    <h2>NFT & Costs details</h2>

    <n-table class="plain mb-6 table-auto" :bordered="false" :single-line="true">
      <tbody>
        <tr v-for="(item, key) in data" :key="key" :class="{ hidden: item.show === false }">
          <td>
            <span class="font-normal">{{ item.label }}</span>
          </td>
          <td class="relative">
            <strong class="text-black dark:text-white">{{ item.value }}</strong>
          </td>
        </tr>
      </tbody>
    </n-table>

    <div class="card-border card p-6">
      <div class="flex gap-2 mb-9">
        <strong class="block w-1/2">Total spend</strong>
        <div class="flex w-1/2 flex-col gap-1 text-right">
          <strong>{{ numOfNfts * mintPrice() }} credits</strong>
          <p class="mt-2 text-xs">Your balance: {{ userStore.balance }} credits</p>
        </div>
      </div>
      <Btn size="large" type="primary" @click="deploy()"> Send minting invites </Btn>
    </div>
  </div>

  <n-modal v-model:show="isSpendingWarningOpen" class="max-w-xl" preset="card" size="small" :mask-closable="false">
    <div class="text-center">
      <NuxtIcon name="icon/alert" class="inline-block text-xl text-pink" filled />
      <h4 class="my-4">Email delivery: Test mode</h4>
      <span>
        You’re using Apillon’s default email sender. It’s great for testing, but emails will not come from your domain
        and may land in the <strong>spam folder</strong>.
      </span>
    </div>
    <template #footer>
      <div class="flex gap-4 mb-4">
        <div class="w-1/2">
          <Btn class="px-4" type="secondary" size="large" @click="$emit('deploy')">Use test now, change it later</Btn>
        </div>
        <div class="w-1/2">
          <Btn size="large" href="https://app.apillon.io/dashboard/simplet/list" @click="isLoggedIn = false">
            Set up my sender now
          </Btn>
        </div>
      </div>
    </template>
  </n-modal>
</template>

<script setup lang="ts">
const emit = defineEmits(['back', 'deploy']);
const props = defineProps({
  isMethodWallet: { type: Boolean, default: false },
  numOfNfts: { type: Number, default: 0 },
  maxSupply: { type: Number, default: 0 },
});

const authStore = useAuthStore();
const userStore = useUserStore();
const isSpendingWarningOpen = ref(false);

onMounted(() => {
  authStore.getConfig();
});

const data = ref<Record<string, string | boolean>[]>([
  { label: 'Total NFTs to distribute this round', value: props.numOfNfts + ' NFTs' },
  {
    label: 'Remaining NFTs in the collection',
    value:
      props.maxSupply === Number.MAX_SAFE_INTEGER
        ? `∞`
        : `${props.maxSupply - userStore.users.length - props.numOfNfts} NFTs`,
  },
  { label: 'Price per NFT', value: mintPrice() + ' credits' },
]);

function deploy() {
  if (!props.isMethodWallet && authStore.smtpConfigured === false) {
    isSpendingWarningOpen.value = true;
  } else {
    emit('deploy');
  }
}
</script>
