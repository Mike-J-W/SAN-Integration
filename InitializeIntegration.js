function getSunriseFolderName() {
  return "Sunrise Member Data";
}

function getActionNetworkFolderName() {
  return "ActionNetwork Data";
}

function createSheets(spreadsheetId) {
  var spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  var sheets = spreadsheet.getSheets();
  var sheetNames = [];
  for (var i = 0; i < sheets.length; i++) {
    sheetNames.push(sheets[i].getName());
  }
  var desiredSheets = [
    "Volunteers",
    "Reference",
    "Events",
    "Forms",
    "People",
    "Tags",
    "Attendances",
    "Submissions",
    "Taggings",
    "Settings"
    ];
  for (var i = 0; i < desiredSheets.length; i++) {
    var desiredSheetName = desiredSheets[i];
    if (sheetNames.indexOf(desiredSheetName) === -1 ) {
      spreadsheet.insertSheet(desiredSheetName);
    }
  }
  return true;
}

function initializeSettings(spreadsheetId) {
  var settingsSheet = openSheet("Settings");
  dumpIntoSheet(settingsSheet, [["Name", "Value"]], [
    ["GoogleSheets.Color.RedBerry", "#980000"],
    ["GoogleSheets.Color.RedBerryLight3", "#E6B8AF"],
    ["GoogleSheets.Color.RedBerryLight2", "#DD7D6B"],
    ["GoogleSheets.Color.RedBerryLight1", "#CC4124"],
    ["GoogleSheets.Color.RedBerryDark1", "#A61B00"],
    ["GoogleSheets.Color.RedBerryDark2", "#841F0B"],
    ["GoogleSheets.Color.RedBerryDark3", "#5B0D00"],
    ["GoogleSheets.Color.Red", "#FF0000"],
    ["GoogleSheets.Color.RedLight3", "#F4CCCC"],
    ["GoogleSheets.Color.RedLight2", "#EB9899"],
    ["GoogleSheets.Color.RedLight1", "#E06665"],
    ["GoogleSheets.Color.RedDark1", "#CC0000"],
    ["GoogleSheets.Color.RedDark2", "#990000"],
    ["GoogleSheets.Color.RedDark3", "#660000"],
    ["GoogleSheets.Color.Orange", "#FF9800"],
    ["GoogleSheets.Color.OrangeLight3", "#FDE5CD"],
    ["GoogleSheets.Color.OrangeLight2", "#F9CB9C"],
    ["GoogleSheets.Color.OrangeLight1", "#F7B16B"],
    ["GoogleSheets.Color.OrangeDark1", "#E69038"],
    ["GoogleSheets.Color.OrangeDark2", "#B45F04"],
    ["GoogleSheets.Color.OrangeDark3", "#783E02"],
    ["GoogleSheets.Color.Yellow", "#FFFF00"],
    ["GoogleSheets.Color.YellowLight3", "#FFF3CC"],
    ["GoogleSheets.Color.YellowLight2", "#FFE598"],
    ["GoogleSheets.Color.YellowLight1", "#FFD966"],
    ["GoogleSheets.Color.YellowDark1", "#F1C231"],
    ["GoogleSheets.Color.YellowDark2", "#BF9000"],
    ["GoogleSheets.Color.YellowDark3", "#7F5F00"],
    ["GoogleSheets.Color.Green", "#00FF00"],
    ["GoogleSheets.Color.GreenLight3", "#D9EBD3"],
    ["GoogleSheets.Color.GreenLight2", "#B6D7A8"],
    ["GoogleSheets.Color.GreenLight1", "#92C47D"],
    ["GoogleSheets.Color.GreenDark1", "#6AA84E"],
    ["GoogleSheets.Color.GreenDark2", "#38761C"],
    ["GoogleSheets.Color.GreenDark3", "#274E11"],
    ["GoogleSheets.Color.Cyan", "#00FFFF"],
    ["GoogleSheets.Color.CyanLight3", "#D1E0E3"],
    ["GoogleSheets.Color.CyanLight2", "#A2C4CA"],
    ["GoogleSheets.Color.CyanLight1", "#75A5AF"],
    ["GoogleSheets.Color.CyanDark1", "#44818E"],
    ["GoogleSheets.Color.CyanDark2", "#114F5C"],
    ["GoogleSheets.Color.CyanDark3", "#0A343C"],
    ["GoogleSheets.Color.ConflowerBlue", "#4A85E8"],
    ["GoogleSheets.Color.ConflowerBlueLight3", "#C9DBF8"],
    ["GoogleSheets.Color.ConflowerBlueLight2", "#A4C2F4"],
    ["GoogleSheets.Color.ConflowerBlueLight1", "#6D9EEC"],
    ["GoogleSheets.Color.ConflowerBlueDark1", "#3B77D8"],
    ["GoogleSheets.Color.ConflowerBlueDark2", "#0F55CC"],
    ["GoogleSheets.Color.ConflowerBlueDark3", "#1B4487"],
    ["GoogleSheets.Color.Blue", "#0000FF"],
    ["GoogleSheets.Color.BlueLight3", "#CFE2F3"],
    ["GoogleSheets.Color.BlueLight2", "#9EC5E9"],
    ["GoogleSheets.Color.BlueLight1", "#6EA8DC"],
    ["GoogleSheets.Color.BlueDark1", "#3C84C6"],
    ["GoogleSheets.Color.BlueDark2", "#095294"],
    ["GoogleSheets.Color.BlueDark3", "#053762"],
    ["GoogleSheets.Color.Purple", "#9900FF"],
    ["GoogleSheets.Color.PurpleLight3", "#D9D3E9"],
    ["GoogleSheets.Color.PurpleLight2", "#B4A7D6"],
    ["GoogleSheets.Color.PurpleLight1", "#8E7CC3"],
    ["GoogleSheets.Color.PurpleDark1", "#674EA7"],
    ["GoogleSheets.Color.PurpleDark2", "#351A75"],
    ["GoogleSheets.Color.PurpleDark3", "#1F104C"],
    ["GoogleSheets.Color.Magenta", "#FF00FF"],
    ["GoogleSheets.Color.MagentaLight3", "#EBD1DC"],
    ["GoogleSheets.Color.MagentaLight2", "#D5A6BD"],
    ["GoogleSheets.Color.MagentaLight1", "#C27BA0"],
    ["GoogleSheets.Color.MagentaDark1", "#A64C79"],
    ["GoogleSheets.Color.MagentaDark2", "#741A47"],
    ["GoogleSheets.Color.MagentaDark3", "#4C0F2F"],
    ["GoogleSheets.Color.White", "#FFFFFF"],
    ["GoogleSheets.Color.GreyLight3", "#F3F3F3"],
    ["GoogleSheets.Color.GreyLight2", "#EFEFEF"],
    ["GoogleSheets.Color.GreyLight1", "#D9D9D9"],
    ["GoogleSheets.Color.Grey", "#CCCCCC"],
    ["GoogleSheets.Color.GreyDark1", "#B7B7B7"],
    ["GoogleSheets.Color.GreyDark2", "#999999"],
    ["GoogleSheets.Color.GreyDark3", "#666666"],
    ["GoogleSheets.Color.GreyDark4", "#434343"],
    ["GoogleSheets.Color.Black", "#000000"],
    ["Sunrise.VolunteerTracking.AllowForcePushes", "true"],
    ["Sunrise.VolunteerTracking.SpreadsheetID", spreadsheetId],
    ["ActionNetwork.Aep", "https://actionnetwork.org/api/v2/"]]);
}

