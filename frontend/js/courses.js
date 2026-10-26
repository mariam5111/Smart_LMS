const API_BASE_URL = 'http://localhost:5000/api';
const token = localStorage.getItem('token');
const userStr = localStorage.getItem('user');

if (!token) window.location.href = 'index.html';

let user = null;
try {
    user = JSON.parse(userStr);
    if (user) {
        document.getElementById('userName').innerText = `Welcome, ${user.name}`;
     
        if (user.role === 'Student') {
            document.getElementById('addCourseBtn').style.display = 'none';
        }
    }
} catch (e) {
    console.error("Error parsing user data", e);
}

document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'index.html';
});

async function fetchCourses() {
    try {
        const response = await fetch(`${API_BASE_URL}/courses`);
        const data = await response.json();
        const container = document.getElementById('coursesContainer');
        document.getElementById('loadingSpinner').style.display = 'none';

        if (data.success && data.data.length > 0) {
            data.data.forEach(course => {
                const price = course.price === 0 ? 'Free' : `$${course.price}`;
                const instructorName = course.instructor ? course.instructor.name : 'Unknown';
                
                const isOwner = course.instructor && course.instructor._id === user._id;
                const isAdmin = user.role === 'Admin';
                const isStudent = user.role === 'Student';

                let actionButton = '';

                if (isOwner || isAdmin) {
                    actionButton = `<a href="course.html?id=${course._id}" class="btn btn-primary w-100">Manage Course</a>`;
                } 
                else if (isStudent) {
                    actionButton = `
                        <div class="d-flex gap-2">
                            <button class="btn btn-outline-primary w-50" onclick="enroll('${course._id}')">Enroll</button>
                            <a href="course.html?id=${course._id}" class="btn btn-primary w-50">View</a>
                        </div>
                    `;
                }

                container.innerHTML += `
                    <div class="col-md-4 mb-4">
                        <div class="card h-100 course-card">
                            <div class="card-body">
                                <span class="badge bg-primary mb-2">${course.category}</span>
                                <h5 class="card-title fw-bold">${course.title}</h5>
                                <p class="card-text text-muted text-truncate" style="max-width: 100%;">${course.description}</p>
                                <hr>
                                <div class="d-flex justify-content-between align-items-center">
                                    <small class="text-secondary">👨‍🏫 ${instructorName}</small>
                                    <span class="fw-bold ${course.price === 0 ? 'text-success' : 'text-dark'}">${price}</span>
                                </div>
                            </div>
                            <div class="card-footer bg-white border-top-0">
                                ${actionButton}
                            </div>
                        </div>
                    </div>
                `;
            });
        } else {
            let emptyMsg = "No courses available right now.";
            if (user && user.role !== 'Student') {
                emptyMsg += " Be the first to create one!";
            }
            container.innerHTML = `<div class="alert alert-info w-100">${emptyMsg}</div>`;
        }
    } catch (error) {
        console.error(error);
        document.getElementById('loadingSpinner').style.display = 'none';
        document.getElementById('coursesContainer').innerHTML = `<div class="alert alert-danger w-100">Failed to load courses. Make sure the backend is running.</div>`;
    }
}

async function enroll(courseId) {
    try {
        const response = await fetch(`${API_BASE_URL}/enrollments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ courseId: courseId })
        });
        const data = await response.json();
        if (data.success) alert('🎉 Successfully enrolled in the course!');
        else alert(`⚠️ ${data.message}`);
    } catch (error) {
        alert('Network error, please try again.');
    }
}

// إضافة كورس
document.getElementById('addCourseForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const title = document.getElementById('courseTitle').value;
    const description = document.getElementById('courseDesc').value;
    const category = document.getElementById('courseCategory').value;
    const price = Number(document.getElementById('coursePrice').value);

    try {
        const response = await fetch(`${API_BASE_URL}/courses`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ title, description, category, price, status: 'published' })
        });
        const data = await response.json();
        if (data.success) {
            alert('🎉 Course published successfully!');
            window.location.reload(); 
        } else {
            alert(`⚠️ Error: ${data.message}`);
        }
    } catch (error) {
        alert('Network error, please try again.');
    }
});

fetchCourses();