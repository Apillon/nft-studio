<script lang="ts" setup>
const loading = ref(true);
const router = useRouter();
const { query } = useRoute();

useHead({
  title: `Just minted my ${query.name} NFT on Apillon!`,
});
definePageMeta({
  layout: 'claim',
});
useSeoMeta(prepareOG(`Just minted my ${query.name} NFT on Apillon!`, ``, `${query.image}`));

onBeforeMount(() => {
  if (!query.name || !query.image) {
    router.push('/claim');
  }
});

onMounted(() => {
  loading.value = false;
});

const metadata = ref<Metadata>({
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
  <FormShare v-else :metadata="metadata" :txHash="txHash" />
</template>
