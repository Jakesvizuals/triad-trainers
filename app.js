const SUPABASE_URL = "https://qjhhhbibkqmyojkggujw.supabase.co";
const SUPABASE_KEY = "sb_publishable_4mJ3ro8tiacXTyyUoCQ_fQ_szs9pXqL"; 
const supabaseClient = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
); 
const boot = document.getElementById("bootScreen");
const sidebar = document.getElementById("sidebar");
const menuButton = document.getElementById("menuButton");
const hostRaidButton = document.getElementById("hostRaidButton");
const raidForm = document.getElementById("raidForm");
const raidBoss = document.getElementById("raidBoss");
const raidLocation = document.getElementById("raidLocation");
const raidEndTime = document.getElementById("raidEndTime");
const submitRaidButton = document.getElementById("submitRaidButton");
const raidList = document.querySelector(".raid-list");
async function loadRaidsFromSupabase() {
  const { data, error } = await supabaseClient
    .from("Raids")
    .select("*");

  if (error) {
    console.error("Could not load raids:", error);
    return [];
  }

  return data;
}

async function saveRaidToSupabase({ boss, location, endTimestamp }) {
  const { data, error } = await supabaseClient
    .from("Raids")
    .insert({
      Boss: boss,
      location: location,
      end_timestamp: new Date(endTimestamp).toISOString(),
      Join_count: 0
    })
    .select()
    .single();

  if (error) {
    console.error("Could not save raid:", error);
    alert(`Supabase error: ${error.message}`);
    return null;
  }

  return data;
}

function createRaidCard({ id, boss, location, endTimestamp, joinCount = 0 }) {
  if (!raidList || endTimestamp <= Date.now()) return;

  const raidItem = document.createElement("div");
  raidItem.className = "raid-item";

  raidItem.innerHTML = `
    <div class="raid-egg five-star">★</div>
    <div class="raid-main">
      <strong>${boss}</strong>
      <span class="raid-timer">Calculating time...</span>
    </div>
    <div class="raid-location">📍 ${location}</div>
    <div class="raid-join-count">👥 ${joinCount} joined</div>
    <button class="join-raid-button">Join Lobby</button>
  `;

  raidList.prepend(raidItem);

  const timer = raidItem.querySelector(".raid-timer");
  const joinButton = raidItem.querySelector(".join-raid-button");
  const joinCountDisplay = raidItem.querySelector(".raid-join-count");
  function updateRaidTimer() {
    const remaining = endTimestamp - Date.now();

   if (remaining <= 0) {
  raidItem.remove();
  return;
}

    const totalSeconds = Math.floor(remaining / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    timer.textContent =
      `${minutes}:${seconds.toString().padStart(2, "0")} remaining`;
  }

  updateRaidTimer();

  const raidInterval = setInterval(() => {
    if (!raidItem.isConnected) {
      clearInterval(raidInterval);
      return;
    }

    updateRaidTimer();
  }, 1000);

  joinButton.addEventListener("click", async () => {
  if (!id) return;

  joinButton.disabled = true;

  const { data, error } = await supabaseClient.rpc(
    "increment_raid_join_count",
    { raid_id: id }
  );

  if (error) {
    console.error("Could not join raid:", error);
    alert(`Supabase error: ${error.message}`);
    joinButton.disabled = false;
    return;
  }

  joinCount = data;
  joinCountDisplay.textContent = `👥 ${joinCount} joined`;

  joinButton.textContent = "Joined ✓";
});
}
async function displaySavedRaids() {
  const raids = await loadRaidsFromSupabase();

  raids
    .filter(raid => new Date(raid.end_timestamp).getTime() > Date.now())
    .forEach(raid => {
      createRaidCard({
  id: raid.id,
  boss: raid.Boss,
  location: raid.location,
  endTimestamp: new Date(raid.end_timestamp).getTime(),
  joinCount: raid.Join_count ?? 0
});
    });
}

displaySavedRaids();
if (hostRaidButton && raidForm) {
  hostRaidButton.addEventListener("click", () => {
    raidForm.hidden = !raidForm.hidden;
  });
}
if (submitRaidButton && raidBoss && raidLocation && raidEndTime && raidList) {
    submitRaidButton.addEventListener("click", async () => {
    const boss = raidBoss.value.trim();
    const location = raidLocation.value.trim();
    const endTime = raidEndTime.value;

    if (!boss || !location || !endTime) {
      alert("Please fill out all raid fields.");
      return;
    }

    const endTimestamp = new Date(endTime).getTime();
    

    if (endTimestamp <= Date.now()) {
      alert("Please choose a future raid end time.");
      return;
    }
    
    const saved = await saveRaidToSupabase({
  boss,
  location,
  endTimestamp
});

if (!saved) {
  alert("Could not post the raid. Please try again.");
  return;
}

createRaidCard({
  id: saved.id,
  boss: saved.Boss,
  location: saved.location,
  endTimestamp: new Date(saved.end_timestamp).getTime(),
  joinCount: saved.Join_count ?? 0
});

  
    raidBoss.value = "";
    raidLocation.value = "";
    raidEndTime.value = "";
    raidForm.hidden = true;
  });
}
setTimeout(() => boot.classList.add("hidden"), 2300);

menuButton.addEventListener("click", () => sidebar.classList.toggle("open"));

document.querySelectorAll("nav a").forEach(link => {
  link.addEventListener("click", () => {
    document.querySelectorAll("nav a").forEach(a => a.classList.remove("active"));
    link.classList.add("active");
    sidebar.classList.remove("open");
  });
});

document.querySelectorAll(".join-button, .raid-item button").forEach(button => {
  button.addEventListener("click", () => {
    button.textContent = "Joined ✓";
    button.disabled = true;
  });
});

let seconds = 18 * 60 + 42;
const countdown = document.getElementById("countdown");

setInterval(() => {
  seconds = Math.max(0, seconds - 1);
  const mins = Math.floor(seconds / 60).toString().padStart(2, "0");
  const secs = (seconds % 60).toString().padStart(2, "0");
  countdown.textContent = `${mins}:${secs}`;
}, 1000);
