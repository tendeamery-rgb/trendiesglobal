const TRENDIES_SITE_URL = "https://trendiesglobal.com";
const EXPORT_SECRET = "PASTE_YOUR_EXPORT_SECRET_HERE";

const RAW_SHEET_NAME = "Interest Forms";
const CLEAN_SHEET_NAME = "Clean Dataset";
const BREAKDOWN_SHEET_NAME = "Breakdowns";
const DASHBOARD_SHEET_NAME = "Dashboard";
const EXPORT_PAGE_SIZE = 5000;
const MAX_EXPORT_PAGES = 20;

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("Trendies Sync")
    .addItem("Sync now", "syncTrendiesInterestsWithAlert")
    .addItem("Install 5-minute auto-sync", "setupTrendiesAutoSyncWithAlert")
    .addItem("Show setup help", "showTrendiesSetupHelp")
    .addToUi();
}

function setupTrendiesAutoSyncWithAlert() {
  setupTrendiesAutoSync();
  SpreadsheetApp.getUi().alert("Trendies sync is installed. This Sheet will refresh every 5 minutes.");
}

function syncTrendiesInterestsWithAlert() {
  syncTrendiesInterests();
  SpreadsheetApp.getUi().alert("Trendies data synced successfully.");
}

function showTrendiesSetupHelp() {
  SpreadsheetApp.getUi().alert(
    "Trendies setup:\n\n" +
    "1. Replace PASTE_YOUR_EXPORT_SECRET_HERE with your Netlify EXPORT_SECRET.\n" +
    "2. Save the Apps Script project.\n" +
    "3. Run setupTrendiesAutoSync once.\n\n" +
    "The Sheet will build a raw data tab, a clean founder-friendly dataset, breakdown tables and pie charts."
  );
}

function setupTrendiesAutoSync() {
  syncTrendiesInterests();

  const existingTriggers = ScriptApp.getProjectTriggers();
  for (const trigger of existingTriggers) {
    if (trigger.getHandlerFunction() === "syncTrendiesInterests") {
      ScriptApp.deleteTrigger(trigger);
    }
  }

  ScriptApp.newTrigger("syncTrendiesInterests")
    .timeBased()
    .everyMinutes(5)
    .create();
}

function syncTrendiesInterests() {
  if (!EXPORT_SECRET || EXPORT_SECRET === "PASTE_YOUR_EXPORT_SECRET_HERE") {
    throw new Error("Paste your Netlify EXPORT_SECRET into the EXPORT_SECRET line first.");
  }

  const rows = fetchTrendiesExportRows_();
  if (!rows.length || !rows[0].length) {
    throw new Error("Trendies export returned no rows.");
  }

  const spreadsheet = SpreadsheetApp.getActive();
  writeRawExport_(spreadsheet, rows);

  const records = rowsToRecords_(rows);
  writeCleanDataset_(spreadsheet, records);
  const ranges = writeBreakdowns_(spreadsheet, records);
  writeDashboard_(spreadsheet, records, ranges);
}

function fetchTrendiesExportRows_() {
  let header = null;
  const dataRows = [];

  for (let page = 0; page < MAX_EXPORT_PAGES; page++) {
    const offset = page * EXPORT_PAGE_SIZE;
    const url = `${TRENDIES_SITE_URL}/api/export-interests?token=${encodeURIComponent(EXPORT_SECRET)}&limit=${EXPORT_PAGE_SIZE}&offset=${offset}`;
    const rows = fetchCsvRows_(url);

    if (!rows.length || !rows[0].length) break;
    if (!header) header = rows[0];

    const pageRows = rows.slice(1);
    dataRows.push.apply(dataRows, pageRows);

    if (pageRows.length === 0 || pageRows.length < EXPORT_PAGE_SIZE) break;

    // Older live exports ignore limit/offset and return the whole CSV at once.
    // Stop after the first oversized page so the Sheet does not duplicate rows.
    if (pageRows.length > EXPORT_PAGE_SIZE) break;
  }

  return header ? [header].concat(dataRows) : [];
}

function fetchCsvRows_(url) {
  const response = UrlFetchApp.fetch(url, {muteHttpExceptions: true});
  const status = response.getResponseCode();

  if (status !== 200) {
    throw new Error(`Trendies export failed with status ${status}: ${response.getContentText()}`);
  }

  return Utilities.parseCsv(response.getContentText());
}

function writeRawExport_(spreadsheet, rows) {
  const sheet = resetSheet_(spreadsheet, RAW_SHEET_NAME);
  sheet.getRange(1, 1, rows.length, rows[0].length).setValues(rows);
  styleDataSheet_(sheet, rows[0].length);
  sheet.getRange("A1").setNote(`Last synced: ${new Date().toLocaleString()}`);
}

