<style src="../assets/index.css"></style>

<template>
  <section class="todoapp">
    <button @click="revert">revert</button>
    <header class="header">
      <h1>todos</h1>
      <input
        class="new-todo"
        autofocus
        autocomplete="off"
        placeholder="What needs to be done?"
        @keyup.enter="addTodo"
      >
    </header>

    <section class="main" v-show="todos.length">
      <input
        class="toggle-all"
        id="toggle-all"
        type="checkbox"
        :checked="allChecked"
        @change="toggleAll(!allChecked);"
      >
      <label for="toggle-all"></label>
      <ul class="todo-list">
        <TodoItem v-for="(todo, index) in filteredTodos" :key="index" :todo="todo"/>
      </ul>
    </section>

    <footer class="footer" v-show="todos.length">
      <span class="todo-count">
        <strong>{{ remaining }}</strong>
        {{ remaining | pluralize("item") }} left
      </span>
      <ul class="filters">
        <li v-for="(val, key) in filters" :key="key">
          <!--
            :href="'#/' + key" 文档这种写法会使click不跳转，#是前端路由，可能官方例子有部署。个人例子要么是#到顶部，或者伪协议。onclick加return false不生效
          -->
          <a
            href="#"
            :class="{ selected: visibility === key }"
            @click="visibility = key;"
          >{{ key | capitalize }}</a>
        </li>
      </ul>
      <button
        class="clear-completed"
        v-show="todos.length > remaining"
        @click="clearCompleted"
      >Clear completed</button>
    </footer>
  </section>
</template>

<script>
import { mapActions } from "vuex";
import TodoItem from "./TodoItem.vue";

const filters = {
  all: todos => todos,
  active: todos => todos.filter(todo => !todo.done),
  completed: todos => todos.filter(todo => todo.done)
};

export default {
  components: {
    TodoItem
  },

  data() {
    return {
      visibility: "all",
      filters: filters
    };
  },

  computed: {
    todos() {
      return this.$store.state.todos;
    },
    allChecked() {
      return this.todos.every(todo => todo.done);
    },
    filteredTodos() {
      return filters[this.visibility](this.todos);
    },
    remaining() {
      return this.todos.filter(todo => !todo.done).length;
    }
  },

  filters: {
    pluralize: (n, w) => (n === 1 ? w : w + "s"), // (remaining, 'item')
    capitalize: s => s.charAt(0).toUpperCase() + s.slice(1)
  },

  methods: {
    ...mapActions(["toggleAll", "clearCompleted"]),
    revert() {
      this.$store.dispatch('history/revert');
    },
    addTodo(e) {
      const text = e.target.value;
      if (text.trim()) {
        this.$store.dispatch("addTodo", text);
      }
      e.target.value = "";
    }
  }
};
</script>