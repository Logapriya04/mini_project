const backend = "http://127.0.0.1:5000";

/* =======================
   ADMIN CONFIG
   ======================= */
const adminEmail = "admin@sigc.edu";
const adminPassword = "admin123";

/* =======================
   PROBLEM-FIRST FORM LOGIC
   ======================= */
function handleCategoryChange() {
  const category = document.getElementById("category").value;

  const building = document.getElementById("building");
  const classroom = document.getElementById("classroom");
  const floor = document.getElementById("floor");
  const electricityIssue = document.getElementById("electricityIssue");

  // Hide all conditional fields
  building.style.display = "none";
  classroom.style.display = "none";
  floor.style.display = "none";
  electricityIssue.style.display = "none";

  // Reset values
  classroom.value = "";
  floor.value = "";
  electricityIssue.value = "";

  // Show block once problem selected
  if (category !== "") {
    building.style.display = "block";
  }

  // Electricity → Block + Classroom + Issue
  if (category === "Electricity") {
    classroom.style.display = "block";
    electricityIssue.style.display = "block";
  }

  // Water / Restroom → Block + Floor
  if (category === "Water" || category === "Restroom") {
    floor.style.display = "block";
  }
}

/* =======================
   SUBMIT COMPLAINT
   ======================= */
function submitComplaint() {
  const email = document.getElementById("email").value;
  const category = document.getElementById("category").value;
  const desc = document.getElementById("desc").value;
  const msg = document.getElementById("submitMsg");

  if (!email.endsWith("@sigc.edu")) {
    msg.textContent = "❌ Use only @sigc.edu email";
    msg.style.color = "red";
    return;
  }

  if (category === "") {
    msg.textContent = "❌ Please select a problem type";
    msg.style.color = "red";
    return;
  }

  fetch(`${backend}/submit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: email,
      category: category,
      description: desc
    })
  })
  .then(res => res.json())
  .then(data => {
    msg.textContent = data.message || data.error;
    msg.style.color = "lightgreen";

    document.getElementById("email").value = "";
    document.getElementById("category").value = "";
    document.getElementById("desc").value = "";

    handleCategoryChange();
    updateStats();
    loadAdmin(adminEmail);
  });
}

/* =======================
   TRACK COMPLAINT
   ======================= */
function trackComplaint() {
  const email = document.getElementById("trackEmail").value;

  fetch(`${backend}/track/${email}`)
    .then(res => res.json())
    .then(data => {
      document.getElementById("trackResult").textContent =
        JSON.stringify(data, null, 2);
    });
}

/* =======================
   ADMIN DASHBOARD
   ======================= */
function loadAdmin(currentUserEmail) {
  fetch(`${backend}/admin`)
    .then(res => res.json())
    .then(data => {
      const tbody = document.querySelector("#adminTable tbody");
      tbody.innerHTML = "";

      data.forEach(row => {
        let badge =
          row.status === "Pending" ? "pending" :
          row.status === "In Progress" ? "inprogress" :
          "solved";

        let actions = "—";
        if (currentUserEmail === adminEmail) {
          actions = `
            <button onclick="updateStatus(${row.id}, 'Pending')">Pending</button>
            <button onclick="updateStatus(${row.id}, 'In Progress')">In Progress</button>
            <button onclick="updateStatus(${row.id}, 'Solved')">Solved</button>
          `;
        }

        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${row.id}</td>
          <td>${row.email}</td>
          <td>${row.category}</td>
          <td>${row.description}</td>
          <td><span class="badge ${badge}">${row.status}</span></td>
          <td>${actions}</td>
        `;
        tbody.appendChild(tr);
      });

      updateStats();
    });
}

/* =======================
   UPDATE STATUS (ADMIN)
   ======================= */
function updateStatus(id, status) {
  fetch(`${backend}/update`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id: id,
      status: status,
      admin_email: adminEmail,
      admin_password: adminPassword
    })
  })
  .then(res => res.json())
  .then(data => {
    if (data.error) {
      alert("❌ Unauthorized");
    } else {
      loadAdmin(adminEmail);
      updateStats();
    }
  });
}

/* =======================
   DASHBOARD STATS
   ======================= */
function updateStats() {
  fetch(`${backend}/admin`)
    .then(res => res.json())
    .then(all => {
      animateNumber("total", all.length);
      animateNumber("pending", all.filter(c => c.status === "Pending").length);
      animateNumber("solved", all.filter(c => c.status === "Solved").length);
    });
}

/* =======================
   ANIMATION
   ======================= */
function animateNumber(id, value) {
  const el = document.getElementById(id);
  let count = 0;
  const step = Math.max(1, Math.floor(value / 40));

  const interval = setInterval(() => {
    count += step;
    if (count >= value) {
      count = value;
      clearInterval(interval);
    }
    el.textContent = count;
  }, 20);
}

/* =======================
   INITIAL LOAD
   ======================= */
window.onload = () => {
  document.getElementById("building").style.display = "none";
  document.getElementById("classroom").style.display = "none";
  document.getElementById("floor").style.display = "none";
  document.getElementById("electricityIssue").style.display = "none";

  updateStats();
  loadAdmin(adminEmail);
};

/* =======================
   AUTO REFRESH
   ======================= */
setInterval(() => loadAdmin(adminEmail), 10000);
setInterval(updateStats, 10000);
