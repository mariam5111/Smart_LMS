const API_BASE_URL = 'http://localhost:5000/api';
const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user'));

if (!token || !user) window.location.href = 'index.html';

document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('token'); localStorage.removeItem('user'); window.location.href = 'index.html';
});

const urlParams = new URLSearchParams(window.location.search);
const courseId = urlParams.get('id');
if (!courseId) window.location.href = 'courses.html';

let currentCourse = null;
let mySubmissions = [];
let myEnrollment = null;

async function loadCourseData() {
    try {
        const courseRes = await fetch(`${API_BASE_URL}/courses/${courseId}`);
        const courseData = await courseRes.json();
        currentCourse = courseData.data;

        const lessonsRes = await fetch(`${API_BASE_URL}/courses/${courseId}/lessons`, { headers: { 'Authorization': `Bearer ${token}` } });
        const lessonsData = await lessonsRes.json();
        
        const assignRes = await fetch(`${API_BASE_URL}/courses/${courseId}/assignments`, { headers: { 'Authorization': `Bearer ${token}` } });
        const assignData = await assignRes.json();

        if (user.role === 'Student') {
            const subRes = await fetch(`${API_BASE_URL}/submissions/my-submissions`, { headers: { 'Authorization': `Bearer ${token}` } });
            const subData = await subRes.json();
            if (subData.success) mySubmissions = subData.data;

            const enrRes = await fetch(`${API_BASE_URL}/enrollments/my-enrollments`, { headers: { 'Authorization': `Bearer ${token}` } });
            const enrData = await enrRes.json();
            if (enrData.success) {
                myEnrollment = enrData.data.find(e => e.course._id === courseId);
            }
        }

        renderCourse(currentCourse, lessonsData.data || [], assignData.data || []);
        loadReviews();
    } catch (error) {
        document.getElementById('mainContent').innerHTML = `<div class="alert alert-danger">Error loading course data.</div>`;
    }
}