function pullFETsInSeries() {
  deleteFunctionTrigger("pullFETsInSeries");
  pullForms();
  pullEvents();
  pullTags();
  ScriptApp.newTrigger("pullAttendancesInSeries")
  .timeBased()
  .after(20 * 1000)
  .create();
}

function pullAttendancesInSeries() {
  deleteFunctionTrigger("pullAttendancesInSeries");
  pullAttendances();
  ScriptApp.newTrigger("pullSubmissionsInSeries")
  .timeBased()
  .after(20 * 1000)
  .create();
}

function pullSubmissionsInSeries() {
  deleteFunctionTrigger("pullSubmissionsInSeries");
  pullSubmissions();
  ScriptApp.newTrigger("pullTaggingsInSeries")
  .timeBased()
  .after(20 * 1000)
  .create();
}

function pullTaggingsInSeries() {
  deleteFunctionTrigger("pullTaggingsInSeries");
  pullTaggings();
}

function pullRawData() {
  deleteFunctionTrigger("pullRawData");
  setSetting("Sunrise.VolunteerTracking.PullingData", "true");
  pullPeople();
  ScriptApp.newTrigger("pullFETsInSeries")
  .timeBased()
  .after(20 * 1000)
  .create();
}

function initializeIntegration(spreadsheetId, apiKey, formId) {
  createSheets(spreadsheetId);
  initializeSettings(spreadsheetId);
  setSetting("ActionNetwork.ApiKey", apiKey);
  setSetting("ActionNetwork.Form.PhoneOutreach.ID", formId);
  pullRawData();
}

function dailyPull() {
  deleteFunctionTrigger("dailyPull");
  if (closeSessions()) {
    pullRawData()
  }
}

function setDailyPullTrigger() {
  if (!(hasClockTrigger())) {
    ScriptApp.newTrigger("dailyPull")
    .timeBased()
    .atHour(0)
    .everyDays(1)
    .create(); 
  }
}

