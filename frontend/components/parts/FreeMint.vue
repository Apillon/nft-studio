<template>
  <div>
    <div class="flex justify-between items-center gap-8">
      <div class="max-w-4xl lg:pr-10">
        <h6 class="mb-2 text-xs">NFT Event Experience</h6>
        <h1 class="mb-4">Dashboard</h1>
        <div>
          Create PoAP-style drops in just a click. Let users mint on the spot or email-reserve their NFTs for later. All
          NFTs are sent from your Apillon-hosted collection. You’ll need enough NFTs in your collection to complete the
          drop.
        </div>
        <div class="mt-6">
          <h6 class="inline-block text-xs">Claim page</h6>
          <IconInfo
            tooltip="Share this link with your users. They will be able to claim the NFTs from this page."
            size="sm"
          />
          <BtnLink :link="`${domain}/claim`" />
        </div>
      </div>
      <Statistics :loading="userStore.loading" :statistics="userStore.statistics" />
    </div>

    <hr class="border-grey-transparent dark:border-bg-lighter my-8" />
    <TablePoapReservation />
  </div>
</template>

<script lang="ts" setup>
const userStore = useUserStore();
const domain = window.location.origin;
</script>
