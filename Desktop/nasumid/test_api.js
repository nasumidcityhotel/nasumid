const GEMINI_API_KEY = 'AIzaSyDeJH4IWJ8TVUJ82vIfVYa8S5euetilMX4';

async function testModel(modelName) {
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: 'Hello' }] }]
      })
    });
    const data = await res.json();
    console.log(`${modelName}:`, data.error ? data.error.message : data.candidates[0].content.parts[0].text);
  } catch (err) {
    console.log(`${modelName}: fetch error`, err);
  }
}

async function run() {
  await testModel('gemini-2.0-flash');
  await testModel('gemini-1.5-flash');
  await testModel('gemini-flash-latest');
}

run();
