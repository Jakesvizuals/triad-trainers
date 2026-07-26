const SUPABASE_URL = "https://qjhhhbibkqmyojkggujw.supabase.co";
const SUPABASE_KEY = "sb_publishable_4mJ3ro8tiacXTyyUoCQ_fQ_szs9pXqL";
const supabaseClient = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY) : null;
const boot = document.getElementById("bootScreen");
const sidebar = document.getElementById("sidebar");
const menuButton = document.getElementById("menuButton");
const hostRaidButton = document.getElementById("hostRaidButton");
const raidForm = document.getElementById("raidForm");
const raidBoss = document.getElementById("raidBoss");
const raidLocation = document.getElementById("raidLocation");
const raidStartTime = document.getElementById("raidStartTime");
const raidEndTime = document.getElementById("raidEndTime");
const submitRaidButton = document.getElementById("submitRaidButton");
const raidList = document.querySelector(".raid-list");
const authEmail = document.getElementById("authEmail");
const authPassword = document.getElementById("authPassword");
const playerCode = document.getElementById("playerCode");
const ageVerification = document.getElementById("ageVerification");
const chatAccess = document.getElementById("chatAccess");
const termsAccepted = document.getElementById("termsAccepted");
const signUpButton = document.getElementById("signUpButton");
const signInButton = document.getElementById("signInButton");
const signOutButton = document.getElementById("signOutButton");
const authStatus = document.getElementById("authStatus");
const trainerLabel = document.getElementById("trainerLabel");
const trainerMeta = document.getElementById("trainerMeta");
const ownerBadge = document.getElementById("ownerBadge");
const adminBackstageLink = document.getElementById("adminBackstageLink");
const communitySafetyLink = document.getElementById("communitySafetyLink");
const safetyPage = document.getElementById("safetyPage");
const adminPage = document.getElementById("adminPage");
const editSiteButton = document.getElementById("editSiteButton");
const editorToolbar = document.getElementById("editorToolbar");
const backgroundColorPicker = document.getElementById("backgroundColorPicker");
const saveLayoutButton = document.getElementById("saveLayoutButton");
const adminEditLayoutButton = document.getElementById("adminEditLayoutButton");
const sidebarOnlineCount = document.getElementById("onlineCount");
const statOnlineCount = document.getElementById("statOnlineCount");
const onlineTrainerList = document.getElementById("onlineTrainerList");

const OWNER_EMAIL = "jacobortegapro@gmail.com";
const STORAGE_KEYS = {
  profile: "triadUserProfile",
  moderation: "triadModerationState",
  schedule: "triadScheduleEvents",
  shiny: "triadShinySightings",
  trade: "triadTradePosts",
  hundo: "triadHundoReports",
  admins: "triadAdminEmails",
  layout: "triadPanelLayout",
  background: "triadSiteBackground",
  online: "triadOnlineTrainers"
};

const toastContainer = document.createElement("div");
toastContainer.id = "toastContainer";
document.body.appendChild(toastContainer);

function showToast(message, type = "info") {
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = message;
  toastContainer.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add("show"));
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 220);
  }, 2600);
}

function getStoredJSON(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key) || "null") ?? fallback;
  } catch {
    return fallback;
  }
}

function saveStoredJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function getOnlineTrainers() {
  const list = getStoredJSON(STORAGE_KEYS.online, []);
  return Array.isArray(list) ? list.filter(entry => entry?.email) : [];
}

function saveOnlineTrainers(list) {
  saveStoredJSON(STORAGE_KEYS.online, list);
}

function setOnlineStatus(profile, isOnline) {
  const email = String(profile?.email || "").trim().toLowerCase();
  if (!email) return;
  const nextList = getOnlineTrainers().filter(entry => entry.email !== email);
  if (isOnline) {
    nextList.push({
      email,
      label: profile?.playerCode || profile?.email || "Trainer",
      joinedAt: Date.now()
    });
  }
  saveOnlineTrainers(nextList);
  renderOnlineRoster();
}

function renderOnlineRoster() {
  const list = getOnlineTrainers();
  const count = list.length;
  if (sidebarOnlineCount) sidebarOnlineCount.textContent = `${count} online`;
  if (statOnlineCount) statOnlineCount.textContent = `${count}`;
  if (onlineTrainerList) {
    if (!count) {
      onlineTrainerList.innerHTML = '<li>No trainers signed in</li>';
      return;
    }
    onlineTrainerList.innerHTML = list.map(entry => `<li>${entry.label}</li>`).join("");
  }
}

function getUserProfile() {
  return getStoredJSON(STORAGE_KEYS.profile, null);
}

function setUserProfile(profile) {
  saveStoredJSON(STORAGE_KEYS.profile, profile);
}

function clearUserProfile() {
  localStorage.removeItem(STORAGE_KEYS.profile);
}

function isOwnerEmail(email) {
  return String(email || "").trim().toLowerCase() === OWNER_EMAIL;

}

function getAdminEmails() {
  const fromStorage = getStoredJSON(STORAGE_KEYS.admins, []);
  return Array.from(new Set([OWNER_EMAIL, ...fromStorage.filter(Boolean)]));
}

function saveAdminEmails(list) {
  saveStoredJSON(STORAGE_KEYS.admins, list);
}

function isAdminProfile(profile, email = "") {
  const normalizedEmail = String(
    email || profile?.email || ""
  ).trim().toLowerCase();

  return isOwnerEmail(normalizedEmail);
}

