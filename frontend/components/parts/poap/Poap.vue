<template>
  <div class="max-w-5xl mx-auto">
    <div class="card relative text-center">
      <PoapStatus :status="poapStatus" class="mb-4" />
      <h2 class="mb-4">POAP</h2>
      <div v-if="poapStatus === PoapStatus.WAITING" class="flex flex-col items-center">
        <strong>Event starts in</strong>
        <Timer :date-time-to="config.public.CLAIM_START" />
      </div>
      <div v-else-if="poapStatus === PoapStatus.IN_PROGRESS" class="flex flex-col items-center">
        <strong>Event ends in</strong>
        <Timer :date-time-to="config.public.CLAIM_END" />
      </div>
      <div v-else-if="poapStatus === PoapStatus.FINISHED" class="w-full mt-6">
        <strong class="inline-block mb-6 text-sm">Event statistics</strong>
        <div class="flex justify-center gap-6">
          <div class="flex flex-col items-center p-3 rounded-md bg-bg-light w-40">
            <span class="font-bold" style="font-size: xx-large">{{ userStore.users.length }}</span>
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

      <div v-if="poapStatus === PoapStatus.WAITING" class="p-6 mt-8 border border-yellow rounded-2xl text-left">
        <div class="flex gap-4">
          <NuxtIcon name="icon/info" class="text-2xl" />
          <h5>Next step is to personalize POAP drop</h5>
        </div>
        <p class="my-3">
          Configure the domain and your own SMTP server in order to personalize the POAP drop. Hosting the POAP drop
          from your custom domain and sending emails to your clients via your domain brings trust from the users and
          increases the minting conversion rates.
        </p>
        <button class="text-yellow font-bold hover:underline">Configure domain and E-mail SMTP</button>
      </div>
      <template v-else-if="poapStatus === PoapStatus.IN_PROGRESS">
        <div class="h-8"></div>
        <div class="relative"></div>
      </template>
    </div>
    <n-tabs v-if="poapStatus === PoapStatus.IN_PROGRESS" class="-mt-9" :gap="32" justify-content="center" animated>
      <n-tab-pane name="client" tab="Client side">
        <PoapInfo />
      </n-tab-pane>
      <n-tab-pane name="activity" tab="Recent activity">
        <template #tab>
          Recent activity
          <span
            class="inline-flex justify-center items-center w-6 h-6 ml-2 rounded-full bg-pink font-bold text-bg-dark text-[10px]"
          >
            {{ userStore.users.length }}
          </span>
        </template>
        <div class="p-8">
          <h4 class="mb-4 text-center text-2xl">Recent activity</h4>
          <TablePoapReservation />
        </div>
      </n-tab-pane>
    </n-tabs>
    <TablePoapReservation v-else-if="poapStatus === PoapStatus.FINISHED" class="mt-8" />
  </div>
</template>

<script lang="ts" setup>
import { PoapStatus } from '~/lib/values/general.values';

const config = useRuntimeConfig();
const userStore = useUserStore();
const { getUsers } = useUser();

const poapStatus = ref(PoapStatus.WAITING);

let refreshEventTimeInterval: any = null as any;

onMounted(async () => {
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
