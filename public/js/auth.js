async function handleLogin(e) {
    e.preventDefault();
    console.log('Login form submitted');
    
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    
    try {
        const data = await API.post("/api/auth/login", { email, password });
        console.log("Login response:", data);
        
        if (data.success) {
            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));
            
            setToast("Login successful!", "ok");
            
            setTimeout(() => {
                window.location.href = "/menu";
            }, 500);
        } else {
            setToast("Error: " + data.error, "bad");
        }
    } catch (err) {
        console.error("Login error:", err);
        setToast("Login failed: " + err.message, "bad");
    }
}

async function handleRegister(e) {
    e.preventDefault();
    console.log('Register form submitted');
    
    const username = document.getElementById("username").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    
    try {
        const data = await API.post("/api/auth/register", { username, email, password });
        console.log("Register response:", data);
        
        if (data.success) {
            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));
            
            setToast("Registration successful!", "ok");
            
            setTimeout(() => {
                window.location.href = "/menu";
            }, 500);
        } else {
            setToast("Error: " + data.error, "bad");
        }
    } catch (err) {
        console.error("Register error:", err);
        setToast("Registration failed: " + err.message, "bad");
    }
}

document.addEventListener("DOMContentLoaded", function() {
    console.log("Auth.js loaded");
    
    const loginForm = document.getElementById("loginForm");
    const registerForm = document.getElementById("registerForm");
    
    if (loginForm) {
        console.log("Found login form, attaching handler");
        loginForm.addEventListener("submit", handleLogin);
    }
    
    if (registerForm) {
        console.log("Found register form, attaching handler");
        registerForm.addEventListener("submit", handleRegister);
    }
});