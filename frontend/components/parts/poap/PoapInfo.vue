<template>
  <div>
    <div>
      <h6 class="inline-block text-xs">QR scanning website</h6>
      <IconInfo
        tooltip="Display this website somewhere on your event grounds. The website will automatically generate new QR codes every 20 seconds, allowing users to scan them and reserve the NFTs."
        size="sm"
      />
    </div>
    <n-checkbox v-model:checked="immediatelyShowQr" class="mt-2 mb-1"> Immediately show QR code </n-checkbox>
    <BtnLink :link="`${domain}/poap/scan-qr?immediatelyShowQr=${immediatelyShowQr}`" />

    <div class="mt-6 mb-1">
      <h6 class="inline-block text-xs">NFT reservation website</h6>
      <IconInfo
        tooltip="This is the website users will see once they scan the QR code. Users will have to enter their email to reserve the NFT, receive minting instructions. Users may mint the NFT at any time with the email used to reserve it."
        size="sm"
      />
    </div>
    <BtnLink :text="`${domain}/poap/reserve-nft`" @click="navigateToReserveDrop()" />
  </div>
</template>

<script lang="ts" setup>
const domain = window.location.origin;
const immediatelyShowQr = ref(false);

async function navigateToReserveDrop() {
  try {
    const { data } = await $api.get<TokenResponse>(`/drop-reservation-token`);
    window.open(`/poap/reserve-nft?nftToken=${data.token}`, '_blank');
  } catch (error) {
    console.error(error);
  }
}
</script>
