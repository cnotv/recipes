<template>
  <div class="app-container">
    <router-view />
  </div>
</template>

<script setup lang="ts">
// Router will handle all the navigation and views
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  background-color: #f8fafc;
  color: #1f2937;
  line-height: 1.6;
}

#app,
.app-container {
  min-height: 100vh;
  width: 100%;
}
</style>
