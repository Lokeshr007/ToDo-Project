const axios = require('axios');
async function test() {
  try {
    const res = await axios.delete("http://localhost:8080/api/projects/1", {
       headers: { 'X-Workspace-ID': '1', 'Authorization': 'Bearer ' + process.env.TOKEN }
    });
    console.log("Success:", res.status, res.data);
  } catch (err) {
    if (err.response) {
      console.log("Error:", err.response.status, err.response.data);
    } else {
      console.log("Network error:", err.message);
    }
  }
}
test();
