<template>
  <div>
    test
    <Tree
      id="my-tree-id"
      ref="my-tree"
      :custom-options="myCustomOptions"
      :custom-styles="myCustomStyles"
      :nodes="treeDisplayData"
    ></Tree>
  </div>
</template>

<script>
import Tree from "vuejs-tree";
import axios from "axios";

export default {
  name: "TreeExample",
  components: {
    Tree,
  },
  data: function () {
    return {
      loading: false,
      data: null,
      error: null,
      treeDisplayData: [
        {
          text: "root 1",
          state: { checked: false, selected: false, expanded: false },
          id: 1,
          checkable: false,
          nodes: [
            {
              text: "Child 1",
              state: { checked: true, selected: false, expanded: false },
              id: 3,
              nodes: [
                {
                  text: "Grandchild 1",
                  state: { checked: false, selected: false, expanded: false },
                  id: 5,
                },
                {
                  text: "Grandchild 2",
                  state: { checked: false, selected: false, expanded: false },
                  id: 6,
                },
              ],
            },
            {
              text: "Child 2",
              state: { checked: false, selected: false, expanded: false },
              id: 4,
            },
          ],
        },
        {
          text: "Root 2",
          state: { checked: false, selected: false, expanded: false },
          id: 2,
        },
      ],
    };
  },
  computed: {
    myCustomStyles() {
      return {
        tree: {
          style: {
            height: "auto",
            maxHeight: "300px",
            overflowY: "visible",
            display: "inline-block",
            textAlign: "left",
          },
        },
        row: {
          style: {
            width: "500px",
            cursor: "pointer",
          },
          child: {
            class: "",
            style: {
              height: "35px",
            },
            active: {
              style: {
                height: "35px",
              },
            },
          },
        },
        rowIndent: {
          paddingLeft: "20px",
        },
        text: {
          // class: "" // uncomment this line to overwrite the 'capitalize' class, or add a custom class
          style: {},
          active: {
            style: {
              "font-weight": "bold",
              color: "#2ECC71",
            },
          },
        },
      };
    },
    myCustomOptions() {
      return {
        treeEvents: {
          expanded: {
            state: false,
          },
          collapsed: {
            state: false,
          },
          selected: {
            state: true,
            fn: this.mySelectedFunction,
          },
          checked: {
            state: true,
            fn: this.myCheckedFunction,
          },
        },
        events: {
          expanded: {
            state: true,
          },
          selected: {
            state: true,
          },
          checked: {
            state: true,
          },
          editableName: {
            state: true,
            calledEvent: "expanded",
          },
        },
        addNode: {
          state: true,
          fn: this.addNodeFunction,
          appearOnHover: false,
        },
        editNode: { state: false, fn: null, appearOnHover: false },
        deleteNode: {
          state: true,
          fn: this.deleteNodeFunction,
          appearOnHover: true,
        },
        showTags: true,
      };
    },
  },
  mounted() {
    this.$refs["my-tree"].expandNode(1);
    this.fetchData();
  },
  methods: {
    fetchData() {
      this.error = this.data = null;
      this.loading = true;
      axios
        .get("http://localhost:3001/get")
        .then((response) => {
          this.loading = false;
          this.data = response.data;
          console.log(this.data);
        })
        .catch((error) => {
          this.loading = false;
          this.error = error.response.data.message || error.message;
        });
    },
    myCheckedFunction: function (nodeId, state) {
      console.log(`is ${nodeId} checked ? ${state}`);
      console.log(this.$refs["my-tree"].getCheckedNodes("id"));
      console.log(this.$refs["my-tree"].getCheckedNodes("text"));
    },
    mySelectedFunction: function (nodeId, state) {
      console.log(`is ${nodeId} selected ? ${state}`);
      console.log(this.$refs["my-tree"].getSelectedNode());
    },
    deleteNodeFunction: function (node) {
      const nodePath = this.$refs["my-tree"].findNodePath(node.id);
      const parentNodeId = nodePath.slice(-2, -1)[0];
      if (parentNodeId === undefined) {
        // 'root' node
        const nodeIndex =
          this.$refs["my-tree"].nodes.findIndex((x) => x.id !== node.id) - 1;
        this.$refs["my-tree"].nodes.splice(nodeIndex, 1);
      } else {
        // child node
        const parentNode = this.$refs["my-tree"].findNode(parentNodeId);
        const nodeIndex =
          parentNode.nodes.findIndex((x) => x.id !== node.id) - 1;
        parentNode.nodes.splice(nodeIndex, 1);
      }
      console.log("example: remove node", node.id);
    },
    addNodeFunction: function (node) {
      const newNode = {
        text: "Grandchild 2",
        id: Math.floor(Math.random() * 100),
      };
      console.log("example: add node", newNode);
      if (node.nodes === undefined) {
        // the node doesn't have childs
        // I use $set to ensure that VueJs detect the change
        this.$set(node, "nodes", [newNode]);
      } else {
        node.nodes.push(newNode);
      }
    },
  },
};
</script>