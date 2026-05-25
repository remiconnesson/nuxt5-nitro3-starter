import { defineHandler } from 'h3'

export default defineHandler(() => {
  return {
    message: 'Hello from Nitro 3',
    node: process.versions.node,
    timestamp: new Date().toISOString(),
  }
})
