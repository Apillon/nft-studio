<template>
  <div>
    <div class="text-center mt-8">
      <h4 class="text-2xl mb-1">POAP drop client side</h4>
      <p>To run the POAP drop you have to configure two websites.</p>
    </div>
    <div class="grid sm:grid-cols-2 gap-6 mt-12">
      <div class="card !p-8 flex flex-col">
        <h4 class="text-xl">Website for QR scanning</h4>
        <p class="mb-2">
          Display this website somewhere on your event grounds. The website will automatically generate new QR codes
          every 20 seconds, allowing users to scan them and reserve the NFTs.
        </p>
        <FieldCopy class="mb-4" :text="`/poap/scan-qr?immediatelyShowQr=${immediatelyShowQr}`" />
        <n-checkbox v-model:checked="immediatelyShowQr" class="mb-4"> Immediately show QR code</n-checkbox>
        <Btn size="small" type="primary" @click="router.push(`/poap/scan-qr?immediatelyShowQr=${immediatelyShowQr}`)">
          Go to page
        </Btn>
      </div>
      <div class="card !p-8 flex flex-col justify-between">
        <div>
          <h4 class="text-xl">NFT reservation</h4>
          <p>
            This is the website users will see once they scan the QR code. Users will have to enter their email to
            reserve the NFT, receive minting instructions. Users may mint the NFT at any time with the email used to
            reserve it.
          </p>
        </div>
        <Btn size="small" type="primary" class="mt-8" @click="navigateToReserveDrop()">Go to page</Btn>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
const router = useRouter();
const immediatelyShowQr = ref(false);

async function navigateToReserveDrop() {
  try {
    const { data } = await $api.get<TokenResponse>(`/drop-reservation-token`);
    router.push(`/poap/reserve-nft?token=${data.token}`);
  } catch (error) {
    console.error(error);
  }
}
</script>
