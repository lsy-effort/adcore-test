<template>
  <div id="app">
    <TreeExample />
    <CreateNode />
  </div>
</template>

<script>
import TreeExample from "./components/TreeExample.vue";
import CreateNode from "./components/CreateNode.vue";

export default {
  name: "App",
  components: {
    TreeExample,
    CreateNode,
  },
};
</script>

<style>
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