function applyAdminProfile(profile, email) {
  if (!profile) return null;

  const normalizedEmail = String(
    email || profile.email || ""
  ).trim().toLowerCase();

  const isOwner = isOwnerEmail(normalizedEmail);

  profile.email = normalizedEmail;
  profile.isAdmin = isOwner;
  profile.isOwner = isOwner;
  profile.hasFullAccess = isOwner;
  profile.chatAccess = isOwner
    ? "adult"
    : profile.chatAccess || "general";

  return profile;
}

function updateOwnerUI(profile) {
  const isAdmin = isAdminProfile(profile, profile?.email || "", "");
  if (trainerLabel) trainerLabel.textContent = isAdmin ? "Welcome, Owner" : "Welcome, Trainer";
  if (trainerMeta) trainerMeta.textContent = isAdmin ? "Owner • Full access to all chats" : "Triad Region • Level 42";
  if (ownerBadge) ownerBadge.hidden = !isAdmin;
  if (adminBackstageLink) adminBackstageLink.hidden = !isAdmin;
  if (communitySafetyLink) communitySafetyLink.hidden = false;
  if (editSiteButton) editSiteButton.hidden = !isAdmin;
  if (adminEditLayoutButton) adminEditLayoutButton.hidden = !isAdmin;
  if (adminPage) adminPage.hidden = !isAdmin;
  if (!isAdmin && window.location.hash === "#admin-backstage") {
    window.location.hash = "#home";
  }
}

function getModerationState() {
  return getStoredJSON(STORAGE_KEYS.moderation, { reports: [], blockedUsers: [], warnings: [] });
}

function saveModerationState(state) {
  saveStoredJSON(STORAGE_KEYS.moderation, state);
}

function renderAdminReports() {
  const list = document.querySelector(".report-list");
  if (!list) return;
  const state = getModerationState();
  if (!state.reports.length) {
    list.innerHTML = '<div class="report-row"><strong>No active reports</strong><span>All clear for now.</span></div>';
    return;
  }
  list.innerHTML = state.reports.map(report => `
    <div class="report-row">
      <strong>${report.title}</strong>
      <span>${report.detail}</span>
    </div>
  `).join("");
}

function getLoungeLabel() {
  if (!ageVerification || !chatAccess) return "General GO Lounge";
  if (ageVerification.value === "adult") return "Adults-only lounge";
  if (ageVerification.value === "minor") return "Kid-safe lounge";
  return chatAccess.value === "adult" ? "Adults-only lounge" : chatAccess.value === "kid" ? "Kid-safe lounge" : "General GO Lounge";
}

function applyDefaultLounge() {
  if (!ageVerification || !chatAccess) return;
  if (ageVerification.value === "adult") chatAccess.value = "adult";
  else if (ageVerification.value === "minor") chatAccess.value = "kid";
  else chatAccess.value = "general";
}

async function updateAuthUI() {
  const profile = getUserProfile();
  let user = null;
  if (supabaseClient?.auth) {
    try {
      const authResult = await supabaseClient.auth.getUser();
      user = authResult?.data?.user || null;
    } catch {
      user = null;
    }
  }
  const activeUser = user;
  if (activeUser) {
    const email = user?.email || profile?.email || "trainer";
    const effectiveProfile = applyAdminProfile(
  {
    email,
    playerCode: profile?.playerCode || "",
    ageVerification: profile?.ageVerification || "",
    chatAccess: profile?.chatAccess || "general",
    termsAccepted: Boolean(profile?.termsAccepted),
    isSignedIn: true
  },
  email
); 
const loungeLabel = effectiveProfile?.chatAccess === "adult" ? "Adults-only lounge" : effectiveProfile?.chatAccess === "kid" ? "Kid-safe lounge" : getLoungeLabel();
    authStatus.textContent = `Signed in as ${email} • ${effectiveProfile?.isOwner ? "Owner" : "Trainer"} • ${loungeLabel}`;
    updateOwnerUI(effectiveProfile || activeUser);
    signInButton.hidden = true;
    signUpButton.hidden = true;
    signOutButton.hidden = false;
    effectiveProfile.isSignedIn = true;
setUserProfile(effectiveProfile);
setOnlineStatus(effectiveProfile, true);
    authEmail.hidden = true;
    authPassword.hidden = true;
    playerCode.hidden = true;
    ageVerification.hidden = true;
    chatAccess.hidden = true;
    termsAccepted.hidden = true;
  } else {
    authStatus.textContent = "Not signed in";
    setOnlineStatus(profile, false);
    updateOwnerUI(null);
    signInButton.hidden = false;
    signUpButton.hidden = false;
    signOutButton.hidden = true;
    authEmail.hidden = false;
    authPassword.hidden = false;
    playerCode.hidden = false;
    ageVerification.hidden = false;
    chatAccess.hidden = false;
    termsAccepted.hidden = false;
  }
}

