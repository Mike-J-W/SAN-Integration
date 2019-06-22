function getTrackingSpreadsheetName() {
  return "Sunrise Hub Volunteer Tracking Sheet";
}

function getVolunteersSetupInfo() {
  return [
    ["ActionNetworkID", "First Name", "Last Name", "Pronouns", "Email", 
     "Phone Number", "Age", "Hub Role", "First Action", "Date of First Action", 
     "Ladder Status", "Action Network Tags", "Date of Last Call", "Number Dialed on Last Call", "Request of Last Call", 
     "Outcome of Last Call", "Sunrise 101 - Date Completed", "Sunrise Leadership Training - Date Completed"]
  ];
}

function getReferenceSetupContents() {
  return [
    ["First Name", "Last Name", "Pronouns", "Email", "Phone Number", 
     "Hub Role", "First Action", "Date of First Action", "Ladder Status", "Action Network Tags", 
     "Date of Last Call", "Number Dialed on Last Call", "Request of Last Call", "Outcome of Last Call", "Sunrise 101 - Date Completed",
     "Sunrise Leadership Training - Date Completed"],
    ["", "", "They/Them", "", "", 
     "Hub Coordinator", "", "", "not interested", "", 
     "", "", "", "No Response", "", 
     ""],
    ["", "", "She/Her", "", "", 
     "National Liason", "", "", "prospect from national database", "", 
     "", "", "", "Wrong Number", "", 
     ""],
    ["", "", "He/Him", "", "", 
     "Hub Leader", "", "", "prospect from event", "", 
     "", "", "", "Remove from Sunrise", "", 
     ""],
    ["", "", "Other", "", "", 
     "Committee Chair", "", "", "1:1 or hub meeting", "", 
     "", "", "", "Do Not Call Again", "", 
     ""],
    ["", "", "", "", "", 
     "Committee Leader", "", "", "volunteer", "", 
     "", "", "", "No", "", 
     ""],
    ["", "", "", "", "", 
     "Committee Member", "", "", "weekly volunteer", "", 
     "", "", "", "No, but Interested", "", 
     ""], 
    ["", "", "", "", "", 
     "Hub Member", "", "", "leadership role", "", 
     "", "", "", "Maybe", "", 
     ""], 
    ["", "", "", "", "", 
     "Participant", "", "", "", "", 
     "", "", "", "Yes", "", 
     ""], 
    ["", "", "", "", "", 
     "Recipient", "", "", "", "", 
     "", "", "", "", "", 
     ""], 
    ["", "", "", "", "", 
     "Disconnected", "", "", "", "", 
     "", "", "", "", "", 
     ""],
    ["", "", "", "", "", 
     "Unknown", "", "", "", "", 
     "", "", "", "", "", 
     ""]
  ]; 
}

function setReferenceDefaultFormatting(sheet) {
  var cellRange = null;
  cellRange = sheet.getRange(2, 6, 1, 1);
  cellRange.setBackground(getSetting("GoogleSheets.Color.PurpleLight2"));
  cellRange = sheet.getRange(3, 6, 1, 1);
  cellRange.setBackground(getSetting("GoogleSheets.Color.PurpleLight3"));
  cellRange = sheet.getRange(4, 6, 1, 1);
  cellRange.setBackground(getSetting("GoogleSheets.Color.BlueLight3"));
  cellRange = sheet.getRange(5, 6, 1, 1);
  cellRange.setBackground(getSetting("GoogleSheets.Color.ConflowerBlueLight3"));
  cellRange = sheet.getRange(6, 6, 1, 1);
  cellRange.setBackground(getSetting("GoogleSheets.Color.CyanLight3"));
  cellRange = sheet.getRange(7, 6, 1, 1);
  cellRange.setBackground(getSetting("GoogleSheets.Color.GreenLight3"));
  cellRange = sheet.getRange(8, 6, 1, 1);
  cellRange.setBackground(getSetting("GoogleSheets.Color.YellowLight3"));
  cellRange = sheet.getRange(9, 6, 1, 1);
  cellRange.setBackground(getSetting("GoogleSheets.Color.OrangeLight3"));
  cellRange = sheet.getRange(10, 6, 1, 1);
  cellRange.setBackground(getSetting("GoogleSheets.Color.OrangeLight2"));
  cellRange = sheet.getRange(11, 6, 1, 1);
  cellRange.setBackground(getSetting("GoogleSheets.Color.RedBerryLight3"));  
  cellRange = sheet.getRange(2, 9, 1, 1);
  cellRange.setBackground(getSetting("GoogleSheets.Color.RedBerryLight3"));
  cellRange = sheet.getRange(2, 13, 1, 1);
  cellRange.setFontStyle('italic');
  cellRange = sheet.getRange(3, 14, 1, 1);
  cellRange.setBackground(getSetting("GoogleSheets.Color.YellowLight1"));
  cellRange = sheet.getRange(4, 14, 1, 1);
  cellRange.setBackground(getSetting("GoogleSheets.Color.RedLight1"));
  cellRange = sheet.getRange(5, 14, 1, 1);
  cellRange.setBackground(getSetting("GoogleSheets.Color.OrangeLight1"));
  return true;
}

