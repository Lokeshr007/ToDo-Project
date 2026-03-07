const axios = require('axios');

async function run() {
  try {
    const timestamp = Date.now();
    const email = `testuser${timestamp}@example.com`;
    const password = "password123";

    // 1. Register
    const regRes = await axios.post("http://localhost:8080/api/auth/register", {
      name: "Test User",
      email: email,
      password: password
    });
    console.log("Registered:", !!regRes.data);

    // 2. Login
    const loginRes = await axios.post("http://localhost:8080/api/auth/login", {
      email: email,
      password: password
    });
    const token = loginRes.data.accessToken || loginRes.data.token;
    console.log("Token:", typeof token);

    // 3. Create Workspace
    const wsRes = await axios.post("http://localhost:8080/api/workspaces", {
      name: "Test WS",
      type: "PERSONAL"
    }, { headers: { Authorization: `Bearer ${token}` } });
    const wsId = wsRes.data.id;
    console.log("Workspace:", wsId);

    // 4. Create Project
    const projRes = await axios.post("http://localhost:8080/api/projects", {
      name: "Test Project",
      description: "Desc",
      color: "#ff0000"
    }, { 
      headers: { Authorization: `Bearer ${token}`, 'X-Workspace-ID': String(wsId) },
      params: { workspaceId: wsId }
    });
    const projId = projRes.data.id;
    console.log("Project:", projId);

    // 5. Create Task
    const taskRes = await axios.post("http://localhost:8080/api/todos", {
      item: "Test Task",
      description: "Desc",
      projectId: projId
    }, {
      headers: { Authorization: `Bearer ${token}`, 'X-Workspace-ID': String(wsId) }
    });
    console.log("Task created:", taskRes.data.id);

    // 6. Delete Project
    const delRes = await axios.delete(`http://localhost:8080/api/projects/${projId}`, {
      headers: { Authorization: `Bearer ${token}`, 'X-Workspace-ID': String(wsId) }
    });
    console.log("Delete status:", delRes.status);

  } catch (err) {
    if (err.response) {
      console.log("STATUS:", err.response.status);
      console.log("DATA ERROR:", err.response.data);
    } else {
      console.log("ERROR:", err.message);
    }
  }
}
run();
