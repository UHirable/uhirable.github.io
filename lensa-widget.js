// Lensa Connect widget on the Search Jobs page. Lensa pays only for US traffic, so the widget loads
// only for visitors whose browser time zone is in the United States. Nothing is sent to any server
// to decide this: it is read from the browser's own time zone setting.
(function () {
  var box = document.getElementById("lensa-box");
  if (!box) return;
  var tz = "";
  try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ""; } catch (e) {}
  var US = /^(America\/(New_York|Chicago|Denver|Los_Angeles|Phoenix|Anchorage|Detroit|Boise|Juneau|Sitka|Nome|Yakutat|Metlakatla|Adak|Menominee|Indiana\/.+|Kentucky\/.+|North_Dakota\/.+)|US\/.+|Pacific\/Honolulu|Pacific\/Johnston)$/;
  if (!US.test(tz)) return;
  var CAMPAIGN = "c4c628f0-03b6-408c-9163-9522ee270b4e";
  var KEY = "93167acd-c9a3-4d58-8f41-7be82c4075b6"; // widget key: public by design, it is part of Lensa's embed code
  var f = document.createElement("iframe");
  f.title = "Jobs from Lensa";
  f.loading = "lazy";
  f.referrerPolicy = "origin";
  f.style.cssText = "width:100%;height:640px;border:none;overflow:hidden;border-radius:14px;background:#fff";
  f.src = "https://connect.lensa.com/widget-api/widget/?widget_access_key=" + KEY + "&campaign_id=" + CAMPAIGN + "&bgcolor=&textcolor=&bordercolor=&linkcolor=&size=M&fontFace=Arial&limit=15";
  box.querySelector(".lensa-frame").appendChild(f);
  box.hidden = false;
})();
