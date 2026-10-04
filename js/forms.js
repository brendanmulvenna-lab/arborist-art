(function () {
  var ENDPOINT = "https://arborist-leads.brendanmulvenna.workers.dev/lead";
  var FALLBACK = "Something went wrong. Please call us at 941-233-3976.";
  var forms = document.querySelectorAll("form.inspection-form, form.lead-form");

  forms.forEach(function (form) {
    var startedAt = Date.now();

    var hp = document.createElement("div");
    hp.style.display = "none";
    hp.setAttribute("aria-hidden", "true");
    hp.innerHTML = '<label>Leave this field empty<input type="text" name="hp_check" tabindex="-1" autocomplete="off"></label>';
    form.appendChild(hp);

    var status = document.createElement("p");
    status.className = "form-status";
    status.setAttribute("role", "status");
    status.setAttribute("aria-live", "polite");
    status.style.marginTop = "16px";
    form.appendChild(status);

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var btn = form.querySelector('button[type="submit"]');
      var label = btn ? btn.textContent : "";
      var data = {};
      Array.prototype.forEach.call(form.elements, function (el) {
        if (!el.name || el.disabled) return;
        if (el.tagName === "SELECT") {
          var opt = el.options[el.selectedIndex];
          data[el.name] = (opt && opt.value) ? opt.text.trim() : "";
        } else if (el.type !== "submit" && el.type !== "button") {
          data[el.name] = el.value;
        }
      });
      data.page = window.location.pathname;
      data.form_started_at = startedAt;

      if (btn) { btn.disabled = true; btn.textContent = "Sending..."; }
      status.textContent = "";

      fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      })
        .then(function (r) {
          return r.json().catch(function () { return {}; }).then(function (j) {
            if (r.ok && j.ok) {
              form.innerHTML = '<p class="form-success" role="status" style="font-size: 18px; line-height: 1.6;">Thank you. We received your request and will be in touch shortly.</p>';
              return;
            }
            status.textContent = (r.status === 400 && j.error) ? j.error : FALLBACK;
            if (btn) { btn.disabled = false; btn.textContent = label; }
          });
        })
        .catch(function () {
          status.textContent = FALLBACK;
          if (btn) { btn.disabled = false; btn.textContent = label; }
        });
    });
  });
})();
