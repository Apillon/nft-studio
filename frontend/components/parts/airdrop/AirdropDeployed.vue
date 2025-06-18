<template>
  <div class="flex min-h-full flex-col justify-center text-center">
    <div class="mx-auto my-8 max-w-lg lg:my-16">
      <img :src="SuccessSVG" class="mx-auto" width="165" height="169" alt="airdrop" />

      <h4 class="mt-6">Congrats</h4>
      <p>You successfully added new NFT recipients.</p>

      <div class="my-8 flex gap-4">
        <Btn class="flex-1" size="large" type="secondary" @click="$emit('close')"> Close </Btn>
        <Btn v-if="!isMethodWallet" class="flex-1" size="large" type="primary" :loading="loading" @click="send">
          Send emails
        </Btn>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import SuccessSVG from '~/assets/images/success.svg';

const emit = defineEmits(['close']);
defineProps({
  isMethodWallet: { type: Boolean, default: false },
});
const { sendEmails } = useUser();

const loading = ref<boolean>(false);

/** Send emails, so users will be able to claim NFTs */
async function send() {
  loading.value = true;
  await sendEmails();
  loading.value = false;
  emit('close');
}
</script>
