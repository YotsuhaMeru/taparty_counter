javascript: (function () {
  var href = window.location.href;
  if (
    href.indexOf("https://sammyqr.jp/smartphone/AG/capture/index/symfony/") !==
      0 &&
    href.indexOf("https://sammyqr.jp/smartphone/AG/total/index") !==
      0 &&
    href.indexOf("https://sammyqr.jp/smartphone/AG/newPlay/index") !== 0
  ) {
    alert("このページでは使用できません。");
    return;
  }

  function getLevel() {
    var el = document.querySelector(".mycounter_status p.strong");
    if (!el) return null;
    var m = el.textContent.match(/レベル：(\d+)/);
    return m ? Number(m[1]) : null;
  }

  function parseSection(startTitle) {
    var result = {};
    var tables = document.querySelectorAll(".mysloTbl table");
    tables.forEach(function (table) {
      var rows = table.querySelectorAll("tr");
      var capture = false;
      rows.forEach(function (row) {
        var th = row.querySelector(".param_title");
        if (th) {
          capture = th.textContent.trim() === startTitle;
          return;
        }
        if (capture) {
          var tds = row.querySelectorAll("td");
          if (tds.length >= 2) {
            var name = tds[0].textContent.trim();
            var value = tds[1].textContent.trim();
            var rate = tds[2] ? tds[2].textContent.trim() : "";
            result[name] = { value: value };
            if (rate !== "") {
              result[name].rate = rate;
            }
          }
        }
      });
    });
    return result;
  }

  var data = {
    myCounterLevel: getLevel(),
    basicInfo: parseSection("基本情報"),
    bonusCZATInfo: parseSection("BONUS・CZ・AT情報"),
    bonusOverlapInfo: parseSection("BONUS重複情報"),
    modeSelectInfo: parseSection("モード選択情報"),
    dateCharacterSelectInfo: parseSection("デートキャラ選択情報"),
    otherPlayInfo: parseSection("その他遊技情報"),
  };

  var json = JSON.stringify(data);
  var base64 = btoa(unescape(encodeURIComponent(json)));
  var url =
    "https://sammyqr.cafe-stella.com/postNewCounter?json=" +
    encodeURIComponent(base64);
  window.open(url, "_blank");
})();
