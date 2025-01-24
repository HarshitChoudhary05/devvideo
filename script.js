// script.js

let userInfo = null; // To store authenticated user information

// Handle Google Sign-In Callback
function handleGoogleSignIn(response) {
  const token = response.credential;
  const decodedToken = parseJwt(token);

  // Extract user information
  userInfo = {
    name: decodedToken.name,
    email: decodedToken.email,
  };

  // Hide authentication section and show meeting controls
  document.getElementById("auth-section").style.display = "none";
  document.getElementById("meeting-controls").style.display = "block";

  alert(`Welcome, ${userInfo.name}!`);
}

// Parse JWT Token (to decode Google ID token)
function parseJwt(token) {
  const base64Url = token.split(".")[1];
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split("")
      .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
      .join("")
  );
  return JSON.parse(jsonPayload);
}

// Start Meeting
document.getElementById("start-meeting").addEventListener("click", function () {
  const roomName = document.getElementById("meeting-room").value.trim() || `room-${Math.random().toString(36).substr(2, 8)}`;
  
  if (!userInfo) {
    alert("You need to log in first!");
    return;
  }

  // Shareable URL
  const domain = "meet.jit.si";
  const shareableURL = `https://${domain}/${roomName}`;
  const jitsiContainer = document.getElementById("jitsi-container");
  jitsiContainer.innerHTML = ""; // Clear previous meeting

  // Display the shareable link
  const shareLinkContainer = document.getElementById("share-link-container");
  shareLinkContainer.innerHTML = `
    <p><strong>Share this link to invite others:</strong></p>
    <input type="text" value="${shareableURL}" readonly id="share-link">
    <button id="copy-link">Copy Link</button>
  `;

  // Copy to clipboard
  document.getElementById("copy-link").addEventListener("click", function () {
    const shareLinkInput = document.getElementById("share-link");
    shareLinkInput.select();
    document.execCommand("copy");
    alert("Meeting link copied to clipboard!");
  });

  // Jitsi API Options
  const options = {
    roomName: roomName,
    parentNode: jitsiContainer,
    userInfo: {
      displayName: userInfo.name, // Pass authenticated user's name
      email: userInfo.email, // Optionally pass email
    },
    configOverwrite: {
      prejoinPageEnabled: false,
    },
    interfaceConfigOverwrite: {
      SHOW_JITSI_WATERMARK: false,
      TOOLBAR_BUTTONS: [
        "microphone",
        "camera",
        "desktop",
        "fullscreen",
        "hangup",
        "chat",
        "raisehand",
        "tileview",
      ],
    },
  };

  // Initialize Jitsi Meet
  const api = new JitsiMeetExternalAPI(domain, options);

  // Handle meeting end
  api.addEventListener("readyToClose", () => {
    alert("Meeting has ended.");
    jitsiContainer.innerHTML = ""; // Clear meeting
  });
});