function setupSheet(sheet, data) {
  var fullRange = sheet.getRange(1, 1, sheet.getMaxRows(), sheet.getMaxColumns());
  fullRange.clear();
  var dataRange = sheet.getRange(1, 1, data.length, data[0].length);
  dataRange.setValues(data);
  sheet.setFrozenRows(data.length);
  sheet.setFrozenColumns(3);
  sheet.showColumns(1, data.length);
  sheet.hideColumns(1);
  var lastIndex = data.length - 1;
  for (var i = 1; i < data[lastIndex].length; i++) {
    var column = data[lastIndex][i];
    var previousColumn = data[lastIndex][i - 1];
    if (column === previousColumn + " Updated") {
      sheet.hideColumns(i + 1);
    }
  }
  return true;
}

function setupReferenceSheet(sheet) {
  var contents = getReferenceSetupContents();
  dumpIntoSheet(sheet, [contents[0]], contents.slice(1));
  setReferenceDefaultFormatting(sheet);
  var rules = getDefaultReferenceFormatRules(sheet, 1);
  sheet.setConditionalFormatRules(rules);
  return true;
}
  
function getDuplicateFormatRules(sheet, headerRow) {
  var headers = getRowValues(sheet, headerRow);
  var firstNameColumnIndex = null;
  var lastNameColumnIndex = null;
  var emailColumnLetter = null;
  var phoneColumnLetter = null;
  for (var i = 0; i < headers.length; i++) {
    var header = headers[i];
    if (header === "First Name") {
      firstNameColumnIndex = i + 1;
    }
    if (header === "Last Name") {
      lastNameColumnIndex = i + 1;
    }
    if (header === "Email") {
      emailColumnLetter = getColumnLetterFromIndex(i + 1);
    }
    if (header === "Phone Number") {
      phoneColumnLetter = getColumnLetterFromIndex(i + 1);
    }
  }
  var formula = "=countif(${0}:${0},${0}1)>1";
  var yellow = getSetting("GoogleSheets.Color.Yellow");
  var rules = [];
  var ruleRanges = [
    sheet.getRange(1, firstNameColumnIndex, sheet.getMaxRows(), 1),
    sheet.getRange(1, lastNameColumnIndex, sheet.getMaxRows(), 1)
    ];
  var emailFormula = formula.replace(/{0}/g, emailColumnLetter);
  var emailRule = SpreadsheetApp.newConditionalFormatRule()
  .whenFormulaSatisfied(emailFormula)
  .setBackground(yellow)
  .setRanges(ruleRanges)
  .build();
  rules.push(emailRule);
  var phoneFormula = formula.replace(/{0}/g, phoneColumnLetter);
  var phoneRule = SpreadsheetApp.newConditionalFormatRule()
  .whenFormulaSatisfied(phoneFormula)
  .setBackground(yellow)
  .setRanges(ruleRanges)
  .build();
  rules.push(phoneRule);
  return rules;
} 

