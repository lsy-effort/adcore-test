<template>
  <div style="background-color: yellow">
    <form
      method="POST"
      id="updateNode"
      @submit.prevent="onSubmit"
      enctype="multipart/form-data"
    >
      <label for="Name" class="required"> Name:</label>
      <input v-model="name" id="newName" name="Name" required />
      <button type="submit">Update Node</button>
    </form>
  </div>
</template>

<script>
export default {
  name: "UpdateNode",
  data: function () {
    return {
      name: "",
    };
  },

  emits: ["updateNode"],
  methods: {
    onSubmit() {
      this.$emit("updateNode", this.name);
    },
  },
};
</script>

<style>
.required:after {
  content: " *";
  color: red;
}
</style>