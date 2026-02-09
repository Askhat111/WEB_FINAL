document.addEventListener('DOMContentLoaded', async function() {
  await loadProfile();
  setupForm();
});

async function loadProfile() {
  try {
    const profile = await API.get('/api/users/profile');
    
    document.getElementById('profileInfo').innerHTML = `
      <div style="background: #f9fafb; padding: 15px; border-radius: 10px; margin: 10px 0;">
        <div><strong>Username:</strong> ${profile.username}</div>
        <div><strong>Email:</strong> ${profile.email}</div>
        <div><strong>Role:</strong> ${profile.role}</div>
      </div>
    `;
    
    //fill in with current data
    document.getElementById('username').value = profile.username;
    document.getElementById('email').value = profile.email;
    
  } catch (err) {
    setToast('Failed to load profile: ' + err.message, 'bad');
  }
}

function setupForm() {
  const form = document.getElementById('profileForm');
  const cancelBtn = document.getElementById('cancelBtn');
  
  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value.trim();
    const email = document.getElementById('email').value.trim();
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    //validation
    if (newPassword && newPassword.length < 6) {
      setToast('New password must be at least 6 characters', 'bad');
      return;
    }
    
    if (newPassword && newPassword !== confirmPassword) {
      setToast('New passwords do not match', 'bad');
      return;
    }
    
    //data to send
    const updateData = {};
    if (username) updateData.username = username;
    if (email) updateData.email = email;
    if (currentPassword && newPassword) {
      updateData.currentPassword = currentPassword;
      updateData.newPassword = newPassword;
    }
    
    if (Object.keys(updateData).length === 0) {
      setToast('No changes to update', 'bad');
      return;
    }
    
    try {
      const result = await API.put('/api/users/profile', updateData);
      
      setToast('Profile updated successfully!', 'ok');
      
      //clear
      document.getElementById('currentPassword').value = '';
      document.getElementById('newPassword').value = '';
      document.getElementById('confirmPassword').value = '';
      
      //update
      await loadProfile();
      
    } catch (err) {
      setToast('Update failed: ' + err.message, 'bad');
    }
  });
  
  cancelBtn.addEventListener('click', function() {
    document.getElementById('currentPassword').value = '';
    document.getElementById('newPassword').value = '';
    document.getElementById('confirmPassword').value = '';
    loadProfile(); 
    setToast('Changes cancelled', 'ok');
  });
}