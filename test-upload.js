const fs = require('fs');

async function test() {
  const formData = new FormData();
  const fileBuffer = fs.readFileSync('package.json');
  const fileBlob = new Blob([fileBuffer]);
  formData.append('file', fileBlob, 'package.json');
  
  try {
    const res = await fetch('http://localhost:3000/api/upload', {
      method: 'POST',
      body: formData
    });
    console.log('Status:', res.status);
    console.log('Body:', await res.json());
  } catch(e) {
    console.error(e);
  }
}
test();
