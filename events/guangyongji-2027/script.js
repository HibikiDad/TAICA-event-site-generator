/* 光踴祭 guangyongji-2027 — 互動功能
   沒有 JavaScript 時，頁面所有資訊仍可完整閱讀（RULE 8）。 */
(function () {
  "use strict";

  document.documentElement.classList.add("js");

  var EVENT_DATE = "2027-01-23";
  var EVENT_START = new Date("2027-01-23T09:30:00+08:00");
  var EVENT_END = new Date("2027-01-23T16:00:00+08:00");

  /* ---------- 手機漢堡選單 ---------- */
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("site-nav");

  function setNavOpen(open) {
    if (!toggle || !nav) return;
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    nav.classList.toggle("is-open", open);
  }

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      setNavOpen(toggle.getAttribute("aria-expanded") !== "true");
    });
    nav.addEventListener("click", function (event) {
      if (event.target.closest("a")) setNavOpen(false);
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
        setNavOpen(false);
        toggle.focus();
      }
    });
  }

  /* ---------- 導覽列目前區塊高亮 ---------- */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll(".nav-list a[href^='#']"));
  if ("IntersectionObserver" in window && navLinks.length) {
    var linkById = {};
    navLinks.forEach(function (link) {
      linkById[link.getAttribute("href").slice(1)] = link;
    });
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navLinks.forEach(function (link) { link.classList.remove("is-active"); });
        var active = linkById[entry.target.id];
        if (active) active.classList.add("is-active");
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    /* 主視覺不在導覽列中，捲回頁首時清除高亮 */
    ["hero"].concat(Object.keys(linkById)).forEach(function (id) {
      var section = document.getElementById(id);
      if (section) observer.observe(section);
    });
  }

  /* ---------- 倒數計時 ---------- */
  var countdown = document.getElementById("countdown");
  if (countdown) {
    var label = countdown.querySelector(".countdown-label");
    var value = countdown.querySelector(".countdown-value");
    var units = {
      days: countdown.querySelector("[data-unit='days']"),
      hours: countdown.querySelector("[data-unit='hours']"),
      minutes: countdown.querySelector("[data-unit='minutes']")
    };

    var updateCountdown = function () {
      var now = new Date();
      if (now >= EVENT_END) {
        label.textContent = "活動已結束，感謝參與！";
        value.hidden = true;
        return false;
      }
      if (now >= EVENT_START) {
        label.textContent = "活動進行中！";
        value.hidden = true;
        return true;
      }
      var diff = Math.floor((EVENT_START - now) / 60000);
      units.days.textContent = Math.floor(diff / 1440);
      units.hours.textContent = Math.floor((diff % 1440) / 60);
      units.minutes.textContent = diff % 60;
      return true;
    };

    countdown.hidden = false;
    if (updateCountdown()) {
      var timer = window.setInterval(function () {
        if (!updateCountdown()) window.clearInterval(timer);
      }, 30000);
    }
  }

  /* ---------- 節目類型篩選 ---------- */
  var filter = document.getElementById("program-filter");
  if (filter) {
    var buttons = Array.prototype.slice.call(filter.querySelectorAll(".filter-button"));
    var rows = Array.prototype.slice.call(document.querySelectorAll(".program-table .program-row"));
    filter.hidden = false;
    filter.addEventListener("click", function (event) {
      var button = event.target.closest(".filter-button");
      if (!button) return;
      var type = button.getAttribute("data-filter");
      buttons.forEach(function (item) {
        item.setAttribute("aria-pressed", item === button ? "true" : "false");
      });
      rows.forEach(function (row) {
        var show = type === "all" || row.getAttribute("data-type") === type;
        row.classList.toggle("is-hidden", !show);
      });
    });
  }

  /* ---------- 活動當天標示「進行中」 ---------- */
  function taipeiNow() {
    var parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Taipei",
      year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", hourCycle: "h23"
    }).formatToParts(new Date());
    var map = {};
    parts.forEach(function (part) { map[part.type] = part.value; });
    return { date: map.year + "-" + map.month + "-" + map.day, time: map.hour + ":" + map.minute };
  }

  function markNow() {
    var now = taipeiNow();
    var timedRows = document.querySelectorAll("tr[data-start][data-end]");
    Array.prototype.forEach.call(timedRows, function (row) {
      var isNow = now.date === EVENT_DATE &&
        now.time >= row.getAttribute("data-start") &&
        now.time < row.getAttribute("data-end");
      row.classList.toggle("is-now", isNow);
    });
  }

  if (taipeiNow().date === EVENT_DATE) {
    markNow();
    window.setInterval(markNow, 60000);
  }
})();
