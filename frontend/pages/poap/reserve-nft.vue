<template>
  <div class="frame flex dark:bg-bg-darker md:min-w-[30rem] w-full max-w-sm mx-auto">
    <div class="frame-border self-stretch min-h-[40rem] flex flex-col justify-evenly gap-5 p-6 lg:py-[5vh] text-center">
      <div v-if="!isTokenValid">
        <p>Token is invalid or has expired...</p>
      </div>
      <div v-else-if="dropReserved">
        <p>You have successfully reserved NFT. Check your mail for instructions on how to mint.</p>
      </div>
      <FormClaim
        v-else-if="connected && query.nftToken"
        :type="ClaimType.FREE_MINT"
        :token="queryParam(query.nftToken)"
        @claim="onClaim"
      />
      <template v-else>
        <h2 class="text-3xl mt-2">Enter your email to reserve NFT</h2>
        <p>Once you have entered your e-mail address, you will receive instructions on how to claim NFT.</p>
        <n-form ref="formRef" :model="formData" class="text-left mt-2" :rules="rules" @submit.prevent="handleSubmit">
          <!--  Project Quota value -->
          <n-form-item path="email" :show-label="false">
            <n-input v-model:value="formData.email" placeholder="Enter your email" clearable />
          </n-form-item>

          <!--  Form submit -->
          <n-form-item :show-label="false" :show-feedback="false">
            <input type="submit" class="hidden" />
            <Btn size="large" type="secondary" :loading="loading" @click="handleSubmit"> Proceed </Btn>
          </n-form-item>
        </n-form>

        <span class="text-grey">or</span>

        <div class="mb-2">
          <ConnectWallet class="w-full" />
        </div>

        <div class="flex flex-col items-center mb-1">
          <p>{{ timer }} min left</p>
          <n-progress
            class="mt-1"
            type="line"
            :percentage="tokenValidityInPercent"
            :height="6"
            :border-radius="4"
            :fill-border-radius="0"
            :show-indicator="false"
          />
        </div>
        <h6>Sneak peek:</h6>
        <HorizontalSlider class="flex gap-2">
          <img
            v-for="i in 5"
            :key="i + nfts.length"
            :src="i - 1 in nfts ? nfts[i - 1] : `/images/nfts/1.png`"
            class="h-32 rounded-lg pointer-events-none"
          />
        </HorizontalSlider>
      </template>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { jwtDecode } from 'jwt-decode';
import dayjs from 'dayjs';
import type { FormInst, FormRules, FormValidationError } from 'naive-ui/es/form';
import { ClaimType } from '~/lib/values/general.values';

useHead({
  title: 'Apillon POAP prebuilt solution',
});
definePageMeta({
  layout: 'poap',
  middleware: 'poap',
});

const router = useRouter();
const message = useMessage();

const { query } = useRoute();
const { loadNft } = useClaim();
const { parseLink } = useIpns();
const { handleError } = useErrors();
const { connected } = useWalletConnect();

const loading = ref(false);
const isTokenValid = ref(true);
const tokenValidityInPercent = ref(100);
const dropReserved = ref(false);
const nfts = ref<Array<string>>([]);
const token = query.nftToken?.toString();

let calcRemainingTimeInterval: any = null as any;

const timer = computed(() => Math.ceil(tokenValidityInPercent.value / 20));

const formRef = ref<FormInst | null>(null);
const formData = reactive<any>({
  email: null,
  token,
});
const rules: FormRules = {
  email: [
    {
      required: true,
      type: 'string',
      trigger: 'input',
    },
  ],
};

function handleSubmit(e: Event | MouseEvent) {
  e.preventDefault();
  formRef.value?.validate((errors: Array<FormValidationError> | undefined) => {
    if (errors) {
      errors.map(fieldErrors => fieldErrors.map(error => message.warning(error.message || 'Error')));
    } else {
      reserveMint();
    }
  });
}

onMounted(() => {
  if (token) {
    loadImages();

    const decoded = jwtDecode(token);
    if (!decoded.iat) {
      isTokenValid.value = false;
      return;
    }

    const tokenIssueDate = Number(dayjs(decoded.iat * 1000));
    isTokenValid.value = Number(dayjs()) - tokenIssueDate < 7000;

    calcRemainingTimeInterval = setInterval(() => {
      const currDate = dayjs();
      const tokenAgeInMs = Number(currDate) - tokenIssueDate;
      tokenValidityInPercent.value = 100 - (tokenAgeInMs * 100) / 300000;

      if (tokenValidityInPercent.value <= 0) {
        tokenValidityInPercent.value = 0;
        isTokenValid.value = false;
        clearInterval(calcRemainingTimeInterval);
      }
    }, 1000);
  } else {
    isTokenValid.value = false;
  }
});

onBeforeUnmount(() => {
  clearInterval(calcRemainingTimeInterval);
});

async function reserveMint() {
  loading.value = true;
  try {
    const { data } = await $api.post<UserResponse>(`/reserve-drop`, formData);
    if (data.id) {
      dropReserved.value = true;
      clearInterval(calcRemainingTimeInterval);
    }
  } catch (err: any) {
    handleError(err);
  }

  loading.value = false;
}

function loadImages() {
  [1, 2, 3, 4, 5].forEach(i => loadImage(i));
}
async function loadImage(i: number) {
  const metadata = await loadNft(i);

  const image = await parseLink(metadata?.image || '');
  if (image) {
    nfts.value.push(image);
  }
}
function onClaim(metadata: Metadata, txHash?: string) {
  router.push({ name: 'share', query: { ...metadata, txHash } });
}
</script>
