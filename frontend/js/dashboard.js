const API_BASE_URL = 'http://localhost:5000/api';
const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user'));

if (!token || !user) window.location.href = 'index.html';

document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('token'); localStorage.removeItem('user'); window.location.href = 'index.html';
});

document.getElementById('welcomeMessage').innerText = `Welcome back, ${user.name.split(' ')[0]}! 👋`;
document.getElementById('roleBadge').innerText = user.role;

async function loadDashboard() {
    try {
        if (user.role === 'Student') await loadStudentDashboard();
        else if (user.role === 'Instructor') await loadInstructorDashboard();
        else if (user.role === 'Admin') await loadAdminDashboard();
    } catch (error) {
        document.getElementById('loadingSpinner').style.display = 'none';
        document.getElementById('contentContainer').innerHTML = `<div class="alert alert-danger">Failed to load dashboard data.</div>`;
    }
}

async function loadStudentDashboard() {
    document.getElementById('listTitle').innerText = "Continue Learning";
    
    const response = await fetch(`${API_BASE_URL}/dashboard/student`, { headers: { 'Authorization': `Bearer ${token}` } });
    const data = await response.json();

    if (data.success) {
        const stats = data.data.overview.enrollments;
        const courses = data.data.courses;

        document.getElementById('statsContainer').innerHTML = `
            <div class="col-md-4 mb-3"><div class="card stat-card bg-primary p-3"><h6>Enrolled Courses</h6><h2 class="fw-bold">${stats.total}</h2></div></div>
            <div class="col-md-4 mb-3"><div class="card stat-card bg-success p-3"><h6>Completed</h6><h2 class="fw-bold">${stats.completed}</h2></div></div>
            <div class="col-md-4 mb-3"><div class="card stat-card bg-info text-dark p-3"><h6>Average Progress</h6><h2 class="fw-bold">${stats.avgProgress}%</h2></div></div>
        `;

        const container = document.getElementById('contentContainer');
        document.getElementById('loadingSpinner').style.display = 'none';

        if (courses.length > 0) {
            courses.forEach(c => {
                let colorClass = c.progressPercentage === 100 ? 'bg-success' : 'bg-primary';
                container.innerHTML += `
                    <div class="col-md-6 mb-4">
                        <div class="card course-card h-100 p-3">
                            <div class="d-flex justify-content-between mb-2">
                                <span class="badge bg-secondary">${c.category}</span>
                                <small class="text-muted">By ${c.instructorName || 'Instructor'}</small>
                            </div>
                            <h5 class="fw-bold">${c.courseTitle}</h5>
                            <div class="mt-auto pt-3">
                                <div class="d-flex justify-content-between mb-1">
                                    <small class="fw-bold">Progress</small>
                                    <small class="fw-bold">${c.progressPercentage}%</small>
                                </div>
                                <div class="progress mb-3">
                                    <div class="progress-bar ${colorClass}" style="width: ${c.progressPercentage}%"></div>
                                </div>
                                <!-- زرار الدخول وزرار السحب -->
                                <div class="d-flex gap-2">
                                    <a href="course.html?id=${c.courseId}" class="btn btn-outline-primary w-50">Go to Course</a>
                                    <button class="btn btn-outline-danger w-50" onclick="dropCourse('${c.enrollmentId}')">Drop</button>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            });
        } else {
            container.innerHTML = `<div class="alert alert-info w-100">You are not enrolled in any courses yet. <a href="courses.html" class="alert-link">Browse Courses</a></div>`;
        }
    }
}

async function dropCourse(enrollmentId) {
    if (!confirm('Are you sure you want to drop this course? Your progress will be lost.')) return;
    try {
        const res = await fetch(`${API_BASE_URL}/enrollments/${enrollmentId}/drop`, {
            method: 'PATCH', headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) { alert('Course dropped successfully.'); location.reload(); }
        else alert(data.message);
    } catch (e) { alert('Network error'); }
}

async function loadInstructorDashboard() {
    document.getElementById('listTitle').innerText = "My Created Courses";
    const response = await fetch(`${API_BASE_URL}/dashboard/instructor`, { headers: { 'Authorization': `Bearer ${token}` } });
    const data = await response.json();

    if (data.success) {
        const stats = data.data.overview;
        const courses = stats.courses || [];

        document.getElementById('statsContainer').innerHTML = `
            <div class="col-md-3 mb-3"><div class="card stat-card bg-dark p-3"><h6>My Courses</h6><h2 class="fw-bold">${stats.totalCourses}</h2></div></div>
            <div class="col-md-3 mb-3"><div class="card stat-card bg-primary p-3"><h6>Total Students</h6><h2 class="fw-bold">${stats.totalStudents}</h2></div></div>
            <div class="col-md-3 mb-3"><div class="card stat-card bg-warning text-dark p-3"><h6>Assignments</h6><h2 class="fw-bold">${stats.totalAssignments}</h2></div></div>
            <div class="col-md-3 mb-3"><div class="card stat-card bg-success p-3"><h6>Submissions</h6><h2 class="fw-bold">${stats.totalSubmissions}</h2></div></div>
        `;

        const container = document.getElementById('contentContainer');
        document.getElementById('loadingSpinner').style.display = 'none';

        if (courses.length > 0) {
            courses.forEach(c => {
                container.innerHTML += `
                    <div class="col-md-4 mb-4">
                        <div class="card course-card h-100 p-3">
                            <h5 class="fw-bold">${c.courseTitle}</h5><hr>
                            <div class="d-flex justify-content-between mb-1"><small>Students:</small><strong>${c.students}</strong></div>
                            <div class="d-flex justify-content-between mb-1"><small>Completed:</small><strong>${c.completed}</strong></div>
                            <div class="d-flex justify-content-between mb-3"><small>Avg Progress:</small><strong class="text-primary">${c.avgProgress}%</strong></div>
                            <a href="course.html?id=${c.courseId}" class="btn btn-primary w-100 mt-auto">Manage Course</a>
                        </div>
                    </div>
                `;
            });
        } else {
            container.innerHTML = `<div class="alert alert-info w-100">You haven't created any courses yet.</div>`;
        }
    }
}

async function loadAdminDashboard() {
    document.getElementById('listTitle').innerText = "Platform Overview";
    const response = await fetch(`${API_BASE_URL}/dashboard/admin`, { headers: { 'Authorization': `Bearer ${token}` } });
    const data = await response.json();

    if (data.success) {
        const overview = data.data.overview;
        const topCourses = data.data.topCourses || [];

        document.getElementById('statsContainer').innerHTML = `
            <div class="col-md-3 mb-3"><div class="card stat-card bg-primary p-3"><h6>Total Users</h6><h2 class="fw-bold">${(overview.users.Student || 0) + (overview.users.Instructor || 0) + (overview.users.Admin || 0)}</h2></div></div>
            <div class="col-md-3 mb-3"><div class="card stat-card bg-dark p-3"><h6>Total Courses</h6><h2 class="fw-bold">${overview.courses.total}</h2></div></div>
            <div class="col-md-3 mb-3"><div class="card stat-card bg-success p-3"><h6>Enrollments</h6><h2 class="fw-bold">${overview.enrollments}</h2></div></div>
            <div class="col-md-3 mb-3"><div class="card stat-card bg-warning text-dark p-3"><h6>Submissions</h6><h2 class="fw-bold">${overview.submissions}</h2></div></div>
        `;

        const container = document.getElementById('contentContainer');
        document.getElementById('loadingSpinner').style.display = 'none';
        document.getElementById('listTitle').innerText = "Top 5 Courses";

        if (topCourses.length > 0) {
            topCourses.forEach(c => {
                container.innerHTML += `
                    <div class="col-md-4 mb-4">
                        <div class="card course-card h-100 p-3">
                            <span class="badge bg-secondary mb-2 w-50">${c.category || 'General'}</span>
                            <h5 class="fw-bold">${c.title}</h5>
                            <small class="text-muted mb-2">By: ${c.instructor ? c.instructor.name : 'Unknown'}</small><hr>
                            <div class="d-flex justify-content-between"><small>Enrolled:</small><strong>${c.enrollmentCount} students</strong></div>
                        </div>
                    </div>
                `;
            });
        }
    }
}

loadDashboard();