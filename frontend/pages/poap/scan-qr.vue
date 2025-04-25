<template>
  <div
    class="frame dark:bg-bg-darker w-full max-w-sm md:max-w-xl mx-auto h-[80vh] max-h-[calc(100vh-190px)]"
  >
    <div
      class="frame-border h-full flex flex-col justify-evenly items-center gap-8 p-8 lg:pb-16 text-center"
    >
      <div v-if="poapStatus === PoapStatus.WAITING">
        <span>Time to event</span>
        <Timer :date-time-to="config.public.CLAIM_START"></Timer>
      </div>
      <template v-if="poapStatus === PoapStatus.IN_PROGRESS || immediatelyShowQr == true">
        <NuxtIcon name="icon/cube" class="icon-auto text-6xl" filled />
        <h2 class="max-w-xs mx-auto">Scan the code and receive NFT</h2>
        <n-qr-code v-if="qrCodeText" :value="qrCodeText" class="box-content" :size="200" />
        <div class="">
          <span class="text-sm">Next generated QR code in</span>
          <h4 class="text-yellow text-2xl">{{ timer }}s</h4>
        </div>
      </template>
      <span v-else-if="poapStatus === PoapStatus.FINISHED">Event concluded</span>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { PoapStatus } from '~/lib/values/general.values';

definePageMeta({
  layout: 'poap',
  middleware: 'authenticated',
});
const router = useRouter();
const authStore = useAuthStore();
const config = useRuntimeConfig();
const { query } = useRoute();

const poapStatus = ref();
const token = ref('');
const timer = ref(5);
const immediatelyShowQr = ref(query.immediatelyShowQr === 'true');

let qrCodeInterval: any = null as any;
let timerInterval: any = null as any;

const qrCodeText = computed<string>(
  () => `${window.location.origin}/poap/reserve-nft?token=${token.value}`
);

onMounted(async () => {
  if (authStore.loggedIn) {
    await setQrCodeValue();

    qrCodeInterval = setInterval(async () => {
      await setQrCodeValue();
    }, 5000);
  } else {
    router.push('/');
  }
});

onBeforeUnmount(() => {
  clearInterval(qrCodeInterval);
  clearInterval(timerInterval);
});

async function setQrCodeValue() {
  poapStatus.value = getPoapStatus(config.public.CLAIM_START, config.public.CLAIM_END);

  if (poapStatus.value === PoapStatus.FINISHED && immediatelyShowQr.value !== true) {
    clearInterval(qrCodeInterval);
  }
  if (poapStatus.value === PoapStatus.IN_PROGRESS || immediatelyShowQr.value === true) {
    await getReservationToken();

    clearInterval(timerInterval);
    timer.value = 5;
    timerInterval = setInterval(async () => {
      timer.value -= 1;
    }, 1000);
  }
}

async function getReservationToken() {
  try {
    const { data } = await $api.get<TokenResponse>(`/drop-reservation-token`);
    token.value = data.token;
  } catch (error) {
    token.value = '';
  }
}
</script>
