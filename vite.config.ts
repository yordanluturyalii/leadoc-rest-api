/// <reference types="vitest" />
import { defineConfig } from 'vite'

export default defineConfig({
    test: {
        globals: true,
        environment: "node",
        include: ["test/**/*.test.ts"],
        coverage: {
            reporter: ["text", "json", "html"]
        }
    }
})