<script setup lang="ts">
const { data, error, refresh } = await useFetch('/api/hello')
</script>

<template>
  <main>
    <h1>Nuxt 5 + Nitro 3</h1>
    <p v-if="error">Error: {{ error.message }}</p>
    <pre v-else>{{ data }}</pre>
    <button type="button" @click="refresh()">Refetch</button>
  </main>
</template>

<style>
:root { color-scheme: light dark; font-family: system-ui, sans-serif; }
main { max-width: 40rem; margin: 4rem auto; padding: 0 1rem; }
pre { background: rgba(127,127,127,.12); padding: 1rem; border-radius: .5rem; }
button { padding: .5rem 1rem; cursor: pointer; }
</style>