function writeCleanDataset_(spreadsheet, records) {
  const sheet = resetSheet_(spreadsheet, CLEAN_SHEET_NAME);
  const headers = [
    "date",
    "customer name",
    "email",
    "phone",
    "service requested",
    "enquiry category",
    "budget",
    "urgency",
    "location",
    "notes",
    "region",
    "respondent type",
    "partnership type",
    "intent strength",
    "activity tags",
    "safety tags",
    "wants updates",
    "AI priority",
    "AI summary",
    "AI tags"
  ];

  const values = records.map((r) => [
    r.created_at,
    r.name,
    r.email,
    "",
    serviceRequested_(r),
    r.respondent_type || "general trendie",
    "Not asked on current form",
    r.ai_priority || r.intent_strength || "curious",
    joinParts_([r.city, r.country, r.region], " / "),
    ownerNotes_(r),
    r.region,
    r.respondent_type,
    r.partnership_type,
    r.intent_strength,
    r.activity_tags,
    r.safety_tags,
    r.wants_updates,
    r.ai_priority,
    r.ai_summary,
    r.ai_tags
  ]);

  const allRows = [headers].concat(values);
  sheet.getRange(1, 1, allRows.length, headers.length).setValues(allRows);
  styleDataSheet_(sheet, headers.length);
  sheet.setColumnWidth(10, 420);
  sheet.setColumnWidth(19, 360);
  sheet.getRange(2, 10, Math.max(values.length, 1), 1).setWrap(true);
  sheet.getRange(2, 19, Math.max(values.length, 1), 1).setWrap(true);
}

function writeBreakdowns_(spreadsheet, records) {
  const sheet = resetSheet_(spreadsheet, BREAKDOWN_SHEET_NAME);
  let row = 1;
  const ranges = {};

  row = writeMetricBlock_(sheet, row, records);
  row += 2;
  row = writeBreakdownBlock_(sheet, row, "Regions", countBy_(records, "region"), ranges, "regions");
  row += 2;
  row = writeBreakdownBlock_(sheet, row, "People Types", countBy_(records, "respondent_type"), ranges, "peopleTypes");
  row += 2;
  row = writeBreakdownBlock_(sheet, row, "Intent", countBy_(records, "intent_strength"), ranges, "intent");
  row += 2;
  row = writeBreakdownBlock_(sheet, row, "Partnerships", countBy_(records, "partnership_type"), ranges, "partnerships");
  row += 2;
  row = writeBreakdownBlock_(sheet, row, "Activities", countTags_(records, "activity_tags"), ranges, "activities");
  row += 2;
  writeBreakdownBlock_(sheet, row, "Safety Tags", countTags_(records, "safety_tags"), ranges, "safety");

  sheet.autoResizeColumns(1, 2);
  sheet.setFrozenRows(1);
  return ranges;
}

function writeMetricBlock_(sheet, startRow, records) {
  const total = records.length;
  const strong = records.filter((r) => String(r.intent_strength).toLowerCase() === "strong").length;
  const helpers = records.filter((r) => String(r.respondent_type).toLowerCase().indexOf("general trendie") === -1).length;
  const updates = records.filter((r) => String(r.wants_updates).toLowerCase() === "true").length;
  const countries = {};
  records.forEach((r) => {
    if (r.country) countries[String(r.country).trim()] = true;
  });

  const rows = [
    ["Metric", "Value"],
    ["Last synced", new Date().toLocaleString()],
    ["Total signups", total],
    ["Strong intent", strong],
    ["Helpers / collaborators / partners", helpers],
    ["Wants updates", updates],
    ["Countries represented", Object.keys(countries).length]
  ];

  sheet.getRange(startRow, 1, rows.length, 2).setValues(rows);
  sheet.getRange(startRow, 1, 1, 2).setFontWeight("bold").setBackground("#1f2729").setFontColor("#ffffff");
  return startRow + rows.length;
}

function writeBreakdownBlock_(sheet, startRow, title, counts, ranges, key) {
  const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const rows = [[title, "Count"]].concat(entries.length ? entries : [["None yet", 0]]);
  sheet.getRange(startRow, 1, rows.length, 2).setValues(rows);
  sheet.getRange(startRow, 1, 1, 2).setFontWeight("bold").setBackground("#335c9b").setFontColor("#ffffff");
  ranges[key] = `${BREAKDOWN_SHEET_NAME}!A${startRow}:B${startRow + rows.length - 1}`;
  return startRow + rows.length;
}

