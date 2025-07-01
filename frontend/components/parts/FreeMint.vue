<template>
  <div>
    <div class="flex justify-between items-center gap-8">
      <div class="max-w-4xl lg:pr-10">
        <h6 class="mb-2 text-xs">NFT Wild West</h6>
        <h1 class="mb-4">Dashboard</h1>
        <div>
          Allow anybody to mint an NFT from your collection through the claim page below. Users can connect their
          existing Web3 wallet, generate a new one through Apillon's Embedded Wallets or reserve an NFT via email.
        </div>
      </div>
      <Statistics :loading="userStore.loading" :statistics="userStore.statistics" />
    </div>

    <hr class="border-grey-transparent dark:border-bg-lighter my-8" />

    <div class="my-8 bg-bg-light border border-black p-6 rounded-lg">
      <h4 class="mb-3">Public webpage for “first-come-first-served” NFT minting</h4>
      <h6 class="inline-block text-xs">Website</h6>
      <IconInfo
        tooltip="Share this link with your users. They will be able to claim the NFTs from this page."
        size="sm"
      />
      <BtnLink class="max-w-xl" :link="`${domain}/claim${stringifyQuery($route.query, '?')}`" />
    </div>

    <n-space class="w-full my-8" size="large" align="center" justify="space-between">
      <div></div>
      <n-space size="large">
        <Btn type="secondary" :loading="userStore.loading" @click="fetchUsers()">Refresh </Btn>
      </n-space>
    </n-space>
    <TablePoapReservation />
  </div>
</template>

<script lang="ts" setup>
const userStore = useUserStore();
const { fetchUsers } = useUser();
const domain = window.location.origin;
</script>
