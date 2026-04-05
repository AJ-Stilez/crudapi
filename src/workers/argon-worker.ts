import { parentPort, workerData } from 'worker_threads';
import * as argon2 from 'argon2';

// Verify password using Argon2
argon2
  .verify(workerData.hash, workerData.password)
  .then((result) => parentPort?.postMessage(result))
  .catch(() => parentPort?.postMessage(false));
