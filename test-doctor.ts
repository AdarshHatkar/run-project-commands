// Test script for RPC doctor command
// Run this with: node --loader ts-node/esm test-doctor.ts

import { doctorCommand } from './src/commands/doctor.js';

console.log('Testing RPC doctor command...');
doctorCommand();