function getReferenceFormatRulesByHeaders(targetSheet, targetHeaderRow, referenceSheet, referenceHeaderRow) {
  var targetHeaders = getRowValues(targetSheet, targetHeaderRow);
  var targetColumnLength = targetSheet.getMaxRows() - targetHeaderRow;
  var referenceSheetName = referenceSheet.getName();
  var referenceColumnLength = referenceSheet.getLastRow() - referenceHeaderRow;
  var referenceHeaders = getRowValues(referenceSheet, referenceHeaderRow);
  var referenceFormatRules = referenceSheet.getConditionalFormatRules();
  var targetFormatRules = [];
  for (var i = 0; i < referenceFormatRules.length; i++) {
    var referenceRule = referenceFormatRules[i];
    var referenceRuleRanges = referenceRule.getRanges();
    var targetRuleHeaders = [];
    for (var j = 0; j < referenceRuleRanges.length; j++) {
      var referenceRuleRange = referenceRuleRanges[j];
      var referenceRuleRangeA1Notation = referenceRuleRange.getA1Notation();
      var referenceRuleRangeValues = referenceRuleRange.getValues();
      var referenceRuleHeaders = referenceRuleRangeValues[0];
      for (var k = 0; k < referenceRuleHeaders.length; k++) {
        var referenceRuleHeader = referenceRuleHeaders[k];
        if (targetRuleHeaders.indexOf(referenceRuleHeader) === -1) {
          targetRuleHeaders.push(referenceRuleHeader);
        }
      }
    }
    var targetRuleRanges = [];
    for (var j = 0; j < targetRuleHeaders.length; j++) {
      var targetRuleHeader = targetRuleHeaders[j];
      var targetRuleHeaderIndex = targetHeaders.indexOf(targetRuleHeader) + 1;
      if (targetRuleHeaderIndex > 0) {
        var targetRuleRange = targetSheet.getRange(targetHeaderRow + 1, targetRuleHeaderIndex, targetColumnLength, 1);
        targetRuleRanges.push(targetRuleRange);
      }
    }
    var copiedRule = referenceRule.copy();
    copiedRule.setRanges(targetRuleRanges); 
    targetFormatRules.push(copiedRule);
  }
  for (var i = 0; i < referenceHeaders.length; i++) {
    var referenceHeader = referenceHeaders[i];
    var referenceHeaderLetter = getColumnLetterFromIndex(i + 1);
    var targetHeaderIndex = targetHeaders.indexOf(referenceHeader) + 1;
    var targetHeaderLetter = getColumnLetterFromIndex(targetHeaderIndex);
    if (targetHeaderIndex > 0) {
      for (var j = 0; j < referenceColumnLength; j++) {
        var targetRule = null;
        var referenceRowIndex = j + referenceHeaderRow + 1;
        var referenceCellRange = referenceSheet.getRange(referenceRowIndex, i + 1, 1, 1);
        var referenceCellValue = referenceCellRange.getValue();
        if (referenceCellValue) {
          var background = referenceCellRange.getBackground();
          var fontWeight = referenceCellRange.getFontWeight();
          var fontColor = referenceCellRange.getFontColor();
          var fontStyle = referenceCellRange.getFontStyle();
          var fontLine = referenceCellRange.getFontLine();
          if ((background != "#ffffff") || (fontWeight === "bold") || (fontColor != "#000000") || (fontStyle === "italic") || (fontLine != "none")) {
                targetRule = SpreadsheetApp.newConditionalFormatRule()
                .setRanges([targetSheet.getRange(1, targetHeaderIndex, targetSheet.getMaxRows(), 1)])
                .whenFormulaSatisfied('=(' + targetHeaderLetter + '1=INDIRECT("' + referenceSheetName + '!' + referenceHeaderLetter + "$" + referenceRowIndex + '", TRUE))')
                .setBackground(background)
                .setBold((fontWeight === "bold"))
                .setFontColor(fontColor)
                .setItalic((fontStyle === "italic"))
                .setStrikethrough((fontLine === "line-through"))
                .setUnderline((fontLine === "underline"))
                .build();
                targetFormatRules.push(targetRule);
          }
        }
      }
    }
  }
  return targetFormatRules;
}
  
