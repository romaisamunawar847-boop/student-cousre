// ---------- Data ----------
// load from localStorage if available, otherwise use default data
 
let students = JSON.parse(localStorage.getItem("students")) || [];
 
let courses = JSON.parse(localStorage.getItem("courses")) || [
  { title: "Web Development", instructor: "Sir Ahmed", seats: 30 },
  { title: "Database Systems", instructor: "Ma'am Sara", seats: 25 },
  { title: "Data Structures", instructor: "Sir Bilal", seats: 20 }
];
 
let enrolled = JSON.parse(localStorage.getItem("enrolled")) || [];
 
function saveData() {
  localStorage.setItem("students", JSON.stringify(students));
  localStorage.setItem("courses", JSON.stringify(courses));
  localStorage.setItem("enrolled", JSON.stringify(enrolled));
}
 
// ---------- Tabs ----------
const tabBtns = document.querySelectorAll(".tab-btn");
const tabContents = document.querySelectorAll(".tab-content");
 
tabBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    tabBtns.forEach(b => b.classList.remove("active"));
    tabContents.forEach(c => c.classList.remove("active"));
 
    btn.classList.add("active");
    document.getElementById(btn.dataset.tab).classList.add("active");
  });
});
 
// ---------- Student Registration ----------
const registerForm = document.getElementById("registerForm");
 
registerForm.addEventListener("submit", function (e) {
  e.preventDefault();
 
  const name = document.getElementById("studentName").value.trim();
  const id = document.getElementById("studentId").value.trim();
  const email = document.getElementById("studentEmail").value.trim();
  const phone = document.getElementById("studentPhone").value.trim();
 
  // clear old errors
  document.getElementById("nameError").textContent = "";
  document.getElementById("idError").textContent = "";
  document.getElementById("emailError").textContent = "";
  document.getElementById("phoneError").textContent = "";
 
  let valid = true;
 
  if (name === "") {
    document.getElementById("nameError").textContent = "Name is required";
    valid = false;
  }
 
  if (id === "") {
    document.getElementById("idError").textContent = "Student ID is required";
    valid = false;
  }
 
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    document.getElementById("emailError").textContent = "Enter a valid email";
    valid = false;
  }
 
  const phonePattern = /^[0-9]{10,11}$/;
  if (!phonePattern.test(phone)) {
    document.getElementById("phoneError").textContent = "Enter a valid phone number (10-11 digits)";
    valid = false;
  }
 
  if (!valid) return;
 
  students.push({ name, id, email, phone });
  saveData();
 
  registerForm.reset();
 
  const msg = document.getElementById("regMessage");
  msg.textContent = "Registered successfully!";
  setTimeout(() => (msg.textContent = ""), 2500);
 
  renderStudents();
});
 
