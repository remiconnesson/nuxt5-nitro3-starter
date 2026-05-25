export default defineEventHandler(() => {
  return {
    message: 'Hello from Nitro 3',
    nitro: process.versions,
    timestamp: new Date().toISOString(),
  }
})