function renderCourse(course, lessons, assignments) {
    const isOwner = (course.instructor && course.instructor._id === user._id) || user.role === 'Admin';
    const isStudent = user.role === 'Student';

    let editCourseBtn = isOwner ? `<div class="d-flex gap-2"><button class="btn btn-sm btn-outline-primary" onclick="openCourseModal()">Edit</button><button class="btn btn-sm btn-outline-danger" onclick="deleteCourse()">Delete</button></div>` : '';
    let addBtns = isOwner ? `<div class="d-flex gap-2"><button class="btn btn-success btn-sm" onclick="openLessonModal()">+ Lesson</button><button class="btn btn-warning btn-sm text-dark" onclick="openAssignModal()">+ Assignment</button></div>` : '';

    let lessonsHTML = lessons.length === 0 ? '<p class="text-muted">No lessons yet.</p>' : '';
    lessons.forEach(lesson => {
        let controls = isOwner ? `
            <button class="btn btn-sm btn-outline-primary me-1" onclick="openLessonModal('${lesson._id}', '${lesson.title}', '${lesson.content}', ${lesson.order}, ${lesson.duration})">Edit</button>
            <button class="btn btn-sm btn-outline-danger" onclick="deleteLesson('${lesson._id}')">Delete</button>
        ` : `<button class="btn btn-sm btn-outline-success" onclick="markLessonComplete('${lesson._id}', this)">Mark Completed ✅</button>`;

        lessonsHTML += `<div class="lesson-item p-3 mb-2 d-flex justify-content-between align-items-center"><div><h6 class="mb-0 fw-bold">${lesson.order}. ${lesson.title}</h6></div><div>${controls}</div></div>`;
    });

    // --- الواجبات ---
    let assignmentsHTML = assignments.length === 0 ? '<p class="text-muted">No assignments yet.</p>' : '';
    assignments.forEach(assign => {
        let controls = '';
        let studentAction = '';

        if (isOwner) {
            const deadlineDate = new Date(assign.deadline).toISOString().split('T')[0];
            controls = `
                <button class="btn btn-sm btn-info text-white me-1 mb-1" onclick="viewSubmissions('${assign._id}')">Submissions</button><br>
                <button class="btn btn-sm btn-outline-primary me-1" onclick="openAssignModal('${assign._id}', '${assign.title}', '${assign.description}', '${deadlineDate}', ${assign.maxScore})">Edit</button>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteAssignment('${assign._id}')">Delete</button>
            `;
        } else if (isStudent) {
            const sub = mySubmissions.find(s => s.assignment && s.assignment._id === assign._id);
            if (sub) {
                studentAction = sub.status === 'graded' 
                    ? `<div class="alert alert-success p-2 mt-2 mb-0"><strong>Graded!</strong> Score: ${sub.score} / ${assign.maxScore}</div>`
                    : `<div class="alert alert-info p-2 mt-2 mb-0"><strong>Submitted!</strong> Waiting for instructor.</div>`;
            } else {
                studentAction = `<div class="mt-3"><textarea class="form-control mb-2" id="sub-${assign._id}" rows="2" placeholder="Write your solution..."></textarea><button class="btn btn-sm btn-primary" onclick="submitAssignment('${assign._id}')">Submit</button></div>`;
            }
        }

        assignmentsHTML += `
            <div class="assignment-item p-3 mb-3">
                <div class="d-flex justify-content-between align-items-start">
                    <div><h6 class="fw-bold text-warning mb-1">📝 ${assign.title}</h6><p class="mb-1 text-muted small">${assign.description}</p><small class="text-danger fw-bold">Deadline: ${new Date(assign.deadline).toLocaleDateString()}</small></div>
                    <div class="text-end"><span class="badge bg-danger mb-2 d-block">Max: ${assign.maxScore}</span>${controls}</div>
                </div>
                ${studentAction}
            </div>`;
    });

    document.getElementById('mainContent').innerHTML = `
        <div class="row">
            <div class="col-md-8">
                <div class="d-flex justify-content-between align-items-center mb-2"><h2 class="fw-bold m-0">${course.title}</h2>${editCourseBtn}</div>
                <p class="text-muted lead">${course.description}</p>
                
                <div class="d-flex justify-content-between align-items-center mt-4 mb-3"><h4 class="fw-bold m-0">Lessons</h4>${addBtns}</div>
                <div>${lessonsHTML}</div>

                <h4 class="fw-bold mt-5 mb-3">Assignments</h4>
                <div>${assignmentsHTML}</div>

                <!-- قسم التقييمات -->
                <h4 class="fw-bold mt-5 mb-3">Student Reviews</h4>
                <div id="reviewsContainer" class="mb-4"></div>
                
                <div id="addReviewSection" class="card shadow-sm border-0 d-none mt-3">
                    <div class="card-body">
                        <h5 class="fw-bold mb-3">Leave a Review</h5>
                        <div class="mb-3">
                            <label class="form-label">Rating</label>
                            <select id="reviewRating" class="form-select w-50">
                                <option value="5">⭐⭐⭐⭐⭐ (5 - Excellent)</option>
                                <option value="4">⭐⭐⭐⭐ (4 - Good)</option>
                                <option value="3">⭐⭐⭐ (3 - Average)</option>
                                <option value="2">⭐⭐ (2 - Poor)</option>
                                <option value="1">⭐ (1 - Terrible)</option>
                            </select>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Comment</label>
                            <textarea id="reviewComment" class="form-control" rows="2" placeholder="Share your experience..."></textarea>
                        </div>
                        <button class="btn btn-primary" onclick="submitReview()">Submit Review</button>
                    </div>
                </div>
            </div>
            
            <div class="col-md-4">
                <div class="card shadow-sm border-0">
                    <div class="card-body">
                        <h5 class="fw-bold mb-3">Instructor</h5>
                        <h6>${course.instructor ? course.instructor.name : 'Unknown'}</h6>
                        <a href="dashboard.html" class="btn btn-outline-primary w-100 mt-3">Go to Dashboard</a>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// ================= Reviews System =================
async function loadReviews() {
    const res = await fetch(`${API_BASE_URL}/courses/${courseId}/reviews`);
    const data = await res.json();
    const container = document.getElementById('reviewsContainer');
    
    if (data.data && data.data.length > 0) {
        let html = '';
        data.data.forEach(r => {
            const canDelete = user.role === 'Admin' || (r.student && r.student._id === user._id);
            const deleteBtn = canDelete ? `<button class="btn btn-sm btn-outline-danger ms-2" onclick="deleteReview('${r._id}')">Delete</button>` : '';

            html += `
                <div class="border-bottom py-2 d-flex justify-content-between align-items-start">
                    <div>
                        <strong>${r.student ? r.student.name : 'Student'}</strong> 
                        <span class="text-warning">${'⭐'.repeat(r.rating)}</span>
                        <p class="mb-0 text-muted small">${r.comment}</p>
                    </div>
                    ${deleteBtn}
                </div>
            `;
        });
        container.innerHTML = html;
    } else {
        container.innerHTML = '<p class="text-muted">No reviews yet.</p>';
    }

    if (user.role === 'Student' && myEnrollment) {
        const hasReviewed = data.data.some(r => r.student && r.student._id === user._id);
        if (myEnrollment.status === 'completed' || myEnrollment.progressPercentage === 100) {
            if (!hasReviewed) document.getElementById('addReviewSection').classList.remove('d-none');
        }
    }
}

async function submitReview() {
    const rating = Number(document.getElementById('reviewRating').value);
    const comment = document.getElementById('reviewComment').value;
    
    const res = await fetch(`${API_BASE_URL}/courses/${courseId}/reviews`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ rating, comment })
    });
    const data = await res.json();
    if (data.success) {
        alert('🎉 Review submitted!');
        location.reload();
    } else {
        alert(data.message); 
    }
}

async function deleteReview(reviewId) {
    if (!confirm('Are you sure you want to delete this review?')) return;
    const res = await fetch(`${API_BASE_URL}/reviews/${reviewId}`, {
        method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    if (data.success) {
        alert('Review deleted!');
        loadReviews(); 
    } else {
        alert(data.message);
    }
}

// ================= Submissions & Grading =================
async function viewSubmissions(assignmentId) {
    document.getElementById('submissionsList').innerHTML = 'Loading...';
    new bootstrap.Modal(document.getElementById('submissionsModal')).show();
    
    const res = await fetch(`${API_BASE_URL}/submissions/assignment/${assignmentId}`, { headers: { 'Authorization': `Bearer ${token}` } });
    const data = await res.json();
    
    if (data.success && data.data.length > 0) {
        let html = '';
        data.data.forEach(sub => {
            html += `
                <div class="card mb-3 shadow-sm">
                    <div class="card-body">
                        <div class="d-flex justify-content-between">
                            <h6 class="fw-bold">Student: ${sub.student.name} (${sub.student.email})</h6>
                            <span class="badge ${sub.status === 'graded' ? 'bg-success' : 'bg-warning text-dark'}">${sub.status}</span>
                        </div>
                        <p class="bg-light p-2 rounded mt-2">${sub.content}</p>
                        <div class="d-flex align-items-center gap-2">
                            <input type="number" class="form-control form-control-sm w-25" id="score-${sub._id}" value="${sub.score !== null ? sub.score : ''}" placeholder="Score">
                            <button class="btn btn-sm btn-success" onclick="gradeSubmission('${sub._id}')">Save Grade</button>
                        </div>
                    </div>
                </div>
            `;
        });
        document.getElementById('submissionsList').innerHTML = html;
    } else {
        document.getElementById('submissionsList').innerHTML = '<p class="text-muted">No submissions yet.</p>';
    }
}

async function gradeSubmission(submissionId) {
    const scoreVal = document.getElementById(`score-${submissionId}`).value;
    if (scoreVal === '') return alert('Please enter a score');
    
    const res = await fetch(`${API_BASE_URL}/submissions/${submissionId}/grade`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ score: Number(scoreVal) })
    });
    const data = await res.json();
    if (data.success) {
        alert('🎉 Graded successfully!');
        viewSubmissions(currentCourse._id); 
    } else {
        alert(data.message);
    }
}

async function submitAssignment(assignmentId) {
    const content = document.getElementById(`sub-${assignmentId}`).value;
    if (!content) return alert('Please write something.');
    const res = await fetch(`${API_BASE_URL}/submissions`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ assignmentId, content }) });
    const data = await res.json();
    if (data.success) { alert('🎉 Submitted successfully!'); loadCourseData(); }
    else alert(data.message);
}

// ================= CRUD Helpers =================
function openCourseModal() {
    document.getElementById('courseTitle').value = currentCourse.title;
    document.getElementById('courseDesc').value = currentCourse.description;
    document.getElementById('courseCategory').value = currentCourse.category;
    document.getElementById('coursePrice').value = currentCourse.price;
    new bootstrap.Modal(document.getElementById('courseModal')).show();
}
document.getElementById('courseForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const res = await fetch(`${API_BASE_URL}/courses/${courseId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ title: document.getElementById('courseTitle').value, description: document.getElementById('courseDesc').value, category: document.getElementById('courseCategory').value, price: Number(document.getElementById('coursePrice').value) }) });
    if ((await res.json()).success) location.reload();
});
async function deleteCourse() {
    if (!confirm('Delete course?')) return;
    const res = await fetch(`${API_BASE_URL}/courses/${courseId}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
    if ((await res.json()).success) window.location.href = 'courses.html';
}
function openLessonModal(id = null, title = '', content = '', order = '', duration = '') {
    document.getElementById('lessonForm').reset(); document.getElementById('editLessonId').value = id || '';
    document.getElementById('lessonTitle').value = title; document.getElementById('lessonContent').value = content;
    document.getElementById('lessonOrder').value = order; document.getElementById('lessonDuration').value = duration;
    new bootstrap.Modal(document.getElementById('lessonModal')).show();
}
document.getElementById('lessonForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('editLessonId').value;
    const url = id ? `${API_BASE_URL}/courses/${courseId}/lessons/${id}` : `${API_BASE_URL}/courses/${courseId}/lessons`;
    const res = await fetch(url, { method: id ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ title: document.getElementById('lessonTitle').value, content: document.getElementById('lessonContent').value, order: Number(document.getElementById('lessonOrder').value), duration: Number(document.getElementById('lessonDuration').value) }) });
    if ((await res.json()).success) location.reload();
});
async function deleteLesson(id) {
    if (!confirm('Delete lesson?')) return;
    const res = await fetch(`${API_BASE_URL}/courses/${courseId}/lessons/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
    if ((await res.json()).success) location.reload();
}
function openAssignModal(id = null, title = '', desc = '', deadline = '', maxScore = '') {
    document.getElementById('assignForm').reset(); document.getElementById('editAssignId').value = id || '';
    document.getElementById('assignTitle').value = title; document.getElementById('assignDesc').value = desc;
    document.getElementById('assignDeadline').value = deadline; document.getElementById('assignMaxScore').value = maxScore;
    new bootstrap.Modal(document.getElementById('assignModal')).show();
}
document.getElementById('assignForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('editAssignId').value;
    const url = id ? `${API_BASE_URL}/courses/${courseId}/assignments/${id}` : `${API_BASE_URL}/courses/${courseId}/assignments`;
    const res = await fetch(url, { method: id ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ title: document.getElementById('assignTitle').value, description: document.getElementById('assignDesc').value, deadline: new Date(document.getElementById('assignDeadline').value).toISOString(), maxScore: Number(document.getElementById('assignMaxScore').value) }) });
    if ((await res.json()).success) location.reload();
    else alert('Error saving assignment');
});
async function deleteAssignment(id) {
    if (!confirm('Delete assignment?')) return;
    const res = await fetch(`${API_BASE_URL}/courses/${courseId}/assignments/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
    if ((await res.json()).success) location.reload();
}
async function markLessonComplete(lessonId, btn) {
    btn.innerText = "..."; btn.disabled = true;
    const res = await fetch(`${API_BASE_URL}/progress/lessons/complete`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ lessonId }) });
    if ((await res.json()).success) { btn.innerText = "Completed ✅"; btn.classList.replace('btn-outline-success', 'btn-success'); }
    else { btn.innerText = "Error"; btn.disabled = false; }
}

loadCourseData();