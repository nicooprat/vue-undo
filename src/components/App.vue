<style src="../assets/index.css"></style>

<template>
  <section class="todoapp">
    <h1>todos</h1>
    <h2>Delete a todo to be able to revert it</h2>
    <nav>
      <button :disabled="!lastPatch" @click="redo">Add last todo again</button>
    </nav>
    <div>
      <header class="header">
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
    </div>
  </section>
</template>

<script>
import { mapActions } from 'vuex';
import { Message } from 'element-ui';
import { record, revert, reapply } from '@/utils/diff';
import TodoItem from './TodoItem.vue';

const filters = {
  all: todos => todos,
  active: todos => todos.filter(todo => !todo.done),
  completed: todos => todos.filter(todo => todo.done),
};

export default {
  components: {
    TodoItem,
  },

  data() {
    return {
      visibility: 'all',
      filters,
      lastPatch: null,
    };
  },

  mounted() {
    // Fixtures
    this.addTodo({ target: { value: 'test 1' } });
    this.addTodo({ target: { value: 'test 2' } });
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
    },
  },

  filters: {
    pluralize: (n, w) => (n === 1 ? w : `${w}s`), // (remaining, 'item')
    capitalize: s => s.charAt(0).toUpperCase() + s.slice(1),
  },

  methods: {
    ...mapActions(['toggleAll']),
    clearCompleted() {
      record(this.$store.state, 'todos', (done) => {
        this.$store.dispatch('clearCompleted');
        done();
      }).then((patch) => {
        const h = this.$createElement;
        const msg = Message({
          message: h('p', {
            style: {
              flexGrow: '1',
              display: 'flex',
              alignItems: 'center',
            },
          }, [
            h('span', 'Completed todos cleared.'),
            h('button', {
              style: {
                textDecoration: 'underline',
                marginLeft: 'auto',
                cursor: 'pointer',
              },
              on: {
                click() {
                  msg.close();
                  revert(patch);
                },
              },
            }, 'Revert'),
          ]),
        });
      });
    },
    addTodo(e) {
      record(this.$store.state, 'todos', (done) => {
        const text = e.target.value;
        if (text.trim()) {
          this.$store.dispatch('addTodo', text);
        }
        e.target.value = '';
        done();
      }).then((patch) => {
        this.lastPatch = patch;
      });
    },
    redo() {
      reapply(this.lastPatch);
    },
  },
};
</script>

<style scoped>
.todoapp > div {
  background: #fff;
  margin: 0 auto;
  position: relative;
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.2), 0 25px 50px 0 rgba(0, 0, 0, 0.1);
  min-width: 230px;
  max-width: 600px;
  padding-top: 20px;
}

p {
  text-align: center;
}

input::-webkit-input-placeholder {
  font-style: italic;
  font-weight: 300;
  color: #e6e6e6;
}

input::-moz-placeholder {
  font-style: italic;
  font-weight: 300;
  color: #e6e6e6;
}

input::input-placeholder {
  font-style: italic;
  font-weight: 300;
  color: #e6e6e6;
}

h1 {
  font-size: 100px;
  padding: 0.5em 0;
  margin: 0;
  font-weight: 100;
  text-align: center;
  color: #c68383;
  -webkit-text-rendering: optimizeLegibility;
  -moz-text-rendering: optimizeLegibility;
  text-rendering: optimizeLegibility;
}

h2 {
  text-align: center;
}

nav {
  display: flex;
  justify-content: center;
  padding: 1em;
  font-family: monospace;
}

nav button {
  padding: .65em 1.15em;
  border: 1px solid grey;
  margin-left: -1px;
  position: relative;
  z-index: 1;
  text-transform: uppercase;
}

nav button:not([disabled]):hover,
nav button:not([disabled]):focus {
  background-color: rgba(0,0,0,.1);
  cursor: pointer;
}

nav button.active {
  box-shadow: 0 0 0 1px #c68383 inset, 0 0 0 1px #c68383;
  border-color: #c68383;
  z-index: 2;
}

nav button:first-child {
  border-top-left-radius: 5px;
  border-bottom-left-radius: 5px;
}

nav button:last-child {
  border-top-right-radius: 5px;
  border-bottom-right-radius: 5px;
}

nav button[disabled] {
  color: grey;
  border-color: lightgrey;
  z-index: 0;
}
</style>