signUpButton?.addEventListener("click", async () => {
  const email = authEmail.value.trim();
  const password = authPassword.value;
  const code = playerCode.value.trim();
  if (!email || !password) {
    showToast("Enter an email and password.", "error");
    return;
  }
  if (!ageVerification || !ageVerification.value) {
    showToast("Choose an age verification option before creating an account.", "error");
    return;
  }
  if (!termsAccepted || !termsAccepted.checked) {
    const agreed = window.confirm("You must agree to the Terms of Service and Community Guidelines before creating an account. Do you want to review them now?");
    if (agreed) {
      window.location.hash = "#community-safety";
      showToast("Please review the Community Safety section and agree before continuing.", "error");
    }
    return;
  }
  applyDefaultLounge();
  const profile = applyAdminProfile({
    email,
    playerCode: code,
    ageVerification: ageVerification.value,
    chatAccess: chatAccess.value,
    termsAccepted: true,
    isSignedIn: true
  }, email);
  try {
  if (!supabaseClient?.auth) {
    throw new Error("Authentication service is unavailable.");
  }

  const { error } = await supabaseClient.auth.signUp({
  email,
  password,
  options: {
    emailRedirectTo: window.location.origin
  }
});

  if (error) throw error;
} catch (error) {
  showToast(
    error?.message || "Unable to create your account.",
    "error"
  );
  return;
}
  setUserProfile(profile);
  await updateAuthUI();
  showToast(`Account created. ${ageVerification.value === "adult" ? "Adults-only lounge access assigned." : "Kid-safe lounge access assigned."}`);
});

signInButton?.addEventListener("click", async () => {
  const email = authEmail.value.trim();
  const password = authPassword.value;
  const code = playerCode.value.trim();
  if (!email || !password) {
    showToast("Enter your email and password.", "error");
    return;
  }
  if (!ageVerification || !ageVerification.value) {
    showToast("Choose an age verification option before signing in.", "error");
    return;
  }
  if (!termsAccepted || !termsAccepted.checked) {
    showToast("You must agree to the community safety rules before signing in.", "error");
    return;
  }
  applyDefaultLounge();
  const profile = applyAdminProfile({
    email,
    playerCode: code,
    ageVerification: ageVerification.value,
    chatAccess: chatAccess.value,
    termsAccepted: true,
    isSignedIn: true
  }, email);
  try {
  if (!supabaseClient?.auth) {
    throw new Error("Authentication service is unavailable.");
  }

  const { error } = await supabaseClient.auth.signInWithPassword({
    email,
    password
  });

  if (error) throw error;
} catch (error) {
  showToast(
    error?.message || "Unable to sign in. Check your email and password.",
    "error"
  );
  return;
}
  setUserProfile(profile);
  await updateAuthUI();
  showToast("Signed in successfully. Your lounge access is ready.");
});

signOutButton?.addEventListener("click", async () => {
  const profile = getUserProfile();

  try {
    if (supabaseClient?.auth) {
      await supabaseClient.auth.signOut();
    }
  } catch {}

  setOnlineStatus(profile, false);
  clearUserProfile();
  await updateAuthUI();
  showToast("Signed out successfully.");
});

ageVerification?.addEventListener("change", applyDefaultLounge);

function showPage(page) {
  const homeSection = document.getElementById("home");
  const contentGrid = document.querySelector(".content-grid");
  const featureGrid = document.querySelector(".feature-grid");
  const joinBanner = document.querySelector(".join-banner");
  const footer = document.querySelector("footer");
  const isHome = page === "home";
  const isSafety = page === "community-safety";
  const isAdmin = page === "admin-backstage";
  if (safetyPage) safetyPage.hidden = !isSafety;
  if (adminPage) adminPage.hidden = !isAdmin;
  if (homeSection) homeSection.hidden = !isHome;
  if (contentGrid) contentGrid.hidden = !isHome;
  if (featureGrid) featureGrid.hidden = !isHome;
  if (joinBanner) joinBanner.hidden = !isHome;
  if (footer) footer.hidden = !isHome;
  const hash = page === "home" ? "#home" : page === "community-safety" ? "#community-safety" : "#admin-backstage";
  updateActiveNav(hash);
}

function updateActiveNav(hash) {
  document.querySelectorAll("nav a").forEach(link => {
    const href = link.getAttribute("href") || "";
    const isSafetyLink = link.id === "communitySafetyLink";
    const isAdminLink = link.id === "adminBackstageLink";
    const isMatch =
      (hash === "#home" && href === "#home") ||
      (hash === "#community-safety" && isSafetyLink) ||
      (hash === "#admin-backstage" && isAdminLink) ||
      (hash !== "#home" && hash !== "#community-safety" && hash !== "#admin-backstage" && href === hash);
    link.classList.toggle("active", isMatch);
  });
}

function syncPageFromHash() {
  const hash = window.location.hash || "#home";
  if (hash === "#community-safety") showPage("community-safety");
  else if (hash === "#admin-backstage") showPage("admin-backstage");
  else showPage("home");
}

window.addEventListener("hashchange", syncPageFromHash);

function loadSiteBackground() {
  const background = localStorage.getItem(STORAGE_KEYS.background) || "";
  if (background) document.body.style.background = background;
}

function saveSiteBackground(color) {
  localStorage.setItem(STORAGE_KEYS.background, color);
  document.body.style.background = color;
}

function getPanelOrder() {
  const stored = getStoredJSON(STORAGE_KEYS.layout, []);
  const order = Array.isArray(stored) ? stored : [];
  const expected = ["schedule", "lab", "raids", "shiny", "hundo", "trade"];
  return order.filter(id => expected.includes(id)).length ? order : expected;
}

function savePanelOrder(order) {
  saveStoredJSON(STORAGE_KEYS.layout, order);
}

function applyPanelOrder(order) {
  const contentGrid = document.querySelector(".content-grid");
  if (!contentGrid) return;
  const panelMap = new Map(Array.from(contentGrid.querySelectorAll("[data-editable='true']")).map(panel => [panel.id, panel]));
  contentGrid.innerHTML = "";
  order.forEach(id => {
    const panel = panelMap.get(id);
    if (panel) contentGrid.appendChild(panel);
  });
  Array.from(contentGrid.querySelectorAll("[data-editable='true']")).forEach(panel => {
    panel.classList.toggle("dragging", false);
    panel.classList.remove("drop-target");
  });
}

