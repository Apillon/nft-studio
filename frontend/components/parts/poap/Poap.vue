<template>
  <div class="pb-8">
    <div class="flex justify-between gap-8">
      <div class="max-w-4xl lg:pr-10">
        <h6 class="mb-2 text-xs">NFT Event Experience</h6>
        <h1 class="mb-4">Dashboard</h1>
        <div>
          Create PoAP-style drops in just a click. Let users mint on the spot or email-reserve their NFTs for later. All
          NFTs are sent from your Apillon-hosted collection. You’ll need enough NFTs in your collection to complete the
          drop.
        </div>
      </div>
      <Statistics :loading="userStore.loading" :statistics="userStore.statistics" />
    </div>
    <hr class="border-grey-transparent dark:border-bg-lighter my-8" />

    <div class="card-light relative">
      <div class="flex gap-4 items-center mb-4">
        <h5>Your PoAP</h5>
        <LazyPoapStatus v-if="poapStatus !== null" :key="poapStatus" :status="poapStatus" />
      </div>

      <div class="flex flex-col lg:flex-row items-center justify-between gap-y-4 gap-x-8">
        <div v-if="poapStatus === PoapStatus.WAITING">
          <strong>Event starts in</strong>
          <Timer :date-time-to="config.public.CLAIM_START" />
        </div>
        <div
          v-else-if="poapStatus === PoapStatus.IN_PROGRESS && Number(config.public.CLAIM_END) === 0"
          class="md:w-1/3"
        >
          <strong>Event in progress</strong>
        </div>
        <div v-else-if="poapStatus === PoapStatus.IN_PROGRESS">
          <strong>Event ends in</strong>
          <Timer :date-time-to="config.public.CLAIM_END" />
        </div>
        <div v-else-if="poapStatus === PoapStatus.FINISHED" class="w-full mt-6">
          <strong class="inline-block mb-6 text-sm">Event statistics</strong>
          <div class="flex justify-center gap-6">
            <div class="flex flex-col items-center p-3 rounded-md bg-bg-light w-40">
              <span class="font-bold" style="font-size: xx-large">
                {{ userStore.users.length }}
              </span>
              <p class="text-xs">Total participants</p>
            </div>
            <div class="flex flex-col items-center p-3 rounded-md bg-bg-light w-40">
              <span class="font-bold" style="font-size: xx-large">
                {{ userStore.users.filter(x => x.airdrop_status == 6).length }} /
                {{ userStore.users.length }}
              </span>
              <p class="text-xs">Minted NFTs</p>
            </div>
          </div>
        </div>

        <div class="border-l border-black mx-4 self-stretch" />
        <PoapInfo class="w-full max-w-lg" />
      </div>
    </div>

    <h6 class="mt-8 mb-2">Recent activity</h6>
    <TablePoapReservation />
  </div>
</template>

<script lang="ts" setup>
import { PoapStatus } from '~/lib/values/general.values';

const config = useRuntimeConfig();
const userStore = useUserStore();
const { getUsers } = useUser();

const poapStatus = ref(PoapStatus.WAITING);

let refreshEventTimeInterval: any = null as any;

onMounted(() => {
  getUsers();
  calculatePoapStatus();

  if (poapStatus.value === PoapStatus.IN_PROGRESS) {
    refreshEventTimeInterval = setInterval(() => {
      calculatePoapStatus();
    }, 1000);
  }
});

onBeforeUnmount(() => {
  clearInterval(refreshEventTimeInterval);
});

function calculatePoapStatus() {
  poapStatus.value = getPoapStatus(config.public.CLAIM_START, config.public.CLAIM_END);
  if (poapStatus.value === PoapStatus.FINISHED) {
    clearInterval(refreshEventTimeInterval);
  }
}
</script>
