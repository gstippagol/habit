async function testCreateUser() {
    try {
        console.log('Sending login request...');
        const loginRes = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'admin@habit.com',
                password: 'admin123'
            })
        });

        const loginData = await loginRes.json();
        if (!loginRes.ok) throw new Error(loginData.message);

        const token = loginData.token;
        console.log('✅ Logged in as admin');

        console.log('Sending create user request...');
        // Try to create a user with a dynamic email
        const uniqueEmail = `habit.test.${Date.now()}@gmail.com`;
        const createRes = await fetch('http://localhost:5000/api/auth/admin/create-user', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                username: 'testuser_new',
                email: uniqueEmail,
                password: 'password123'
            })
        });

        const createData = await createRes.json();
        console.log('✅ Response:', createData);
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

testCreateUser();
