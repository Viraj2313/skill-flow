let worker;
let sequence = 0;

function getWorker() {
  if (!worker) worker = new Worker('/python-runner.js');
  return worker;
}

export function runPython(code, tests, timeoutMs = 5000) {
  return new Promise((resolve, reject) => {
    const id = ++sequence;
    const activeWorker = getWorker();
    const timer = window.setTimeout(() => {
      activeWorker.terminate();
      worker = null;
      reject(new Error('Execution timed out.'));
    }, timeoutMs);

    const handleMessage = ({ data }) => {
      if (data.id !== id) return;
      activeWorker.removeEventListener('message', handleMessage);
      window.clearTimeout(timer);
      if (data.error) reject(new Error(data.error));
      else resolve(data.output);
    };

    activeWorker.addEventListener('message', handleMessage);
    activeWorker.postMessage({ id, code, tests });
  });
}
