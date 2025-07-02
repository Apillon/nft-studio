<script lang="ts" setup>
const loading = ref(true);
const router = useRouter();
const { query } = useRoute();
const { connected } = useWalletConnect();

useHead({
  title: `Just minted my ${query.name} NFT on Apillon!`,
});
definePageMeta({
  layout: 'claim',
});
useSeoMeta(prepareOG(`Just minted my ${query.name} NFT on Apillon!`, ``, `${query.image}`));

onBeforeMount(() => {
  if (!query.name && !query.txHash) {
    router.push('/claim');
  }
});

onMounted(() => {
  loading.value = false;
});

watch(
  () => connected.value,
  _ => {
    if (!connected.value) {
      router.push('/claim');
    }
  },
  { immediate: true }
);

const metadata = ref<Metadata>({
  id: Number(queryParam(query?.id)),
  name: queryParam(query?.name),
  description: queryParam(query?.description),
  image: queryParam(query?.image),
});
const txHash = ref<string | undefined>(queryParam(query?.txHash));
</script>

<template>
  <div v-if="loading" class="flex-cc min-h-[70vh]">
    <Spinner :size="48" />
  </div>
  <FormShare v-else :metadata="metadata" :tx-hash="txHash" />
</template>
