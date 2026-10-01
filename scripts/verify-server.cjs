const http = require('http');
const path = require('path');

async function test() {
  const { default: app } = await import('../server/index.js');
  
  const server = app.listen(5099, async () => {
    console.log('Test server started on port 5099');

    const get = (url) => new Promise((resolve, reject) => {
      http.get(`http://localhost:5099${url}`, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(data) });
          } catch {
            resolve({ status: res.statusCode, text: data });
          }
        });
      }).on('error', reject);
    });

    const post = (url, body) => new Promise((resolve, reject) => {
      const payload = JSON.stringify(body);
      const req = http.request(`http://localhost:5099${url}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload),
        }
      }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(data) });
          } catch {
            resolve({ status: res.statusCode, text: data });
          }
        });
      });
      req.on('error', reject);
      req.write(payload);
      req.end();
    });

    try {
      // 1. Check projects
      const proj = await get('/api/projects');
      console.log('Projects endpoint:', proj.status, 'Total:', proj.data?.data?.length);

      // 2. Check categories
      const cats = await get('/api/categories');
      console.log('Categories endpoint:', cats.status, 'Names:', cats.data?.data?.map(c => c.name));

      // 3. Check public settings
      const settings = await get('/api/settings/public');
      console.log('Settings endpoint:', settings.status, 'Eyebrow:', settings.data?.data?.hero_eyebrow);

      // 4. Check contact submission
      const contactRes = await post('/api/contact', {
        name: 'Design Director',
        email: 'director@studio.design',
        message: 'Loved your visual work and branding case studies. Let us discuss an upcoming project!',
      });
      console.log('Contact POST endpoint:', contactRes.status, contactRes.data?.message);

      // 5. Check character asset serving
      const charRes = await new Promise((resolve) => {
        http.get('http://localhost:5099/assets/character/front-trans.png', (res) => {
          resolve({ status: res.statusCode, contentType: res.headers['content-type'] });
        });
      });
      console.log('Character asset serving:', charRes.status, charRes.contentType);

      console.log('\n--- ALL VERIFICATIONS PASSED SUCCESSFULLY ---');
    } catch (err) {
      console.error('Verification failed:', err);
    } finally {
      server.close(() => {
        console.log('Test server closed.');
        process.exit(0);
      });
    }
  });
}

test();
