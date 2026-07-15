const boot = document.getElementById("bootScreen");
const sidebar = document.getElementById("sidebar");
const menuButton = document.getElementById("menuButton");

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
