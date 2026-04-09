(async () => {
  try {
    const loginRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'tovoniaina.rahendrison@gmail.com',
        password: 'SuperAdmin2026!'
      })
    });
    const loginData = await loginRes.json();
    console.log('login status', loginRes.status);
    if (!loginRes.ok) {
      console.error('login failed', loginData);
      return;
    }
    const token = loginData.data.accessToken;
    const refresh = loginData.data.refreshToken;

    // immediate refresh test
    const refRes = await fetch('http://localhost:5000/api/auth/refresh-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: refresh })
    });
    const refData = await refRes.json();
    console.log('refresh status', refRes.status, refData);

    // helper to create staff
    const createStaff = async (count) => {
      const res = await fetch('http://localhost:5000/api/staff', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          email: `newstaff${count}@example.com`,
          password: 'Password123!',
          firstName: 'New',
          lastName: `Staff${count}`,
          role: 'STAFF'
        })
      });
      const data = await res.json();
      console.log(`createStaff #${count} status`, res.status, data);
      if (!res.ok && data.message) {
        console.error('createStaff error message', data.message);
      }
      return res;
    };

    for (let i = 1; i <= 4; i++) {
      await createStaff(i);
    }

  } catch (err) {
    console.error('fetch error', err);
  }
})();