function renderStudents() {
  const tbody = document.querySelector("#studentTable tbody");
  tbody.innerHTML = "";
 
  students.forEach((s, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${s.name}</td>
      <td>${s.id}</td>
      <td>${s.email}</td>
      <td>${s.phone}</td>
      <td><button class="delete-btn" onclick="deleteStudent(${index})">Remove</button></td>
    `;
    tbody.appendChild(row);
  });
}
 
function deleteStudent(index) {
  students.splice(index, 1);
  saveData();
  renderStudents();
}
 
// ---------- Courses (student view) ----------
function renderCourses() {
  const list = document.getElementById("courseList");
  list.innerHTML = "";
 
  courses.forEach((c, index) => {
    const alreadyEnrolled = enrolled.includes(index);
 
    const card = document.createElement("div");
    card.classList.add("course-card");
    card.innerHTML = `
      <h4>${c.title}</h4>
      <p>Instructor: ${c.instructor}</p>
      <p>Seats left: ${c.seats}</p>
      <button ${alreadyEnrolled || c.seats <= 0 ? "disabled" : ""} onclick="enrollCourse(${index})">
        ${alreadyEnrolled ? "Already Enrolled" : c.seats <= 0 ? "Full" : "Enroll"}
      </button>
    `;
    list.appendChild(card);
  });
}
 
function enrollCourse(index) {
  if (enrolled.includes(index)) return;
  if (courses[index].seats <= 0) {
    alert("Sorry, this course is full.");
    return;
  }
 
  courses[index].seats -= 1;
  enrolled.push(index);
  saveData();
 
  renderCourses();
  renderEnrolled();
}
 
function renderEnrolled() {
  const list = document.getElementById("enrolledList");
  const noMsg = document.getElementById("noEnrollMsg");
  list.innerHTML = "";
 
  if (enrolled.length === 0) {
    noMsg.style.display = "block";
    return;
  }
  noMsg.style.display = "none";
 
  enrolled.forEach(i => {
    const c = courses[i];
    if (!c) return;
    const card = document.createElement("div");
    card.classList.add("course-card");
    card.innerHTML = `
      <h4>${c.title}</h4>
      <p>Instructor: ${c.instructor}</p>
      <button onclick="unenrollCourse(${i})">Drop Course</button>
    `;
    list.appendChild(card);
  });
}
 
function unenrollCourse(index) {
  enrolled = enrolled.filter(i => i !== index);
  courses[index].seats += 1;
  saveData();
  renderCourses();
  renderEnrolled();
}
 
// ---------- Admin Panel ----------
const courseForm = document.getElementById("courseForm");
const courseSubmitBtn = document.getElementById("courseSubmitBtn");
const cancelEditBtn = document.getElementById("cancelEditBtn");
 
courseForm.addEventListener("submit", function (e) {
  e.preventDefault();
 
  const title = document.getElementById("courseTitle").value.trim();
  const instructor = document.getElementById("courseInstructor").value.trim();
  const seats = document.getElementById("courseSeats").value.trim();
  const editIndex = parseInt(document.getElementById("editIndex").value);
 
  document.getElementById("titleError").textContent = "";
  document.getElementById("instructorError").textContent = "";
  document.getElementById("seatsError").textContent = "";
 
  let valid = true;
 
  if (title === "") {
    document.getElementById("titleError").textContent = "Course title is required";
    valid = false;
  }
 
  if (instructor === "") {
    document.getElementById("instructorError").textContent = "Instructor name is required";
    valid = false;
  }
 
  if (seats === "" || isNaN(seats) || Number(seats) < 0) {
    document.getElementById("seatsError").textContent = "Enter a valid seat number";
    valid = false;
  }
 
  if (!valid) return;
 
  if (editIndex === -1) {
    // adding new course
    courses.push({ title, instructor, seats: Number(seats) });
  } else {
    // updating existing course
    courses[editIndex] = { title, instructor, seats: Number(seats) };
    document.getElementById("editIndex").value = -1;
    courseSubmitBtn.textContent = "Add Course";
    cancelEditBtn.style.display = "none";
  }
 
  saveData();
  courseForm.reset();
  renderAdminCourses();
  renderCourses();
});
 
cancelEditBtn.addEventListener("click", function () {
  courseForm.reset();
  document.getElementById("editIndex").value = -1;
  courseSubmitBtn.textContent = "Add Course";
  cancelEditBtn.style.display = "none";
});
 
function renderAdminCourses() {
  const tbody = document.querySelector("#adminCourseTable tbody");
  tbody.innerHTML = "";
 
  courses.forEach((c, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${c.title}</td>
      <td>${c.instructor}</td>
      <td>${c.seats}</td>
      <td>
        <button class="edit-btn" onclick="editCourse(${index})">Edit</button>
        <button class="delete-btn" onclick="deleteCourse(${index})">Delete</button>
      </td>
    `;
    tbody.appendChild(row);
  });
}
 
function editCourse(index) {
  const c = courses[index];
  document.getElementById("courseTitle").value = c.title;
  document.getElementById("courseInstructor").value = c.instructor;
  document.getElementById("courseSeats").value = c.seats;
  document.getElementById("editIndex").value = index;
 
  courseSubmitBtn.textContent = "Update Course";
  cancelEditBtn.style.display = "inline-block";
}
 
function deleteCourse(index) {
  if (!confirm("Are you sure you want to delete this course?")) return;
 
  courses.splice(index, 1);
  // remove any enrollment pointing to this course, fix indexes after
  enrolled = enrolled.filter(i => i !== index).map(i => (i > index ? i - 1 : i));
 
  saveData();
  renderAdminCourses();
  renderCourses();
  renderEnrolled();
}
 
// ---------- Initial render ----------
renderStudents();
renderCourses();
renderEnrolled();
renderAdminCourses();