function writeDashboard_(spreadsheet, records, ranges) {
  const sheet = resetSheet_(spreadsheet, DASHBOARD_SHEET_NAME);
  const total = records.length;
  const latest = records[0] && records[0].created_at ? records[0].created_at : "No signups yet";
  const helpers = records.filter((r) => String(r.respondent_type).toLowerCase().indexOf("general trendie") === -1).length;
  const strong = records.filter((r) => String(r.intent_strength).toLowerCase() === "strong").length;

  sheet.getRange("A1").setValue("Trendies Global Live Data");
  sheet.getRange("A2").setValue("Automatically refreshed from the private Netlify export.");
  sheet.getRange("A4:B8").setValues([
    ["Total signups", total],
    ["Latest signup", latest],
    ["Strong intent", strong],
    ["Helpers / collaborators / partners", helpers],
    ["Last synced", new Date().toLocaleString()]
  ]);

  sheet.getRange("A1").setFontSize(18).setFontWeight("bold");
  sheet.getRange("A2").setFontColor("#5c5c5c");
  sheet.getRange("A4:A8").setFontWeight("bold").setBackground("#f6ead8");
  sheet.getRange("B4:B8").setBackground("#fffaf2");
  sheet.setColumnWidth(1, 260);
  sheet.setColumnWidth(2, 220);

  insertPieChart_(spreadsheet, sheet, ranges.peopleTypes, "Signup Types", 4, 4);
  insertPieChart_(spreadsheet, sheet, ranges.regions, "Regions", 4, 9);
  insertPieChart_(spreadsheet, sheet, ranges.intent, "Intent Strength", 20, 4);
  insertPieChart_(spreadsheet, sheet, ranges.activities, "Activity Interests", 20, 9);
}

function insertPieChart_(spreadsheet, dashboardSheet, a1Range, title, row, column) {
  if (!a1Range) return;
  const range = spreadsheet.getRange(a1Range);
  const chart = dashboardSheet.newChart()
    .asPieChart()
    .addRange(range)
    .setOption("title", title)
    .setOption("pieHole", 0.35)
    .setOption("legend", {position: "right"})
    .setOption("chartArea", {left: 20, top: 40, width: "78%", height: "78%"})
    .setPosition(row, column, 0, 0)
    .build();
  dashboardSheet.insertChart(chart);
}

function rowsToRecords_(rows) {
  const headers = rows[0];
  return rows.slice(1).map((row) => {
    const record = {};
    headers.forEach((header, index) => {
      record[header] = row[index] || "";
    });
    return record;
  });
}

function countBy_(records, field) {
  const counts = {};
  records.forEach((record) => {
    const label = cleanLabel_(record[field]);
    counts[label] = (counts[label] || 0) + 1;
  });
  return counts;
}

function countTags_(records, field) {
  const counts = {};
  records.forEach((record) => {
    splitTags_(record[field]).forEach((tag) => {
      counts[tag] = (counts[tag] || 0) + 1;
    });
  });
  return counts;
}

function splitTags_(value) {
  return String(value || "")
    .split(";")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function serviceRequested_(record) {
  const type = String(record.respondent_type || "").toLowerCase();
  const partnership = String(record.partnership_type || "").toLowerCase();

  if (type.indexOf("city helper") !== -1 || partnership.indexOf("city chapter") !== -1) {
    return "Help build a local chapter";
  }
  if (type.indexOf("creative") !== -1 || partnership.indexOf("creative") !== -1) {
    return "Creative collaboration";
  }
  if (type.indexOf("partner") !== -1 || partnership.indexOf("brand") !== -1 || partnership.indexOf("venue") !== -1) {
    return "Brand / venue / partner enquiry";
  }
  return "Join Chapter One";
}

function ownerNotes_(record) {
  return joinParts_([
    record.ai_summary ? `AI summary: ${record.ai_summary}` : "",
    record.show_up_reason ? `Show-up reason: ${record.show_up_reason}` : "",
    record.safety_needs ? `Safety needs: ${record.safety_needs}` : "",
    record.help_build ? `Help / partnership: ${record.help_build}` : ""
  ], "\n\n");
}

function cleanLabel_(value) {
  const text = String(value || "").trim();
  return text || "Unknown";
}

function joinParts_(parts, separator) {
  return parts.map((part) => String(part || "").trim()).filter(Boolean).join(separator);
}

function resetSheet_(spreadsheet, name) {
  const sheet = spreadsheet.getSheetByName(name) || spreadsheet.insertSheet(name);
  sheet.getCharts().forEach((chart) => sheet.removeChart(chart));
  const filter = sheet.getFilter();
  if (filter) filter.remove();
  sheet.clear();
  return sheet;
}

function styleDataSheet_(sheet, columnCount) {
  const maxRows = Math.max(sheet.getLastRow(), 1);
  sheet.setFrozenRows(1);
  sheet.getRange(1, 1, 1, columnCount)
    .setFontWeight("bold")
    .setBackground("#1f2729")
    .setFontColor("#ffffff");
  sheet.getRange(1, 1, maxRows, columnCount).createFilter();
  sheet.autoResizeColumns(1, columnCount);
}
