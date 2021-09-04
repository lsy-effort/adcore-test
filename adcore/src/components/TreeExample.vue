<template>
  <div style="background-color: #c5cbe3">
    <h1 style="background-color: DodgerBlue; color: white; margin: 0">
      The tree
    </h1>

    <p>
      Click the triangle to expand or collapse the tree. Click 'pen' icon to
      edit or cancel editing the name of the node. Click 'x' icon to delete the
      node and its children nodes. Some nodes are read-only and cannot be
      updated or deleted.
    </p>

    <Tree
      id="my-tree-id"
      ref="my-tree"
      :custom-options="myCustomOptions"
      :custom-styles="myCustomStyles"
      :nodes="treeDisplayData"
    ></Tree>

    <CreateNode v-if="createShow" :nodes="data" @create-Node="createNode" />
    <UpdateNode v-if="updateShow" @update-Node="updateNodeName" />
    <button id="showCreate" type="submit" @click="showCreate">
      Create new node
    </button>
    <button type="submit" @click="download">Download CSV file</button>
  </div>
</template>

<script>
import Tree from "vuejs-tree";
import CreateNode from "./CreateNode.vue";
import UpdateNode from "./UpdateNode.vue";
import axios from "axios";

export default {
  name: "TreeExample",
  components: {
    Tree,
    CreateNode,
    UpdateNode,
  },
  data: function () {
    return {
      loading: false,
      data: null,
      error: null,
      updateId: null,
      updateShow: false,
      createShow: false,
      treeDisplayData: [],
    };
  },

  mounted() {
    this.$refs["my-tree"].expandNode(1);
    this.fetchData();
  },

  watch: {
    data(newData) {
      console.log("datechanged!");
      this.treeDisplayData = this.newTree(newData);
    },
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
        })
        /*
        .then(() => {
          this.treeDisplayData = this.newTree(this.data);
        })
        */
        .catch((error) => {
          this.loading = false;
          console.log(error);
        });
    },
    newTree(data) {
      let objectData = [];

      for (let i = 1; i < data.length; i++) {
        if (data[i][3] == "0") {
          let newObject = {
            id: data[i][0],
            text: data[i][1],
            definition: data[i][2],
            checkable: false,
            state: { checked: false, selected: false, expanded: false },
            readonly: data[i][4],
            nodes: [],
          };
          objectData.push(newObject);
        } else {
          this.dfs(objectData, data[i]);
        }
      }

      return objectData;
    },
    dfs(objectData, data) {
      for (let i = 0; i < objectData.length; i++) {
        if (objectData[i].id == data[3]) {
          let newObject = {
            id: data[0],
            text: data[1],
            checkable: false,
            definition: data[2],
            state: { checked: false, selected: false, expanded: false },
            readonly: data[4],
            nodes: [],
          };
          objectData[i].nodes.push(newObject);
          return;
        } else {
          this.dfs(objectData[i].nodes, data);
        }
      }
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
    updateNode: function (node) {
      if (node.readonly > 0) {
        alert("Sorry, this node is read-only!");
        this.updateShow = false;
      } else {
        if (this.updateId == node.id && this.updateShow) {
          this.updateShow = false;
        } else {
          this.updateShow = true;
          this.updateId = node.id;
        }
      }
    },

    showCreate: function () {
      if (this.createShow == false) {
        //console.log()
        document.getElementById("showCreate").innerHTML = "Cancel";
        this.createShow = true;
      } else {
        document.getElementById("showCreate").innerHTML = "Create new node";
        this.createShow = false;
      }
    },
    updateNodeName: function (name) {
      //Update node in the tree
      const node = this.$refs["my-tree"].findNode(this.updateId);
      node.text = name;
      //Update node in data
      for (let i = 0; i < this.data.length; i++) {
        if (this.data[i][0] == this.updateId) {
          this.data[i][1] = name;
        }
      }
      //Update node in backend server
      axios
        .post("http://localhost:3001/updateNode", {
          id: this.updateId,
          name: name,
        })
        .then((response) => {
          response.data == "success"
            ? alert("Successly update the node.")
            : alert("Meet Error!");
        })
        .catch((error) => {
          console.log(error);
        });
    },
    deleteNode: function (node) {
      if (node.readonly > 0) {
        alert("Sorry, this node is read-only!");
      } else {
        //Find whether node is a root node or not, delete from the tree;
        const nodePath = this.$refs["my-tree"].findNodePath(node.id);
        const parentNodeId = nodePath.slice(-2, -1)[0];

        if (parentNodeId === undefined) {
          // 'root' node
          const nodeIndex = this.$refs["my-tree"].nodes.findIndex(
            (x) => x.id == node.id
          );
          console.log(nodeIndex);
          this.$refs["my-tree"].nodes.splice(nodeIndex, 1);
        } else {
          // child node
          const parentNode = this.$refs["my-tree"].findNode(parentNodeId);
          const nodeIndex = parentNode.nodes.findIndex((x) => x.id == node.id);
          parentNode.nodes.splice(nodeIndex, 1);
        }

        //Delete the node from the data

        for (let i = 1; i < this.data.length; i++) {
          if (this.data[i][0] == node.id) {
            this.data.splice(i, 1);
          }
        }

        //Delete the node from csv in server;

        axios
          .post("http://localhost:3001/deleteNode", {
            id: node.id,
          })
          .then((response) => {
            response.data == "success"
              ? alert("Successly deleted the node.")
              : alert("Meet Error!");
          })
          .catch((error) => {
            console.log(error);
          });
      }
    },

    createNode: function (node) {
      const parent = node[3];
      const newNode = {
        id: node[0],
        text: node[1],
        checkable: false,
        definition: node[2],
        state: { checked: false, selected: false, expanded: false },
        readonly: node[4],
        nodes: [],
      };

      this.data.push(node);
      this.data = JSON.parse(JSON.stringify(this.data));
    },

    download: function () {
      //https://stackoverflow.com/questions/58292771/downloading-a-csv-of-file-using-vue-and-js
      axios
        .get("http://localhost:3001/download")
        .then((response) => {
          const anchor = document.createElement("a");
          anchor.href =
            "data:text/csv;charset=utf-8," + encodeURIComponent(response.data);
          anchor.target = "_blank";
          anchor.download = "tree_data.csv";
          anchor.click();
        })
        .catch((error) => {
          console.log(error);
        });
    },
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
            state: false,
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
          state: false,
          fn: this.createNode,
          appearOnHover: false,
        },
        editNode: { state: true, fn: this.updateNode, appearOnHover: false },
        deleteNode: {
          state: true,
          fn: this.deleteNode,
          appearOnHover: true,
        },
        showTags: true,
      };
    },
  },
};
</script>

<style>
.folder_icon:before {
  content: "📂" !important;
}
.folder_icon_active:before {
  content: "📂" !important;
}
</style>