function reorderPanels(order, draggedId, targetId, position) {
  const withoutDragged = order.filter(id => id !== draggedId);
  const targetIndex = withoutDragged.indexOf(targetId);
  const insertIndex = targetIndex < 0 ? withoutDragged.length : position === "after" ? targetIndex + 1 : targetIndex;
  withoutDragged.splice(insertIndex, 0, draggedId);
  return withoutDragged;
}

function enableEditorMode() {
  if (!editorToolbar) return;
  const willEnable = editorToolbar.hidden;
  editorToolbar.hidden = !willEnable;
  const contentGrid = document.querySelector(".content-grid");
  const editablePanels = Array.from(document.querySelectorAll("[data-editable='true']"));
  editablePanels.forEach(panel => {
    panel.draggable = willEnable;
    panel.classList.toggle("editable-panel", willEnable);
    panel.classList.toggle("drag-ready", willEnable);
  });
  if (contentGrid) {
    contentGrid.classList.toggle("edit-mode", willEnable);
  }
  if (willEnable) {
    attachEditorHandlers();
    const order = getPanelOrder();
    applyPanelOrder(order);
    showToast("Editor enabled. Drag tiles to move them around the page.");
  }
}

function attachEditorHandlers() {
  let draggedId = null;

  document.querySelectorAll("[data-editable='true']")?.forEach(panel => {
    if (panel.dataset.editorHandlersAttached === "true") return;
    panel.dataset.editorHandlersAttached = "true";

    panel.addEventListener("dragstart", event => {
      draggedId = panel.id;
      panel.classList.add("dragging");
    });
    panel.addEventListener("dragover", event => {
      event.preventDefault();
      const rect = panel.getBoundingClientRect();
      const position = event.clientY > rect.top + rect.height / 2 ? "after" : "before";
      panel.classList.toggle("drop-target", true);
      panel.dataset.dropPosition = position;
    });
    panel.addEventListener("dragleave", () => {
      panel.classList.remove("drop-target");
    });
    panel.addEventListener("drop", event => {
      event.preventDefault();
      const droppedId = event.dataTransfer?.getData("text/plain") || draggedId;
      if (!droppedId || droppedId === panel.id) {
        panel.classList.remove("drop-target");
        return;
      }
      const order = getPanelOrder();
      const position = panel.dataset.dropPosition || "after";
      const updatedOrder = reorderPanels(order, droppedId, panel.id, position);
      savePanelOrder(updatedOrder);
      applyPanelOrder(updatedOrder);
      panel.classList.remove("drop-target");
    });
    panel.addEventListener("dragend", () => {
      panel.classList.remove("dragging");
      panel.classList.remove("drop-target");
    });
  });
}

editSiteButton?.addEventListener("click", async () => {
  try {
    const { data, error } = await supabaseClient.auth.getUser();

    if (error || !isOwnerEmail(data?.user?.email)) {
      showToast("Only the verified owner can edit the site.", "error");
      return;
    }

    enableEditorMode();
  } catch {
    showToast("Unable to verify owner access.", "error");
  }
});

adminEditLayoutButton?.addEventListener("click", async () => {
  try {
    if (!supabaseClient?.auth) {
      throw new Error("Authentication service is unavailable.");
    }

    const { data, error } = await supabaseClient.auth.getUser();

    if (error || !isOwnerEmail(data?.user?.email)) {
      showToast("Only the verified owner can edit the site.", "error");
      return;
    }

    enableEditorMode();
  } catch {
    showToast("Unable to verify owner access.", "error");
  }
});

saveLayoutButton?.addEventListener("click", async () => {
  try {
    if (!supabaseClient?.auth) {
      throw new Error("Authentication service is unavailable.");
    }

    const { data, error } = await supabaseClient.auth.getUser();

    if (error || !isOwnerEmail(data?.user?.email)) {
      showToast("Only the verified owner can save the layout.", "error");
      return;
    }

    const order = Array.from(
      document.querySelectorAll(".content-grid [data-editable='true']")
    ).map(panel => panel.id);

    savePanelOrder(order);
    showToast("Layout saved.");
  } catch {
    showToast("Unable to verify owner access.", "error");
  }
});

backgroundColorPicker?.addEventListener("input", event => saveSiteBackground(event.target.value));

function renderScheduleEvents() {
  const list = document.getElementById("scheduleList");
  if (!list) return;
  const events = getStoredJSON(STORAGE_KEYS.schedule, []);
  if (!events.length) {
    list.innerHTML = '<div class="event-row"><div><strong>No adventure posts yet</strong><p>Be the first to post a meetup.</p></div></div>';
    return;
  }
  list.innerHTML = events.map(event => `
    <div class="event-row ${event.featured ? "featured-event" : ""}">
      <div class="date-chip"><strong>${new Date(event.timestamp).toLocaleString([], { month: "short", day: "numeric" })}</strong><span>${new Date(event.timestamp).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</span></div>
      <div class="event-symbol ${event.type === "remote" ? "purple-bg" : event.type === "community" ? "blue-bg" : "yellow-bg"}">${event.type === "remote" ? "☄" : "⚡"}</div>
      <div>
        <span class="pill ${event.type === "remote" ? "purple-pill" : event.type === "community" ? "blue-pill" : "yellow-pill"}">${event.type === "remote" ? "REMOTE RAID" : event.type === "community" ? "COMMUNITY" : "RAID"}</span>
        <h3>${event.title}</h3>
        <p>${event.location}${event.invite ? ` • ${event.invite}` : ""}</p>
        <small class="post-meta">${(event.attendees || []).length} trainer${(event.attendees || []).length === 1 ? "" : "s"} joined</small>
      </div>
      <button class="join-button" data-event-id="${event.id}">${event.attendees?.includes(getUserProfile()?.email || "") ? "Joined ✓" : "Join"}</button>
    </div>
  `).join("");
}

