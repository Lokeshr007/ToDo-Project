const axios = require('axios');
async function run() {
  try {
    const loginRes = await axios.post("http://localhost:8080/api/auth/login", {
      email: "lokeshlokeshr2005@gmail.com", 
      password: "password"
    });
    const token = loginRes.data.accessToken || loginRes.data.token;
    console.log("Logged in, token:", token.substring(0, 10));

    // Try deleting an invalid/existing project or bulk delete
    const deleteRes = await axios.post("http://localhost:8080/api/todos/bulk/delete", 
       { ids: [34, 35, 36, 1, 2, 3], permanent: true },
       { headers: { 'X-Workspace-ID': '1', 'Authorization': `Bearer ${token}` } }
    );
    console.log("Delete success:", deleteRes.status);
  } catch (err) {
    if (err.response) {
      console.log("RESPONSE ERROR DATA:", JSON.stringify(err.response.data));
    } else {
      console.log("MESS:", err.message);
    }
  }
}
run();
