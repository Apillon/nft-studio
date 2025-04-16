<template>
  <n-upload
    :show-file-list="false"
    accept=".csv, application/vnd.ms-excel"
    class="w-full"
    :custom-request="uploadFileRequest"
  >
    <n-upload-dragger class="h-32">
      <div class="py-2 text-xs flex flex-col justify-center items-center gap-1">
        <div class="mb-2 inline-block h-10 w-10 rounded-full bg-grey-transparent p-2">
          <span class="icon-deploy text-2xl text-bg"></span>
        </div>

        <template v-if="uploadedFile?.name">
          <strong>Uploaded file</strong>
          <small>{{ uploadedFile?.name }}</small>
        </template>
        <template v-else>
          <strong>Upload CSV files</strong>
          <small>Drag & drop or click to upload.</small>
        </template>
      </div>
    </n-upload-dragger>
  </n-upload>
</template>

<script lang="ts" setup>
import type { UploadCustomRequestOptions, UploadSettledFileInfo } from 'naive-ui';

const emit = defineEmits(['proceed']);
const props = defineProps({
  autoIncrement: { type: Boolean, default: true },
  wallet: { type: Boolean, default: false },
});
const message = useMessage();
const { vueApp } = useNuxtApp();
const $papa = vueApp.config.globalProperties.$papa as any;

const uploadedFile = ref<UploadSettledFileInfo | null>(null);
const requiredColumns = props.wallet ? ['wallet'] : ['email', 'email_start_send_time'];

onMounted(() => {
  if (!props.autoIncrement) {
    requiredColumns.push('nft_id');
  }
});

const hasRequiredColumns = (columns: String[]) => requiredColumns.every(item => columns.includes(item));

function uploadFileRequest({ file, onError, onFinish }: UploadCustomRequestOptions) {
  if (file.type === 'text/csv' || file.type === 'application/vnd.ms-excel') {
    parseUploadedFile(file.file);
    uploadedFile.value = file;
    onFinish();
  } else {
    console.warn(file.type);
    message.warning('File must be of type CSV');

    /** Mark file as failed */
    onError();
  }
}

function parseUploadedFile(file?: File | null) {
  if (!file) {
    return;
  }

  $papa.parse(file, {
    header: true,
    skipEmptyLines: true,

    complete: (results: CsvFileData<CsvItem>) => {
      if (results.errors && results.errors.length) {
        uploadedFile.value = null;
        message.warning(results.errors[0].message);
      } else if (results.data.length) {
        if (hasRequiredColumns(results.meta.fields)) {
          const data = results.data.map((item: CsvItem) => {
            if (item.email_start_send_time) {
              item.email_start_send_time = new Date(Number(item.email_start_send_time)).toDateString();
            }
            return item;
          });
          emit('proceed', data);
        } else {
          message.warning(
            'Required columns are missing, plase check your file. Required columns: ' + requiredColumns.join(', ')
          );
        }
      }
    },
    error: function (error: string) {
      console.log(error);
      uploadedFile.value = null;
    },
  });
}
</script>