function setCalendarPanelVisible(visible) {
  const panel = document.getElementById("calendarPanel");
  if (panel) {
    panel.hidden = !visible;
  }
}

function renderCalendarPanel() {
  const list = document.getElementById("calendarList");
  if (!list) return;
  const events = getStoredJSON(STORAGE_KEYS.schedule, []);
  list.innerHTML = events.map(event => `
    <div class="calendar-event">
      <div>
        <strong>${event.title}</strong>
        <p>${event.location} • ${new Date(event.timestamp).toLocaleString([], { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}</p>
        <small>${event.invite ? `Invite: ${event.invite}` : "Meetup details posted by the host"}</small>
      </div>
      <button class="join-button" data-calendar-event-id="${event.id}">${event.attendees?.includes(getUserProfile()?.email || "") ? "Joined ✓" : "Join"}</button>
    </div>
  `).join("");
}

function attachScheduleActions() {
  document.getElementById("postScheduleButton")?.addEventListener("click", () => {
    const title = document.getElementById("scheduleTitle")?.value.trim();
    const location = document.getElementById("scheduleLocation")?.value.trim();
    const invite = document.getElementById("scheduleInvite")?.value.trim();
    const timestampValue = document.getElementById("scheduleTime")?.value;
    const type = document.getElementById("scheduleType")?.value || "raid";
    if (!title || !location || !timestampValue) {
      showToast("Please fill out the event details before posting.", "error");
      return;
    }
    const profile = getUserProfile();
    const events = getStoredJSON(STORAGE_KEYS.schedule, []);
    events.unshift({
      id: `${Date.now()}`,
      title,
      location,
      invite,
      timestamp: new Date(timestampValue).toISOString(),
      type,
      postedBy: profile?.email || "trainer",
      attendees: []
    });
    saveStoredJSON(STORAGE_KEYS.schedule, events);
    renderScheduleEvents();
    renderCalendarPanel();
    document.getElementById("scheduleTitle").value = "";
    document.getElementById("scheduleLocation").value = "";
    document.getElementById("scheduleInvite").value = "";
    document.getElementById("scheduleTime").value = "";
    showToast("Adventure post created.");
  });

  document.getElementById("scheduleCalendarButton")?.addEventListener("click", () => {
    renderCalendarPanel();
    const panel = document.getElementById("calendarPanel");
    const button = document.getElementById("scheduleCalendarButton");
    const isVisible = panel && !panel.hidden;
    setCalendarPanelVisible(!isVisible);
    if (button) {
      button.textContent = isVisible ? "Show calendar" : "Hide calendar";
    }
  });

  document.addEventListener("click", event => {
    const button = event.target.closest("[data-event-id]");
    if (button) {
      const id = button.getAttribute("data-event-id");
      const events = getStoredJSON(STORAGE_KEYS.schedule, []);
      const profile = getUserProfile();
      const currentUser = profile?.email || "guest";
      const nextEvents = events.map(event => {
        if (event.id !== id) return event;
        const attendees = event.attendees || [];
        const alreadyJoined = attendees.includes(currentUser);
        return { ...event, attendees: alreadyJoined ? attendees.filter(value => value !== currentUser) : [...attendees, currentUser] };
      });
      saveStoredJSON(STORAGE_KEYS.schedule, nextEvents);
      renderScheduleEvents();
      renderCalendarPanel();
      showToast("Your attendance was updated.");
      return;
    }
    const calendarButton = event.target.closest("[data-calendar-event-id]");
    if (calendarButton) {
      const id = calendarButton.getAttribute("data-calendar-event-id");
      const events = getStoredJSON(STORAGE_KEYS.schedule, []);
      const profile = getUserProfile();
      const currentUser = profile?.email || "guest";
      const nextEvents = events.map(event => {
        if (event.id !== id) return event;
        const attendees = event.attendees || [];
        const alreadyJoined = attendees.includes(currentUser);
        return { ...event, attendees: alreadyJoined ? attendees.filter(value => value !== currentUser) : [...attendees, currentUser] };
      });
      saveStoredJSON(STORAGE_KEYS.schedule, nextEvents);
      renderScheduleEvents();
      renderCalendarPanel();
      showToast("Your attendance was updated.");
    }
  });
}

async function loadProfessorFeed() {
  const fallback = [
    { title: "Pokémon GO Hub: Research Day and spotlight events", source: "Pokémon GO Hub", description: "Expect new raid rotations, bonuses, and featured encounters to be shared through the latest community updates." },
    { title: "LeekDuck: Raid and event forecast", source: "LeekDuck", description: "Community event trackers often highlight upcoming wild spawns, raid bosses, and limited-time bonuses." }
  ];
  try {
    const [hubText, leekText] = await Promise.allSettled([
      fetch("https://pokemongohub.net/").then(response => response.text()).catch(() => ""),
      fetch("https://leekduck.com/").then(response => response.text()).catch(() => "")
    ]);
    const snippets = [];
    if (hubText.status === "fulfilled" && hubText.value) snippets.push({ title: "Pokémon GO Hub update", source: "Pokémon GO Hub", description: "Live page available from Pokémon GO Hub. Review the latest event posts for the next community outing." });
    if (leekText.status === "fulfilled" && leekText.value) snippets.push({ title: "LeekDuck update", source: "LeekDuck", description: "LeekDuck event coverage is available for latest Pokémon GO timing updates." });
    return snippets.length ? snippets : fallback;
  } catch {
    return fallback;
  }
}

