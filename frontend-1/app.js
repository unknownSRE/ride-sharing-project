let currentUser = null;
let refreshInterval = null;
const API_BASE = "http://localhost:3000/api";
const GQL_URL = "http://localhost:3000/graphql";
const SOAP_URL = "http://localhost:3000/soap/payment";

function toggleDriverFields() {
  const role = document.getElementById("regRole").value;
  document
    .getElementById("driverOnlyFields")
    .classList.toggle("hidden", role !== "driver");
}

function openModal(id) {
  document.getElementById(id).style.display = "block";
}

function closeModal(id) {
  document.getElementById(id).style.display = "none";
}

function showNotification(message, type = "info") {
  alert(message);
}

async function apiFetch(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, options);
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Request failed");
    return data;
  } catch (err) {
    showNotification(`Error: ${err.message}`, "error");
    console.error(err);
    throw err;
  }
}

async function gqlFetch(query, variables) {
  try {
    const response = await fetch(GQL_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, variables }),
    });
    const result = await response.json();
    if (result.errors) throw new Error(result.errors[0].message);
    return result.data;
  } catch (err) {
    showNotification(`Error: ${err.message}`, "error");
    console.error(err);
    throw err;
  }
}

async function soapFetch(envelope, action) {
  try {
    const response = await fetch(SOAP_URL, {
      method: "POST",
      headers: {
        "Content-Type": "text/xml; charset=utf-8",
        SOAPAction: action,
      },
      body: envelope,
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.text();
  } catch (err) {
    showNotification(`Error: ${err.message}`, "error");
    console.error(err);
    throw err;
  }
}

document.getElementById("regForm").onsubmit = async (e) => {
  e.preventDefault();
  const fullName = document.getElementById("regName").value.trim();
  const email = document.getElementById("regEmail").value.trim();
  const phone = document.getElementById("regPhone").value.trim();
  const password = document.getElementById("regPass").value;
  const role = document.getElementById("regRole").value;
  const license = document.getElementById("regLicense").value.trim();

  if (!fullName || !email)
    return showNotification("Name and Email are required.", "error");
  if (!/^\d{10}$/.test(phone))
    return showNotification("Phone number must be exactly 10 digits.", "error");
  if (password.length < 6)
    return showNotification("Password must be at least 6 characters.", "error");
  if (role === "driver" && !license)
    return showNotification("Drivers must provide a license number.", "error");

  const payload = {
    full_name: fullName,
    email,
    phone,
    password,
    role,
    license_number: role === "driver" ? license : null,
  };

  try {
    const data = await apiFetch("/users/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    currentUser = data.user;
    updateUI(data.user);
    closeModal("registerModal");
    showNotification(
      `Welcome to SwiftRide, ${data.user.full_name}!`,
      "success"
    );
    document.getElementById("regForm").reset();
  } catch {}
};

async function handleLogin() {
  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPass").value;
  if (!email || !password)
    return showNotification("Please enter email and password.", "error");

  try {
    const data = await apiFetch("/users/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    currentUser = data.user;
    updateUI(data.user);
    closeModal("loginModal");
    showNotification(`Welcome back, ${data.user.full_name}!`, "success");
    document.getElementById("loginEmail").value = "";
    document.getElementById("loginPass").value = "";
  } catch {}
}

function updateUI(user) {
  document.getElementById("auth-section").classList.add("hidden");
  document.getElementById("user-display").classList.remove("hidden");
  document.getElementById(
    "welcomeText"
  ).innerText = `Hello, ${user.full_name} (${user.role})`;
  document.getElementById("guestView").style.display = "none";
  document.getElementById("commonSections").classList.remove("hidden");

  if (user.role === "rider") {
    document.getElementById("riderDashboard").classList.remove("hidden");
    document.getElementById("driverDashboard").classList.add("hidden");
    loadMyRides();
    refreshInterval = setInterval(loadMyRides, 10000);
  } else if (user.role === "driver") {
    document.getElementById("driverDashboard").classList.remove("hidden");
    document.getElementById("riderDashboard").classList.add("hidden");
    loadAvailableRides();
    loadMyAcceptedRides();
    refreshInterval = setInterval(() => {
      loadAvailableRides();
      loadMyAcceptedRides();
    }, 10000);
  }
}

function logout() {
  currentUser = null;
  if (refreshInterval) clearInterval(refreshInterval);
  location.reload();
}

async function requestRide() {
  const pickup = document.getElementById("pickup").value.trim();
  const dropoff = document.getElementById("dropoff").value.trim();
  if (!pickup || !dropoff)
    return showNotification(
      "Please enter both pickup and drop locations.",
      "error"
    );

  try {
    const data = await apiFetch("/rides/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        rider_id: currentUser.user_id,
        pickup_location: pickup,
        drop_location: dropoff,
      }),
    });
    showNotification(
      `Ride requested successfully! Fare: ${data.ride_details.calculated_fare}`,
      "success"
    );
    document.getElementById("pickup").value = "";
    document.getElementById("dropoff").value = "";
    loadMyRides();
  } catch {}
}

async function loadMyRides() {
  if (!currentUser) return;
  try {
    const rides = await apiFetch("/rides");
    const myRides = rides.filter((r) => r.rider_id === currentUser.user_id);
    const container = document.getElementById("myRidesContainer");
    const activeFeed = document.getElementById("riderActiveFeed");

    if (myRides.length === 0) {
      container.innerHTML = '<p class="text-muted">No rides yet.</p>';
      activeFeed.innerHTML = '<p class="text-muted">No active rides.</p>';
      return;
    }

    container.innerHTML = myRides
      .map(
        (ride) => `
      <div class="ride-item ${ride.status}">
        <div class="ride-header">
          <span class="ride-id">Ride #${ride.ride_id}</span>
          <span class="badge ${ride.status}">${ride.status.toUpperCase()}</span>
        </div>
        <div class="ride-details">
          <p><i class="fas fa-map-marker-alt"></i> <strong>From:</strong> ${
            ride.pickup_location
          }</p>
          <p><i class="fas fa-map-marker-alt"></i> <strong>To:</strong> ${
            ride.drop_location
          }</p>
          <p><i class="fas fa-rupee-sign"></i> <strong>Fare:</strong> ₹${
            ride.fare || "N/A"
          }</p>
          ${
            ride.driver_id
              ? `<p><i class="fas fa-user"></i> <strong>Driver ID:</strong> ${ride.driver_id}</p>`
              : ""
          }
        </div>
        ${
          ride.status === "requested"
            ? `<button class="btn-sm btn-danger" onclick="cancelRide(${ride.ride_id})">Cancel</button>`
            : ""
        }
        ${
          ride.status === "ongoing"
            ? `<p class="text-info"><i class="fas fa-spinner fa-spin"></i> Ride in progress...</p>`
            : ""
        }
      </div>
    `
      )
      .join("");

    const activeRides = myRides.filter((r) =>
      ["requested", "ongoing"].includes(r.status)
    );
    activeFeed.innerHTML =
      activeRides.length > 0
        ? activeRides
            .map(
              (ride) => `
      <div class="feed-item">
        <strong>Ride #${
          ride.ride_id
        }</strong> - ${ride.status.toUpperCase()}<br>
        ${ride.pickup_location} → ${ride.drop_location}
      </div>
    `
            )
            .join("")
        : '<p class="text-muted">No active rides.</p>';
  } catch (err) {
    console.error("Error loading rides:", err);
  }
}

async function loadAvailableRides() {
  if (!currentUser || currentUser.role !== "driver") return;
  try {
    const rides = await apiFetch("/rides");
    const availableRides = rides.filter((r) => r.status === "requested");
    const container = document.getElementById("availableRidesContainer");

    container.innerHTML =
      availableRides.length === 0
        ? '<p class="text-muted">No available rides at the moment.</p>'
        : availableRides
            .map(
              (ride) => `
      <div class="ride-item available">
        <div class="ride-header">
          <span class="ride-id">Ride #${ride.ride_id}</span>
          <span class="badge requested">AVAILABLE</span>
        </div>
        <div class="ride-details">
          <p><i class="fas fa-user"></i> <strong>Rider ID:</strong> ${
            ride.rider_id
          }</p>
          <p><i class="fas fa-map-marker-alt"></i> <strong>From:</strong> ${
            ride.pickup_location
          }</p>
          <p><i class="fas fa-map-marker-alt"></i> <strong>To:</strong> ${
            ride.drop_location
          }</p>
          <p><i class="fas fa-rupee-sign"></i> <strong>Fare:</strong> ₹${
            ride.fare || "N/A"
          }</p>
        </div>
        <button class="btn-sm btn-accent" onclick="acceptRide(${ride.ride_id})">
          <i class="fas fa-check"></i> Accept Ride
        </button>
      </div>
    `
            )
            .join("");
  } catch (err) {
    console.error("Error loading available rides:", err);
  }
}

async function loadMyAcceptedRides() {
  if (!currentUser || currentUser.role !== "driver") return;
  try {
    const rides = await apiFetch("/rides");
    const myRides = rides.filter((r) => r.driver_id === currentUser.user_id);
    const activeFeed = document.getElementById("driverActiveFeed");

    activeFeed.innerHTML =
      myRides.length === 0
        ? '<p class="text-muted">No accepted rides yet.</p>'
        : myRides
            .map(
              (ride) => `
      <div class="ride-item ${ride.status}">
        <div class="ride-header">
          <span class="ride-id">Ride #${ride.ride_id}</span>
          <span class="badge ${ride.status}">${ride.status.toUpperCase()}</span>
        </div>
        <div class="ride-details">
          <p><i class="fas fa-user"></i> <strong>Rider ID:</strong> ${
            ride.rider_id
          }</p>
          <p><i class="fas fa-map-marker-alt"></i> <strong>Route:</strong> ${
            ride.pickup_location
          } → ${ride.drop_location}</p>
          <p><i class="fas fa-rupee-sign"></i> <strong>Fare:</strong> ₹${
            ride.fare || "N/A"
          }</p>
        </div>
        ${
          ride.status === "ongoing"
            ? `<button class="btn-sm btn-success" onclick="completeRide(${ride.ride_id})"><i class="fas fa-check-circle"></i> Complete Ride</button>`
            : ""
        }
        ${
          ride.status === "ongoing"
            ? `<button class="btn-sm btn-danger" onclick="cancelRide(${ride.ride_id})">Cancel</button>`
            : ""
        }
      </div>
    `
            )
            .join("");
  } catch (err) {
    console.error("Error loading accepted rides:", err);
  }
}

async function acceptRide(rideId) {
  if (!currentUser || currentUser.role !== "driver") return;
  try {
    await apiFetch(`/rides/accept/${rideId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ driver_id: currentUser.user_id }),
    });
    showNotification("Ride accepted successfully!", "success");
    loadAvailableRides();
    loadMyAcceptedRides();
  } catch {}
}

async function completeRide(rideId) {
  try {
    await apiFetch(`/rides/complete/${rideId}`, { method: "PUT" });
    showNotification("Ride completed successfully!", "success");
    if (currentUser.role === "driver") loadMyAcceptedRides();
    else loadMyRides();
  } catch {}
}

async function cancelRide(rideId) {
  if (!confirm("Are you sure you want to cancel this ride?")) return;
  try {
    await apiFetch(`/rides/cancel/${rideId}`, { method: "PUT" });
    showNotification("Ride cancelled.", "info");
    if (currentUser.role === "driver") loadMyAcceptedRides();
    else loadMyRides();
  } catch {}
}

async function viewAllRides() {
  try {
    const rides = await apiFetch("/rides");
    const container = document.getElementById("allRidesContainer");
    container.innerHTML =
      rides.length === 0
        ? '<p class="text-muted">No rides found.</p>'
        : `
      <table class="data-table">
        <thead>
          <tr>
            <th>Ride ID</th>
            <th>Rider ID</th>
            <th>Driver ID</th>
            <th>Pickup</th>
            <th>Drop</th>
            <th>Fare</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${rides
            .map(
              (r) => `
            <tr>
              <td>${r.ride_id}</td>
              <td>${r.rider_id}</td>
              <td>${r.driver_id || "N/A"}</td>
              <td>${r.pickup_location}</td>
              <td>${r.drop_location}</td>
              <td>₹${r.fare || "N/A"}</td>
              <td><span class="badge ${r.status}">${r.status}</span></td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>
    `;
    openModal("allRidesModal");
  } catch {}
}

function openVehicleRegistration() {
  if (!currentUser || currentUser.role !== "driver")
    return showNotification("Only drivers can register vehicles.", "error");
  openModal("vehicleModal");
}

document.getElementById("vehicleForm").onsubmit = async (e) => {
  e.preventDefault();
  const make = document.getElementById("vehicleMake").value.trim();
  const model = document.getElementById("vehicleModel").value.trim();
  const plate = document.getElementById("vehiclePlate").value.trim();
  const color = document.getElementById("vehicleColor").value.trim();
  const year = document.getElementById("vehicleYear").value;

  if (!make || !model || !plate)
    return showNotification(
      "Make, Model, and Plate Number are required.",
      "error"
    );

  const mutation = `
    mutation RegisterVehicle($input: VehicleInput!) {
      registerVehicle(input: $input) {
        vehicle_id make model plate_number color year
      }
    }
  `;
  const variables = {
    input: {
      driver_id: currentUser.user_id,
      make,
      model,
      plate_number: plate,
      color: color || null,
      year: year ? parseInt(year) : null,
    },
  };

  try {
    await gqlFetch(mutation, variables);
    showNotification("Vehicle registered successfully!", "success");
    closeModal("vehicleModal");
    document.getElementById("vehicleForm").reset();
    loadMyVehicle();
  } catch {}
};

async function loadMyVehicle() {
  if (!currentUser || currentUser.role !== "driver") return;
  const query = `
    query GetVehicleByDriver($driver_id: Int!) {
      getVehicleByDriver(driver_id: $driver_id) {
        vehicle_id make model plate_number color year
      }
    }
  `;
  const variables = { driver_id: currentUser.user_id };

  try {
    const data = await gqlFetch(query, variables);
    const container = document.getElementById("vehicleInfo");
    const v = data.getVehicleByDriver;
    container.innerHTML = v
      ? `
      <div class="info-card">
        <h4><i class="fas fa-car"></i> Your Vehicle</h4>
        <p><strong>Make:</strong> ${v.make}</p>
        <p><strong>Model:</strong> ${v.model}</p>
        <p><strong>Plate:</strong> ${v.plate_number}</p>
        <p><strong>Color:</strong> ${v.color || "N/A"}</p>
        <p><strong>Year:</strong> ${v.year || "N/A"}</p>
      </div>
    `
      : '<p class="text-muted">No vehicle registered yet.</p>';
  } catch (err) {
    console.error("Error loading vehicle:", err);
  }
}

function openPaymentModal() {
  if (!currentUser) return;
  openModal("paymentModal");
}

document.getElementById("paymentForm").onsubmit = async (e) => {
  e.preventDefault();
  const rideId = document.getElementById("paymentRideId").value;
  const amount = document.getElementById("paymentAmount").value;
  const method = document.getElementById("paymentMethod").value;

  if (!rideId || !amount || !method)
    return showNotification("All fields are required.", "error");

  const envelope = `<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tns="http://localhost:3000/soap/payment">
  <soap:Body>
    <tns:createPaymentRequest>
      <tns:ride_id>${rideId}</tns:ride_id>
      <tns:amount>${amount}</tns:amount>
      <tns:method>${method}</tns:method>
    </tns:createPaymentRequest>
  </soap:Body>
</soap:Envelope>`;

  try {
    const xmlText = await soapFetch(envelope, "createPaymentRequest");
    console.log("SOAP Response:", xmlText);

    if (xmlText.includes("SUCCESS") || xmlText.includes("completed")) {
      showNotification("Payment processed successfully!", "success");
      closeModal("paymentModal");
      document.getElementById("paymentForm").reset();
    } else if (xmlText.includes("Fault") || xmlText.includes("Error")) {
      const errorMatch = xmlText.match(/<faultstring>(.*?)<\/faultstring>/i);
      showNotification(
        `Payment failed: ${
          errorMatch ? errorMatch[1] : "Payment processing failed"
        }`,
        "error"
      );
    } else {
      showNotification(
        "Payment response unclear. Check console for details.",
        "warning"
      );
    }
  } catch {}
};

function openRatingModal() {
  if (!currentUser) return;
  openModal("ratingModal");
}

document.getElementById("ratingForm").onsubmit = async (e) => {
  e.preventDefault();
  const rideId = document.getElementById("ratingRideId").value;
  const givenTo = document.getElementById("ratingGivenTo").value;
  const score = document.getElementById("ratingScore").value;
  const comment = document.getElementById("ratingComment").value.trim();

  if (!rideId || !givenTo || !score)
    return showNotification(
      "Ride ID, User ID, and Rating are required.",
      "error"
    );

  const mutation = `
    mutation AddRating($input: RatingInput!) {
      addRating(input: $input) {
        rating_id ride_id score comment
      }
    }
  `;
  const variables = {
    input: {
      ride_id: parseInt(rideId),
      given_by: currentUser.user_id,
      given_to: parseInt(givenTo),
      score: parseInt(score),
      comment: comment || null,
    },
  };

  try {
    await gqlFetch(mutation, variables);
    showNotification("Rating submitted successfully!", "success");
    closeModal("ratingModal");
    document.getElementById("ratingForm").reset();
  } catch {}
};

async function viewMyRatings() {
  if (!currentUser) return;
  const query = `
    query GetRatingsByUser($user_id: Int!) {
      getRatingsByUser(user_id: $user_id) {
        rating_id ride_id given_by score comment
      }
    }
  `;
  const variables = { user_id: currentUser.user_id };

  try {
    const data = await gqlFetch(query, variables);
    const ratings = data.getRatingsByUser;
    const container = document.getElementById("ratingsViewContainer");
    container.innerHTML =
      ratings && ratings.length > 0
        ? ratings
            .map(
              (r) => `
      <div class="rating-item">
        <div class="rating-header">
          <span class="rating-stars">${"⭐".repeat(r.score)}</span>
          <span class="text-muted">Ride #${r.ride_id}</span>
        </div>
        <p><strong>From User ID:</strong> ${r.given_by}</p>
        <p><strong>Comment:</strong> ${r.comment || "No comment"}</p>
      </div>
    `
            )
            .join("")
        : '<p class="text-muted">No ratings received yet.</p>';
    openModal("ratingsViewModal");
  } catch {}
}
