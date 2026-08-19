let pyodideReady;

async function getPyodide() {
  if (!pyodideReady) {
    importScripts('https://cdn.jsdelivr.net/pyodide/v0.27.7/full/pyodide.js');
    pyodideReady = loadPyodide();
  }
  return pyodideReady;
}

self.onmessage = async ({ data }) => {
  const { id, code, tests } = data;
  try {
    const pyodide = await getPyodide();
    pyodide.globals.set('user_code', code);
    pyodide.globals.set('test_cases_json', JSON.stringify(tests));
    const output = await pyodide.runPythonAsync(`
import json
import traceback

results = []
namespace = {}
exec(user_code, namespace)
solution = namespace.get('solution')
if not callable(solution):
    raise ValueError('Define a function named solution.')
for test in json.loads(test_cases_json):
    try:
        actual = solution(*test['args'])
        passed = actual == test['expected']
        results.append({'passed': passed, 'actual': actual, 'expected': test['expected']})
    except Exception as error:
        results.append({'passed': False, 'error': str(error), 'expected': test['expected']})
json.dumps({'results': results})
`);
    self.postMessage({ id, output: JSON.parse(output) });
  } catch (error) {
    self.postMessage({ id, error: error.message || 'Python execution failed.' });
  }
};