async function renderProfessorFeed() {
  const feed = document.getElementById("labFeed");
  if (!feed) return;
  const entries = await loadProfessorFeed();
  feed.innerHTML = entries.map(entry => `
    <div>
      <span>${entry.source}</span>
      <strong>${entry.title}</strong>
      <small>${entry.description}</small>
    </div>
  `).join("");
}

function screenImageSubmission(note, filename = "") {
  const text = `${note} ${filename}`.toLowerCase();
  const blockedTerms = ["nsfw", "nude", "porn", "explicit", "screenshot", "sexual", "graphic"];
  const isBlocked = blockedTerms.some(term => text.includes(term));
  return {
    ok: !isBlocked,
    message: isBlocked ? "Upload blocked because it appears to contain inappropriate content or a screenshot. Please share a clean Pokémon GO catch photo." : ""
  };
}

function renderShinySightings() {
  const grid = document.getElementById("shinyGrid");
  if (!grid) return;
  const posts = getStoredJSON(STORAGE_KEYS.shiny, []);
  if (!posts.length) {
    grid.innerHTML = '<div class="catch-card"><strong>No catches shared yet</strong><small>Post the latest shiny or lucky catch here.</small></div>';
    return;
  }
  grid.innerHTML = posts.map(post => `
    <div class="catch-card ${post.color || "gold-card"}">
      <div>
        <span class="sparkles">✦</span>
        ${post.image ? `<img src="${post.image}" alt="${post.name}">` : '<div class="silhouette">⚡</div>'}
      </div>
      <div>
        <strong>${post.name}</strong>
        <small>${post.note || "Shared from the community board"}</small>
        <p class="post-meta">${post.location || "Shared locally"}</p>
        ${isAdminProfile(getUserProfile(), getUserProfile()?.email || "", "") ? `<button class="secondary-button remove-post" data-remove-shiny="${post.id}">Remove</button>` : ""}
      </div>
    </div>
  `).join("");
}

function renderTradePosts() {
  const list = document.getElementById("tradeList");
  if (!list) return;
  const posts = getStoredJSON(STORAGE_KEYS.trade, []);
  if (!posts.length) {
    list.innerHTML = '<div class="trade-row"><div><strong>No trade posts yet</strong><span>List your Pokémon or wants here.</span></div></div>';
    return;
  }
  list.innerHTML = posts.map(post => `
    <div class="trade-row">
      <div class="trade-avatar">T</div>
      <div>
        <strong>${post.title}</strong>
        <span>${post.note}</span>
        <p class="post-meta">${post.author || "Trainer"}${post.playerCode ? ` • ${post.playerCode}` : ""}</p>
      </div>
      <span class="trade-tag">${post.tag || "OPEN"}</span>
    </div>
  `).join("");
}

function renderHundoReports() {
  const list = document.getElementById("hundoReports");
  if (!list) return;
  const posts = getStoredJSON(STORAGE_KEYS.hundo, []);
  if (!posts.length) {
    list.innerHTML = '<div class="report-row"><strong>No hundo reports yet</strong><span>Share a sighting and help nearby trainers.</span></div>';
    return;
  }
  list.innerHTML = posts.map(post => `
    <div class="report-row">
      <strong>${post.pokemon}</strong>
      <span>${post.location}</span>
      <small>${post.note}</small>
    </div>
  `).join("");
}

