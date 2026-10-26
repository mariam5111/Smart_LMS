const API_BASE_URL = 'http://localhost:5000/api';
const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user'));

if (!token || !user) window.location.href = 'index.html';

document.getElementById('profileBio').value = user.bio || '';
document.getElementById('profileExpertise').value = user.expertise ? user.expertise.join(', ') : '';
document.getElementById('profileExperience').value = user.yearsOfExperience || 0;

document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'index.html';
});

document.getElementById('profileForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const bio = document.getElementById('profileBio').value;
    const expertiseString = document.getElementById('profileExpertise').value;
    const yearsOfExperience = Number(document.getElementById('profileExperience').value);

    const expertise = expertiseString.split(',').map(item => item.trim()).filter(item => item !== '');

    try {
        const response = await fetch(`${API_BASE_URL}/users/profile`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ bio, expertise, yearsOfExperience })
        });

        const data = await response.json();

        if (data.success) {
            alert('🎉 Profile updated successfully!');
            user.bio = bio;
            user.expertise = expertise;
            user.yearsOfExperience = yearsOfExperience;
            localStorage.setItem('user', JSON.stringify(user));
        } else {
            alert(`⚠️ ${data.message}`);
        }
    } catch (error) {
        alert('Network error.');
    }
});