function getDefaultReferenceFormatRules(sheet, headerRow) {
  var headers = getRowValues(sheet, headerRow);
  //A = First Name
  var firstNameColumnIndex = headers.indexOf("First Name") + 1;
  var firstNameLetter = getColumnLetterFromIndex(firstNameColumnIndex);
  //B = Last Name
  var lastNameColumnIndex = headers.indexOf("Last Name") + 1;
  var lastNameLetter = getColumnLetterFromIndex(lastNameColumnIndex);
  //C = Pronouns
  //D = Email
  var emailColumnIndex = headers.indexOf("Email") + 1;
  var emailLetter = getColumnLetterFromIndex(emailColumnIndex);
  //E = Phone
  var phoneColumnIndex = headers.indexOf("Phone Number") + 1;
  var phoneLetter = getColumnLetterFromIndex(phoneColumnIndex);
  //F = Hub Role
  //G = First Action
  //H = Date of First Action
  //I = Ladder Status
  var ladderStatusColumnIndex = headers.indexOf("Ladder Status") + 1;
  var ladderStatusLetter = getColumnLetterFromIndex(ladderStatusColumnIndex);
  //J = Action Network Tags
  //K = Date of Last Call
  //L = Number Dialed on Last Call
  //M = Request of Last Call
  //N = Outcome of Last Call
  var lastCallOutcomeColumnIndex = headers.indexOf("Outcome of Last Call") + 1;
  var lastCallOutcomeLetter = getColumnLetterFromIndex(lastCallOutcomeColumnIndex);
  //O = Sunrise 101 - Date Completed
  //P = Sunrise Leadership Training - Date Completed

  var rule = null;
  var formula = "";
  var rules = [];
  var ranges = [];
  
  ranges = [
    sheet.getRange(headerRow , firstNameColumnIndex, 1, 1),
    sheet.getRange(headerRow, lastNameColumnIndex, 1, 1),
    sheet.getRange(headerRow, emailColumnIndex, 1, 1),
    sheet.getRange(headerRow, phoneColumnIndex, 1, 1)
    ];
  formula = '=(INDIRECT("Volunteers!P:P")=INDIRECT("Reference!{0}$4"))';
  formula = formula.replace(/{0}/g, lastCallOutcomeLetter);
  rule = SpreadsheetApp.newConditionalFormatRule()
  .whenFormulaSatisfied(formula)
  .setStrikethrough(true)
  .setBackground(getSetting("GoogleSheets.Color.RedBerry"))
  .setRanges(ranges)
  .build();
  rules.push(rule);
  
  ranges = [
    sheet.getRange(headerRow, phoneColumnIndex, 1, 1)
    ];
  formula = '=(INDIRECT("Volunteers!P:P")=INDIRECT("Reference!{0}$5"))';
  formula = formula.replace(/{0}/g, lastCallOutcomeLetter);
  rule = SpreadsheetApp.newConditionalFormatRule()
  .whenFormulaSatisfied(formula)
  .setBackground(getSetting("GoogleSheets.Color.OrangeLight1"))
  .setRanges(ranges)
  .build();
  rules.push(rule);
    
  ranges = [
    sheet.getRange(headerRow, phoneColumnIndex, 1, 1)
    ];
  formula = '=(INDIRECT("Volunteers!P:P")=INDIRECT("Reference!{0}$3"))';
  formula = formula.replace(/{0}/g, lastCallOutcomeLetter);
  rule = SpreadsheetApp.newConditionalFormatRule()
  .whenFormulaSatisfied(formula)
  .setBackground(getSetting("GoogleSheets.Color.YellowLight1"))
  .setRanges(ranges)
  .build();
  rules.push(rule);
  
  ranges = [
    sheet.getRange(headerRow, firstNameColumnIndex, 1, 1),
    sheet.getRange(headerRow, lastNameColumnIndex, 1, 1),
    sheet.getRange(headerRow, emailColumnIndex, 1, 1),
    sheet.getRange(headerRow, phoneColumnIndex, 1, 1)
    ];
  formula = '=(INDIRECT("Volunteers!K:K")=INDIRECT("Reference!{0}$2"))';
  formula = formula.replace(/{0}/g, ladderStatusLetter);
  rule = SpreadsheetApp.newConditionalFormatRule()
  .whenFormulaSatisfied(formula)
  .setStrikethrough(true)
  .setRanges(ranges)
  .build();
  rules.push(rule);
  
  ranges = [
    sheet.getRange(headerRow, firstNameColumnIndex, 1, 1),
    sheet.getRange(headerRow, lastNameColumnIndex, 1, 1),
    sheet.getRange(headerRow, emailColumnIndex, 1, 1),
    sheet.getRange(headerRow, phoneColumnIndex, 1, 1)
    ];
  formula = '=AND(OR(INDIRECT("Volunteers!K:K")=INDIRECT("Reference!{0}$4"),INDIRECT("Volunteers!K1:K")=INDIRECT("Reference!{0}$3")),OR(INDIRECT("Volunteers!P1:P")=INDIRECT("Reference!{1}$7"),INDIRECT("Volunteers!P1:P")=INDIRECT("Reference!{1}$8")))';
  formula = formula.replace(/{0}/g, ladderStatusLetter);
  formula = formula.replace(/{1}/g, lastCallOutcomeLetter);
  rule = SpreadsheetApp.newConditionalFormatRule()
  .whenFormulaSatisfied(formula)
  .setBold(true)
  .setItalic(true)
  .setRanges(ranges)
  .build();
  rules.push(rule);  

  return rules;
}