function attachCommunityActions() {
  document.getElementById("postShinyButton")?.addEventListener("click", () => {
    document.getElementById("shinyComposer").hidden = false;
  });

  document.getElementById("submitShinyButton")?.addEventListener("click", async () => {
    const name = document.getElementById("shinyName")?.value.trim();
    const location = document.getElementById("shinyLocation")?.value.trim();
    const note = document.getElementById("shinyNote")?.value.trim();
    const fileInput = document.getElementById("shinyImage");
    const file = fileInput?.files?.[0];
    if (!name || !location || !note) {
      showToast("Please add the catch name, location, and note.", "error");
      return;
    }
    if (!file) {
      showToast("Please upload a photo of your catch.", "error");
      return;
    }
    const screen = screenImageSubmission(note, file.name);
    if (!screen.ok) {
      showToast(screen.message, "error");
      return;
    }
    const image = await readFileAsDataURL(file);
    const posts = getStoredJSON(STORAGE_KEYS.shiny, []);
    posts.unshift({
      id: `${Date.now()}`,
      name,
      location,
      note,
      image,
      color: ["gold-card", "blue-card", "purple-card"][posts.length % 3],
      author: getUserProfile()?.email || "trainer"
    });
    saveStoredJSON(STORAGE_KEYS.shiny, posts);
    renderShinySightings();
    document.getElementById("shinyComposer").hidden = true;
    document.getElementById("shinyName").value = "";
    document.getElementById("shinyLocation").value = "";
    document.getElementById("shinyNote").value = "";
    fileInput.value = "";
    showToast("Shiny catch shared for review.");
  });

  document.getElementById("postTradeButton")?.addEventListener("click", () => {
    document.getElementById("tradeComposer").hidden = false;
  });

  document.getElementById("submitTradeButton")?.addEventListener("click", () => {
    const title = document.getElementById("tradeTitle")?.value.trim();
    const note = document.getElementById("tradeNote")?.value.trim();
    if (!title || !note) {
      showToast("Please add a trade title and details.", "error");
      return;
    }
    const profile = getUserProfile();
    const posts = getStoredJSON(STORAGE_KEYS.trade, []);
    posts.unshift({
      id: `${Date.now()}`,
      title,
      note,
      author: profile?.email || "trainer",
      playerCode: profile?.playerCode || "",
      tag: "OPEN"
    });
    saveStoredJSON(STORAGE_KEYS.trade, posts);
    renderTradePosts();
    document.getElementById("tradeComposer").hidden = true;
    document.getElementById("tradeTitle").value = "";
    document.getElementById("tradeNote").value = "";
    showToast("Trade post published.");
  });

  document.getElementById("postHundoButton")?.addEventListener("click", () => {
    document.getElementById("hundoComposer").hidden = false;
  });

  document.getElementById("submitHundoButton")?.addEventListener("click", () => {
    const pokemon = document.getElementById("hundoPokemon")?.value.trim();
    const location = document.getElementById("hundoLocation")?.value.trim();
    const note = document.getElementById("hundoNote")?.value.trim();
    if (!pokemon || !location || !note) {
      showToast("Please include the Pokémon, location, and note.", "error");
      return;
    }
    const posts = getStoredJSON(STORAGE_KEYS.hundo, []);
    posts.unshift({ id: `${Date.now()}`, pokemon, location, note, author: getUserProfile()?.email || "trainer" });
    saveStoredJSON(STORAGE_KEYS.hundo, posts);
    renderHundoReports();
    document.getElementById("hundoComposer").hidden = true;
    document.getElementById("hundoPokemon").value = "";
    document.getElementById("hundoLocation").value = "";
    document.getElementById("hundoNote").value = "";
    showToast("Hundo report posted.");
  });

  document.addEventListener("click", event => {
    const removeButton = event.target.closest("[data-remove-shiny]");
    if (removeButton) {
      const id = removeButton.getAttribute("data-remove-shiny");
      const posts = getStoredJSON(STORAGE_KEYS.shiny, []);
      const filtered = posts.filter(post => post.id !== id);
      saveStoredJSON(STORAGE_KEYS.shiny, filtered);
      renderShinySightings();
      showToast("Shiny catch removed by admin.");
    }
  });
}

function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Unable to read image"));
    reader.readAsDataURL(file);
  });
}

function updateAdminOverview() {
  const state = getModerationState();
  const reportCount = document.getElementById("reportCount");
  const warningCount = document.getElementById("warningCount");
  const blockedCount = document.getElementById("blockedCount");
  if (reportCount) reportCount.textContent = String(state.reports.length || 0);
  if (warningCount) warningCount.textContent = String(state.warnings.length || 0);
  if (blockedCount) blockedCount.textContent = String(state.blockedUsers.length || 0);
}

document.getElementById("reviewReportsButton")?.addEventListener("click", () => {
  const state = getModerationState();
  const reports = state.reports.length ? state.reports : [
    { title: "Profanity in public room", detail: "Flagged by automatic filter." },
    { title: "Harassment and repeated slurs", detail: "Reported by a trainer." },
    { title: "Spam and repeated solicitation", detail: "Reported during a public room event." }
  ];
  state.reports = reports;
  saveModerationState(state);
  renderAdminReports();
  updateAdminOverview();
  showToast(`Review queue loaded with ${reports.length} report${reports.length === 1 ? "" : "s"}.`);
});

document.getElementById("removeUserButton")?.addEventListener("click", () => {
  const state = getModerationState();
  const user = window.prompt("Enter the username or account to remove from chat:");
  if (!user) return;
  state.blockedUsers = Array.from(new Set([...(state.blockedUsers || []), user]));
  state.reports.push({ title: `Removed from chat: ${user}`, detail: "Moderator action logged." });
  saveModerationState(state);
  renderAdminReports();
  updateAdminOverview();
  showToast(`${user} removed from the chat and flagged for review.`);
});

document.getElementById("warnUserButton")?.addEventListener("click", () => {
  const state = getModerationState();
  const user = window.prompt("Enter the username to warn:");
  if (!user) return;
  state.warnings = Array.from(new Set([...(state.warnings || []), user]));
  state.reports.push({ title: `Warning issued: ${user}`, detail: "Warning logged for moderators." });
  saveModerationState(state);
  renderAdminReports();
  updateAdminOverview();
  showToast(`${user} warned and the action was logged for moderators.`);
});

document.getElementById("addAdminButton")?.addEventListener("click", () => {
  const currentProfile = getUserProfile();
  if (!isAdminProfile(currentProfile, currentProfile?.email || "", "")) {
    showToast("Only admins and the owner can add new admins.", "error");
    return;
  }
  const email = document.getElementById("newAdminEmail")?.value.trim().toLowerCase();
  if (!email) return;
  const emails = getAdminEmails();
  if (!emails.includes(email)) {
    emails.push(email);
    saveAdminEmails(emails);
  }
  document.getElementById("newAdminEmail").value = "";
  showToast(`${email} can now manage the community as an admin.`);
});

