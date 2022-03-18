<template>
  <div>
    <custom-modal v-model="show" @confirm="confirm" @cancel="cancel" name="testingmodal">
      <template v-slot:title>Hello, vue-final-modal</template>
      <p>Vue Final Modal is a renderless, stackable, detachable and lightweight modal component.</p>
    </custom-modal>

    <button @click="show = true">Open modal</button>
    <button @click="useApi()">Open modal using API</button>
  </div>
</template>

<script>
import { $vfm } from 'vue-final-modal'
import CustomModal from "./CustomModal.vue"

export default {
  name: "MbModal",
  components: {
    CustomModal,
  },
  data: () => ({
    show: false
  }),
  methods: {
    useApi() {
      $vfm.show('testingmodal')
    },
    confirm() {
      // some code...
      this.show = false
    },
    cancel(close) {
      // some code...
      close()
    }
  }
}
</script>
