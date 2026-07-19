async function loadData() {
    const response = await fetch("data.json");
    const data = await response.json();

    document.getElementById("counter").textContent = data.left;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const last = new Date(data.lastMatcha);
    last.setHours(0, 0, 0, 0);

    const diff = today.getTime() - last.getTime();

    const days = Math.max(
        0,
        Math.floor(diff / (1000 * 60 * 60 * 24))
    );

    document.getElementById("days").textContent =
        `${days} päeva`;
}

loadData();