function setupRaidLobby() {
  if (hostRaidButton && raidForm) {
    hostRaidButton.addEventListener("click", () => {
      raidForm.hidden = !raidForm.hidden;
    });
  }
  if (submitRaidButton && raidBoss && raidLocation && raidStartTime && raidEndTime && raidList) {
    submitRaidButton.addEventListener("click", async () => {
      const boss = raidBoss.value.trim();
      const location = raidLocation.value.trim();
      const startTime = raidStartTime.value;
      const endTime = raidEndTime.value;
      if (!boss || !location || !startTime || !endTime) {
        showToast("Please fill out all raid fields.", "error");
        return;
      }
      const startTimestamp = new Date(startTime).getTime();
      const endTimestamp = new Date(endTime).getTime();
      if (startTimestamp >= endTimestamp) {
        showToast("Please choose a start time that is before the end time.", "error");
        return;
      }
      const raids = getStoredJSON("triadRaids", []);
      raids.unshift({ id: `${Date.now()}`, boss, location, startTimestamp, endTimestamp, joined: [] });
      saveStoredJSON("triadRaids", raids);
      renderRaidLobby();
      raidBoss.value = "";
      raidLocation.value = "";
      raidStartTime.value = "";
      raidEndTime.value = "";
      raidForm.hidden = true;
      showToast("Raid posted to the lobby.");
    });
  }
  renderRaidLobby();
  window.setInterval(() => renderRaidLobby(), 15000);
}

function renderRaidLobby() {
  if (!raidList) return;
  const raids = getStoredJSON("triadRaids", []);
  const currentUser = getUserProfile()?.email || "guest";
  const now = Date.now();
  const visibleRaids = raids.filter(raid => (raid.endTimestamp || 0) > now);
  const liveRaids = visibleRaids.filter(raid => (raid.startTimestamp || now) <= now);
  const upcomingRaids = visibleRaids.filter(raid => (raid.startTimestamp || now) > now);

  const buildRaidMarkup = raid => {
    const startTimestamp = raid.startTimestamp || now;
    const endTimestamp = raid.endTimestamp || now;
    const isLive = startTimestamp <= now && endTimestamp > now;
    const countdown = isLive
      ? `${Math.max(0, Math.ceil((endTimestamp - now) / 60000))} min left`
      : `Starts in ${Math.max(0, Math.ceil((startTimestamp - now) / 60000))} min`;
    return `
      <div class="raid-item">
        <div class="raid-egg five-star">★</div>
        <div class="raid-main">
          <strong>${raid.boss}</strong>
          <span class="raid-timer">${countdown}</span>
        </div>
        <div class="raid-location">📍 ${raid.location}</div>
        <div class="raid-join-count">👥 ${raid.joined?.length || 0} joined</div>
        <button class="join-raid-button" data-raid-id="${raid.id}">${raid.joined?.includes(currentUser) ? "Joined ✓" : "Join Lobby"}</button>
      </div>
    `;
  };

  const sections = [];
  if (liveRaids.length) {
    sections.push(`<div class="raid-section"><h4>Live raids</h4>${liveRaids.map(buildRaidMarkup).join("")}</div>`);
  }
  if (upcomingRaids.length) {
    sections.push(`<div class="raid-section"><h4>Upcoming raids</h4>${upcomingRaids.map(buildRaidMarkup).join("")}</div>`);
  }

  if (!sections.length) {
    raidList.innerHTML = '<div class="raid-item"><div><strong>No raids posted yet</strong><span class="raid-location">Host the next raid for your crew.</span></div></div>';
    return;
  }

  raidList.innerHTML = sections.join("");
}

raidList?.addEventListener("click", event => {
  const button = event.target.closest("[data-raid-id]");
  if (!button) return;
  const id = button.getAttribute("data-raid-id");
  const raids = getStoredJSON("triadRaids", []);
  const currentUser = getUserProfile()?.email || "guest";
  const nextRaids = raids.map(raid => {
    if (raid.id !== id) return raid;
    const joined = raid.joined || [];
    return { ...raid, joined: joined.includes(currentUser) ? joined.filter(value => value !== currentUser) : [...joined, currentUser] };
  });
  saveStoredJSON("triadRaids", nextRaids);
  renderRaidLobby();
  showToast("Raid attendance updated.");
});

menuButton?.addEventListener("click", () => sidebar.classList.toggle("open"));

document.querySelectorAll("nav a").forEach(link => {
  link.addEventListener("click", event => {
    const href = link.getAttribute("href") || "#home";
    const nextPage = href === "#community-safety" ? "community-safety" : href === "#admin-backstage" ? "admin-backstage" : "home";
    const profile = getUserProfile();
    if (href === "#admin-backstage" && !isAdminProfile(profile, profile?.email || "", "")) {
      event.preventDefault();
      showToast("Admin Backstage is reserved for admins and the owner.", "error");
      return;
    }
    document.querySelectorAll("nav a").forEach(a => a.classList.remove("active"));
    link.classList.add("active");
    sidebar.classList.remove("open");
    event.preventDefault();
    window.location.hash = href;
    showPage(nextPage);
  });
});

function applySavedBackground() {
  const saved = localStorage.getItem(STORAGE_KEYS.background);
  if (saved) document.body.style.background = saved;
}

setTimeout(() => boot?.classList.add("hidden"), 2300);

updateOwnerUI(null);
syncPageFromHash();
applySavedBackground();
loadSiteBackground();
renderAdminReports();
updateAdminOverview();
renderScheduleEvents();
renderCalendarPanel();
renderProfessorFeed();
renderShinySightings();
renderTradePosts();
renderHundoReports();
setupRaidLobby();
attachCommunityActions();
attachScheduleActions();
updateAuthUI();
if (supabaseClient?.auth) {
  supabaseClient.auth.onAuthStateChange(() => {
    updateAuthUI();
  });
}
