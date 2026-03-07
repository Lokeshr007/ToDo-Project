const axios = require('axios');
async function run() {
  try {
    const loginRes = await axios.post("http://localhost:8080/api/auth/login", {
      email: "lokeshlokeshr2005@gmail.com", 
      password: "password"
    });
    const token = loginRes.data.accessToken || loginRes.data.token;
    console.log("Logged in, token:", token.substring(0, 10) + "...");

    const deleteRes = await axios.delete("http://localhost:8080/api/projects/1", {
       headers: { 
         'X-Workspace-ID': '1', 
         'Authorization': `Bearer ${token}` 
       }
    });
    console.log("Delete success:", deleteRes.status);
  } catch (err) {
    if (err.response) {
      console.log("Delete error status:", err.response.status);
      console.log("Delete error data:", err.response.data);
    } else {
      console.log("Error:", err.message);
    }
  }
}
run();
