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
      <input v-model="parent" id="parent" name="Parent" class="border" />
      <label for="RO"> Read-Oonly:</label>
      <input
        type="checkbox"
        v-model="ronly"
        true-value="1"
        false-value="0"
        id="ronly"
        name="RO"
        class="border"
      />
      <button type="submit">Create Node</button>
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
      parent: "0",
      ronly: "0",
      error: null,
    };
  },
  methods: {
    onSubmit() {
      this.errors = {};
      axios
        .post("http://localhost:3001/createNode", {
          name: this.name,
          description: this.desc,
          parent: this.parent,
          ronly: this.ronly,
        })
        .then((response) => {
          response.data >= 0
            ? alert("Successly created node with id " + response.data)
            : alert("Meet Error!");
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