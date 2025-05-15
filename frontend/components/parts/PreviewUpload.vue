<template>
  <div class="flex flex-col gap-4 max-w-lg mx-auto">
    <h2>NFT & Costs details</h2>

    <n-table class="plain mb-6 table-fixed" :bordered="false" :single-line="true">
      <tbody>
        <tr v-for="(item, key) in data" :key="key" :class="{ hidden: item.show === false }">
          <td>
            <span class="font-normal">{{ item.label }}</span>
          </td>
          <td class="relative">
            <strong class="text-black dark:text-white">{{ item.value }}</strong>

            <Btn class="float-right text-white-primary no-underline" type="link" @click="$emit('back')">
              <span class="icon-edit align-sub text-xl" />
            </Btn>
          </td>
        </tr>
      </tbody>
    </n-table>

    <div class="card-border card p-6">
      <div class="flex gap-2 mb-9">
        <strong class="block w-1/2">Total spend</strong>
        <div class="flex w-1/2 flex-col gap-1 text-right">
          <strong>{{ numOfNfts * mintPrice() }} credits</strong>
          <p class="mt-2 text-xs">Your balance: {{ userStore.balance }} credits</p>
        </div>
      </div>
      <Btn size="large" type="primary" @click="$emit('deploy')"> Add new recipients </Btn>
    </div>
  </div>
</template>

<script setup lang="ts">
defineEmits(['back', 'deploy']);
const props = defineProps({
  numOfNfts: { type: Number, default: 0 },
  maxSupply: { type: Number, default: 0 },
});

const userStore = useUserStore();

const data = ref<Record<string, string | boolean>[]>([
  { label: 'Total NFTs to distribute this round', value: props.numOfNfts + ' NFTs' },
  {
    label: 'Remaining NFTs in the collection',
    value:
      props.maxSupply === Number.MAX_SAFE_INTEGER
        ? `∞`
        : `${props.maxSupply - userStore.users.length - props.numOfNfts} NFTs`,
  },
  { label: 'Price per NFT', value: mintPrice() + ' credits' },
]);
</script>