function setReferenceValidationRulesByHeaders(targetSheet, targetHeaderRow, referenceSheet, referenceHeaderRow) {
  var targetHeaderFormulas = getRowFormulas(targetSheet, 1);
  var targetHeaderValues = getRowValues(targetSheet, targetHeaderRow);
  var targetColumnLength = targetSheet.getMaxRows() - targetHeaderRow;
  var referenceColumnLength = referenceSheet.getLastRow() - referenceHeaderRow;
  var referenceHeaders = getRowValues(referenceSheet, referenceHeaderRow);
  for (var i = 0; i < referenceHeaders.length; i++) {
    var referenceHeader = referenceHeaders[i];
    var targetHeaderIndex = targetHeaderValues.indexOf(referenceHeader) + 1;
    if (targetHeaderIndex > 0) {
      var targetHeaderFormula = targetHeaderFormulas[targetHeaderIndex - 1];
      if (targetHeaderFormula === "") {
        var listRange = referenceSheet.getRange(referenceHeaderRow + 1, i + 1, referenceColumnLength, 1);
        var sampleValue = listRange.getValues()[0][0];
        if (sampleValue != "") {
          var targetRange = targetSheet.getRange(targetHeaderRow + 1, targetHeaderIndex, targetColumnLength, 1);
          targetRange.clearDataValidations();
          var rule = SpreadsheetApp.newDataValidation()
          .requireValueInRange(listRange, true)
          .setAllowInvalid(true)
          .build();
          targetRange.setDataValidation(rule);
        }
      }
    }
  }
  return true;
}

function setTypeValidationRulesByHeaders(targetSheet, targetHeaderRow) {
  var targetHeaderValues = getRowValues(targetSheet, targetHeaderRow);
  var targetColumnLength = targetSheet.getMaxRows() - targetHeaderRow;
  var entryColumns = getEntryColumns();
  for (var i = 0; i < targetHeaderValues.length; i++) {
    var columnIndex = i + 1;
    var columnHeader = targetHeaderValues[i];
    if (entryColumns.indexOf(columnHeader) > -1) {
      var columnHeaderLower = columnHeader.toLowerCase()
      if (columnHeaderLower.indexOf('date ') > -1 || columnHeaderLower.indexOf(' date') > -1 || columnHeaderLower === 'date') {
        var columnRange = targetSheet.getRange(targetHeaderRow + 1, columnIndex, targetColumnLength, 1);
        var rule = SpreadsheetApp.newDataValidation()
        .requireDate()
        .setAllowInvalid(true)
        .build();
        columnRange.setDataValidation(rule);
      }
      if (columnHeaderLower.indexOf('number ') > -1 || columnHeaderLower.indexOf(' number') > -1 || columnHeaderLower === 'number') {
        var columnRange = targetSheet.getRange(targetHeaderRow + 1, columnIndex, targetColumnLength, 1);
        var rule = SpreadsheetApp.newDataValidation()
        .requireNumberBetween(1000000000, 10000000000)
        .setAllowInvalid(true)
        .build();
        columnRange.setDataValidation(rule);
      }
    }
  }
  return true;
}

