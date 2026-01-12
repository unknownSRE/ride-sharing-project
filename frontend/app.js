let currentUser = null;
// const API_BASE = "http://localhost:3000/api"; // Adjust to your backend port
// Inside frontend/app.js
const API_BASE = "http://localhost:3000/api"; 
const GQL_URL = "http://localhost:3000/graphql";

/** * UI TOGGLES
 */
function toggleDriverFields() {
    const role = document.getElementById('regRole').value;
    const driverDiv = document.getElementById('driverOnlyFields');
    if (role === 'driver') {
        driverDiv.classList.remove('hidden');
    } else {
        driverDiv.classList.add('hidden');
    }
}

function openModal(id) { document.getElementById(id).style.display = 'block'; }
function closeModal(id) { document.getElementById(id).style.display = 'none'; }

/**
 * SERVICE GUARDS
 */
function guardAction(actionCallback) {
    if (!currentUser) {
        alert("Action Required: Please Login or Register to access SwiftRide services!");
        openModal('registerModal');
    } else {
        actionCallback();
    }
}

/**
 * AUTHENTICATION (REST)
 */
document.getElementById('regForm').onsubmit = async (e) => {
    e.preventDefault();

    const fullName = document.getElementById('regName').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const phone = document.getElementById('regPhone').value.trim();
    const password = document.getElementById('regPass').value;
    const role = document.getElementById('regRole').value;
    const license = document.getElementById('regLicense').value.trim();

    // VALIDATIONS
    if (!fullName || !email) return alert("Name and Email are required.");
    
    // Phone Validation: Exactly 10 digits
    if (!/^\d{10}$/.test(phone)) {
        return alert("Validation Error: Phone number must be exactly 10 digits.");
    }

    // Password Validation: Minimum 6 characters
    if (password.length < 6) {
        return alert("Validation Error: Password must be at least 6 characters long.");
    }

    // Driver Specific Validation
    if (role === 'driver' && !license) {
        return alert("Drivers must provide a license number.");
    }

    const payload = { 
        full_name: fullName, email, phone, password, role, 
        license_number: role === 'driver' ? license : null 
    };

    try {
        const response = await fetch(`${API_BASE}/users/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        if (response.ok) {
            currentUser = data.user;
            updateUI(data.user);
            closeModal('registerModal');
            alert(`Welcome to SwiftRide, ${data.user.full_name}!`);
        } else {
            alert(data.message || "Registration failed.");
        }
    } catch (err) {
        alert("Error: Could not connect to the registration service.");
    }
};

function updateUI(user) {
    document.getElementById('auth-section').classList.add('hidden');
    const userDiv = document.getElementById('user-display');
    userDiv.classList.remove('hidden');
    document.getElementById('welcomeText').innerText = `Hello, ${user.full_name}`;
    document.getElementById('liveFeed').innerHTML = `<p>Connected as ${user.role.toUpperCase()}. Systems ready.</p>`;
}

function logout() { location.reload(); }

/**
 * DYNAMIC SERVICES
 */
async function requestRide() {
    const pickup = document.getElementById('pickup').value;
    const dropoff = document.getElementById('dropoff').value;
    if(!pickup || !dropoff) return alert("Please enter pickup and dropoff points.");

    const res = await fetch(`${API_BASE}/rides/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            rider_id: currentUser.user_id, 
            pickup_location: pickup, 
            drop_location: dropoff 
        })
    });

    if(res.ok) alert("Ride request broadcasted to SwiftRide drivers!");
}

function openVehicleReg() {
    if (currentUser.role !== 'driver') {
        return alert("Vehicle registration is for driver accounts only.");
    }
    // This would typically trigger the GraphQL mutation 'registerVehicle'
    alert("GraphQL Service: Redirecting to Vehicle Registration Portal...");
}

function showPayments() {
    // This would typically trigger the SOAP 'PaymentService' query
    alert("SOAP Gateway: Fetching secure transaction history...");
}

function showRatings() {
    // This would typically trigger the GraphQL 'getRatingsByUser' query
    alert("GraphQL Service: Loading community feedback...");
}