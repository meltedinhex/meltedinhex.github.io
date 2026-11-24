(() => {
  "use strict";

  const root = document.getElementById("extension-attack");
  const search = document.getElementById("ea-search");
  const status = document.getElementById("ea-status");
  const tactic = document.getElementById("ea-tactic");
  const result = document.getElementById("ea-result");
  const error = document.getElementById("ea-error");
  const dialog = document.getElementById("ea-dialog");
  const techniques = JSON.parse(document.getElementById("ea-data").textContent).techniques;
  const records = new Map(techniques.map(technique => [technique.id, technique]));
  const panels = new Map([...root.querySelectorAll("[data-detail]")].map(panel => [panel.dataset.detail, panel]));
  const cards = [...root.querySelectorAll(".ea-technique")];
  const columns = [...root.querySelectorAll(".ea-column")];
  const searchable = new Map(techniques.map(technique => [
    technique.id, JSON.stringify(technique).toLowerCase()
  ]));
  let activeId = null;
  let opener = null;

  function filter() {
    const term = search.value.trim().toLowerCase();
    const exactId = term.toUpperCase();
    const exactMatch = records.has(exactId);
    let visible = 0;
    for (const card of cards) {
      const id = card.dataset.openTechnique;
      card.hidden = !((!status.value || records.get(id).status === status.value) &&
        (!term || (exactMatch ? id === exactId : searchable.get(id).includes(term))));
      if (!card.hidden) visible++;
    }
    for (const column of columns) {
      const count = column.querySelectorAll(".ea-technique:not([hidden])").length;
      column.querySelector(".ea-column-count").textContent = count;
      column.hidden = count === 0;
      const option = tactic.querySelector(`option[value="${column.querySelector("h2").id}"]`);
      option.disabled = count === 0;
      if (option.disabled && tactic.value === option.value) tactic.value = "";
    }
    tactic.disabled = visible === 0;
    result.textContent = `${visible} of ${techniques.length} techniques`;
    document.getElementById("ea-empty").hidden = visible !== 0;
  }

  function openTechnique(id, updateHistory = true) {
    const panel = panels.get(id);
    if (!panel) {
      error.textContent = `Technique ${id} is not in this snapshot.`;
      error.hidden = false;
      return;
    }
    error.hidden = true;
    if (!dialog.open) opener = document.activeElement;
    if (activeId) panels.get(activeId).hidden = true;
    panel.hidden = false;
    activeId = id;
    dialog.setAttribute("aria-labelledby", `detail-${id}`);
    if (!dialog.open) dialog.showModal();
    dialog.scrollTop = 0;
    panel.querySelector("h2").focus({ preventScroll: true });
    if (updateHistory && location.hash !== `#${id}`) {
      history.pushState(null, "", `#${id}`);
    }
  }

  function followHash() {
    const id = location.hash.slice(1);
    if (id.startsWith("EXT-")) {
      if (!panels.has(id) && dialog.open) dialog.close();
      openTechnique(id, false);
    } else {
      error.hidden = true;
      if (dialog.open) dialog.close();
    }
  }

  root.addEventListener("click", event => {
    const button = event.target.closest("[data-open-technique]");
    if (button) openTechnique(button.dataset.openTechnique);
  });
  document.getElementById("ea-close").addEventListener("click", () => dialog.close());
  dialog.addEventListener("keydown", event => {
    if (event.key === "Escape") {
      event.preventDefault();
      dialog.close();
    }
  });
  dialog.addEventListener("click", event => {
    const box = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < box.left || event.clientX > box.right ||
      event.clientY < box.top || event.clientY > box.bottom)) dialog.close();
  });
  dialog.addEventListener("close", () => {
    if (location.hash === `#${activeId}`) {
      history.replaceState(null, "", location.pathname + location.search);
    }
    if (activeId) panels.get(activeId).hidden = true;
    activeId = null;
    if (opener?.isConnected && !opener.closest("[hidden]")) opener.focus();
  });
  search.addEventListener("input", filter);
  status.addEventListener("change", filter);
  tactic.addEventListener("change", () => {
    if (!tactic.value) return;
    const heading = document.getElementById(tactic.value);
    heading.scrollIntoView({ block: "center", inline: "start" });
    heading.focus({ preventScroll: true });
  });
  document.getElementById("ea-reset").addEventListener("click", () => {
    search.value = "";
    status.value = "";
    tactic.value = "";
    filter();
    search.focus();
  });
  window.addEventListener("hashchange", followHash);
  followHash();
})();