function formatHeaders(targetSheet, targetHeaderRow) {
  var targetHeaderValues = getRowValues(targetSheet, targetHeaderRow);
  var entryColumns = getEntryColumns();
  for (var i = 0; i < targetHeaderValues.length; i++) {
    var columnHeader = targetHeaderValues[i];
    if (entryColumns.indexOf(columnHeader) > -1) {
      var columnIndex = i + 1;
      var columnRange = targetSheet.getRange(targetHeaderRow, columnIndex, 1, 1);
      columnRange.setBackground(getSetting("GoogleSheets.Color.OrangeLight3"));
    }
  }
  return true;
}

function setAllConditionalFormatRules(sheet, headerRow, referenceSheet, referenceHeaderRow) {
  var rules = [];
  rules = rules.concat(getDuplicateFormatRules(sheet, headerRow));
  rules = rules.concat(getReferenceFormatRulesByHeaders(sheet, headerRow, referenceSheet, referenceHeaderRow));
  sheet.setConditionalFormatRules(rules);
  return true;
}

function generateTrackingSpreadsheet() {
  var headerRow = 1;
  var spreadsheetId = getSpreadsheetId();
  createSheets(spreadsheetId);
  var referenceSheet = openSheet("Reference");
  var volunteersSheet = openSheet("Volunteers");
  var refSetup = setupReferenceSheet(referenceSheet);
  var volSetup = setupSheet(volunteersSheet, getVolunteersSetupInfo());
  copyPeople(spreadsheetId);
  var volConFormat = setAllConditionalFormatRules(volunteersSheet, headerRow, referenceSheet, 1);
  var volFormat = formatHeaders(volunteersSheet, headerRow);
  var volReferenceValidation = setReferenceValidationRulesByHeaders(volunteersSheet, headerRow, referenceSheet, 1);
  var volTypeValidation = setTypeValidationRulesByHeaders(volunteersSheet, headerRow);
  if (refSetup && volSetup && volConFormat && volFormat && volReferenceValidation && volTypeValidation) {
    setDailyPullTrigger();
    setSetting("Sunrise.VolunteerTracking.PullingData", "false");
    return true;
  }
  return false;
}

function readyToGenerate() {
  var settings = getAllSettings();
  var peoplePulled = settings["Sunrise.VolunteerTracking.PeoplePulled"];
  var tagsPulled = settings["Sunrise.VolunteerTracking.TagsPulled"];
  var eventsPulled = settings["Sunrise.VolunteerTracking.EventsPulled"];
  var formsPulled = settings["Sunrise.VolunteerTracking.FormsPulled"];
  var taggingsPulled = settings["Sunrise.VolunteerTracking.TaggingsPulled"];
  var attendancesPulled = settings["Sunrise.VolunteerTracking.AttendancesPulled"];
  var submissionsPulled = settings["Sunrise.VolunteerTracking.SubmissionsPulled"];
  if ((peoplePulled !== "") &&
      (tagsPulled !== "") &&
      (eventsPulled !== "") &&
      (formsPulled !== "") &&
      (taggingsPulled !== "") &&
      (attendancesPulled !== "") &&
      (submissionsPulled !== ""))     {
    return true;
  }
  return false;
}

function generateTrackingSpreadsheetOnTrigger() {
  deleteFunctionTrigger("generateTrackingSpreadsheetOnTrigger");
  if (readyToGenerate()) {
    generateTrackingSpreadsheet();
    setDailyPullTrigger();
    return true;
  }
  ScriptApp.newTrigger("generateTrackingSpreadsheetOnTrigger")
  .timeBased()
  .after(60 * 1000)
  .create();
  return null;
}
