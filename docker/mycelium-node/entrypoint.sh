#!/bin/sh

# Clean install to ensure correct binaries for current architecture
rm -rf node_modules

npm i
npm run dev
