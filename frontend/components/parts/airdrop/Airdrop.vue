<template>
  <div class="w-full my-12 mx-auto">
    <div class="flex justify-between gap-8">
      <div class="mb-8 max-w-2xl lg:pr-10">
        <h1 class="mb-4">Welcome to NFT Studio</h1>
        <div>
          Use multiple distribution methods—email, wallet address, or public link. All NFTs are sent from your
          Apillon-hosted collection, so make sure you’ve got enough supply left.
        </div>
      </div>
      <Statistics :loading="userStore.loading" :statistics="userStore.statistics" />
    </div>
    <hr class="border-grey-transparent my-8" />
    <n-space class="w-full my-8" size="large" align="center" justify="space-between">
      <div>
        <h4 class="mb-2">Your NFT Airdrops</h4>
        <FormFieldSearch v-model:value="search" />
      </div>
      <n-space size="large">
        <Btn @click="modalUploadCsvVisible = true">
          <span class="inline-flex items-center gap-1">
            <NuxtIcon name="action/add" class="text-lg" />
            New NFT Airdrop
          </span>
        </Btn>
      </n-space>
    </n-space>
    <TableUsers :users="users" />

    <AirdropModal v-model:show="modalUploadCsvVisible" @close="modalUploadCsvVisible = false" />
  </div>
</template>
<script lang="ts" setup>
const userStore = useUserStore();

const search = ref<string>('');
const modalUploadCsvVisible = ref<boolean>(false);

const users = computed(() =>
  !search ? userStore.users : userStore.users.filter(user => `${user.email} ${user.wallet}`.includes(search.value))
);
</script>
