<template>
  <div style="background-color: yellow">
    <form
      method="POST"
      id="newNode"
      @submit.prevent="onSubmit"
      enctype="multipart/form-data"
    >
      <label for="Name" class="required"> Name:</label>
      <input v-model="name" id="name" name="Name" required />
      <label for="Desc" class="required"> Description:</label>
      <input v-model="desc" id="desc" name="Desc" required />
      <label for="Parent"> ParentID:</label>
      <select v-model="parent">
        <option disabled value="">Please select one id</option>
        <option value="0">0</option>
        <option v-if="nodes" v-for="option in nodes.slice(1)">
          {{ option[0] }}
        </option>
      </select>

      <label for="RO"> Read-Only:</label>
      <input
        type="checkbox"
        v-model="ronly"
        true-value="1"
        false-value="0"
        id="ronly"
        name="RO"
        class="border"
      />
      <button type="submit">Submit</button>
    </form>
  </div>
</template>

<script>
import axios from "axios";
export default {
  name: "CreateNode",
  data: function () {
    return {
      name: "",
      desc: "",
      parent: "",
      ronly: "0",
      error: null,
    };
  },
  props: ["nodes"],
  emits: ["createNode"],
  methods: {
    onSubmit() {
      this.error = {};
      axios
        .post("http://localhost:3001/createNode", {
          name: this.name,
          description: this.desc,
          parent: this.parent,
          ronly: this.ronly,
        })
        .then((response) => {
          console.log("parent", this.parent);
          response.data >= 0
            ? alert("Successly created node with id " + response.data)
            : alert("Meet Error!");
          this.$emit("createNode", [
            response.data,
            this.name,
            this.desc,
            this.parent,
            this.ronly,
          ]);
        })
        .catch((error) => {
          console.log(error);
        });
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