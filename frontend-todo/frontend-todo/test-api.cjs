const axios = require('axios');

async function test() {
  try {
    const res = await axios.post("http://localhost:8080/api/todos/bulk/delete", {
      ids: ["invalid"],
      permanent: true
    }, {
       // We don't have token but just to see if we get 401 or 400
       headers: { 'Content-Type': 'application/json' }
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
