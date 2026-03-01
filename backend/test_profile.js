const axios = require('axios');

async function testProfile() {
    try {
        console.log("Fetching profile...");
        const response = await axios.get('http://localhost:5000/api/users/profile', {
            headers: { Authorization: "Bearer test" }
        });
        console.log("Status:", response.status);
        console.log("Data:", response.data);
    } catch (err) {
        if (err.response) {
            console.log("Error Status:", err.response.status);
            console.log("Error Data:", err.response.data);
        } else {
            console.log("Error:", err.message);
        }
    }
}

testProfile();
