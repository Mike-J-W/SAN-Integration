function displayWarning(message) {
  var spreadsheetId = getSetting("Sunrise.VolunteerTracking.SpreadsheetID");
  var volunteerSheet = openSheet("Volunteers");
  if (message === "") {
    var cellRange = volunteerSheet.getRange("C1");
    var cellValue = cellRange.getValue();
    if (cellValue !== "Last Name") {
      volunteerSheet.deleteRow(1);
    }
    return true;
  }
  var cellRange = volunteerSheet.getRange("B1");
  var cellValue = cellRange.getValue();
  if (cellValue === "First Name") {
    volunteerSheet.insertRowBefore(1);
  }
  cellRange = volunteerSheet.getRange("B1");
  cellRange.setValue(message);
  cellRange.setFontColor(getSetting("GoogleSheets.Color.Red"));
  cellRange.setFontWeight("bold");
  return true;
}

function compareValuesByUpdateTime(liveObjectsById, rawObjectsById, keyTranslator, useUpdates) {
  var newObjectValuesById = {};
  for (var liveId in liveObjectsById) {
    var liveObject = liveObjectsById[liveId];
    var rawObject = rawObjectsById[liveId];
    var rawDateModified = rawObject["DateModified"];
    var newObjectValues = {};
    if (rawObject != undefined) {
      for(var liveKey in liveObject) {
        var considerValue = true;
        if (useUpdates) {
          var liveUpdateKey = liveKey + " Updated";
          var liveUpdateValue = liveObject[liveUpdateKey];
          if (liveUpdateValue != "" && liveUpdateValue < rawDateModified) {
            considerValue = false;
          }
        }
        if (considerValue) {
          var rawKey = keyTranslator[liveKey];
          var liveValue = liveObject[liveKey];
          var rawValue = rawObject[rawKey];
          if (rawValue != undefined) {
            if (liveValue != rawValue) {
              newObjectValues[rawKey] = liveValue;
            }
          }
        }
      }
    }
    if (newObjectValues != {}) {
      newObjectValuesById[liveId] = newObjectValues;
    }
  }
  return newObjectValuesById;
}

function compareValues(liveObjectsById, rawObjectsById, keyTranslator) {
  var volunteersSheet = openSheet("Volunteers");
  var newObjectValuesById = {};
  for (var liveId in liveObjectsById) {
    var liveObject = liveObjectsById[liveId];
    var rawObject = rawObjectsById[liveId];
    var newObjectValues = {};
    if (rawObject != undefined) {
      for(var liveKey in liveObject) {
        var rawKey = keyTranslator[liveKey];
        var liveValue = liveObject[liveKey];
        var rawValue = rawObject[rawKey];
        if (rawValue != undefined) {
          if (liveValue != rawValue) {
//            if (liveValue === "") {
//              liveValue = "Unknown";
//              setCellValueByHeaderAndRowID(volunteersSheet, 1, liveKey, liveId, "Unknown");
//            }
            newObjectValues[rawKey] = liveValue;
          }
        }
      }
    }
    if (newObjectValues != {}) {
      newObjectValuesById[liveId] = newObjectValues;
    }
  }
  return newObjectValuesById;
}

function postCallFormSubmission(peopleSheet, personId, personSubmissionInfo) {
  var formId = getSetting("ActionNetwork.Form.PhoneOutreach.ID");
  var personEmail = getCellValueByHeaderAndRowId(peopleSheet, 1, "EmailAddress", personId);
  var personData = {
    "email_addresses": [{"address": personEmail}],
    "custom_fields": personSubmissionInfo
  };
  var response = postSubmission(formId, personData, {}, false);
  return response;
}

function constructPersonData(personId, personSubmissionInfo) {
  var personData = {
    "identifiers": ["action_network:" + personId],
    "custom_fields": personSubmissionInfo
  };
  return personData;
}

function getUpdateableColumns() {
  var columnMappings = getVolunteerColumnHeaderMappings();
  var headerTranslator = {};
  var liveUpdateableColumns = [];
  var rawUpdateableColumns = [];
  for (var i = 0; i < columnMappings.length; i++) {
    var mapping = columnMappings[i];
    if (mapping["updateable"] === true) {
      headerTranslator[mapping["column"]] = mapping["field"];
      liveUpdateableColumns.push(mapping["column"]);
      rawUpdateableColumns.push(mapping["field"]);
    }
  }
  return [liveUpdateableColumns, rawUpdateableColumns, headerTranslator];
}

function getCallFormColumns() {
  var columnMappings = getVolunteerColumnHeaderMappings();
  var headerTranslator = {};
  var liveCallColumns = [];
  var rawCallColumns = [];
  for (var i = 0; i < columnMappings.length; i++) {
    var mapping = columnMappings[i];
    if (mapping["call_form_field"] === true) {
      headerTranslator[mapping["column"]] = mapping["field"];
      liveCallColumns.push(mapping["column"]);
      rawCallColumns.push(mapping["field"]);
    }
  }
  return [liveCallColumns, rawCallColumns, headerTranslator];
}

function getSheetChanges(liveSheet, liveHeaderRow, rawSheet, rawHeaderRow, changeType) {
  var anIdHeader = "ActionNetworkID";
  var columnInfo = null;
  if (changeType === "VolunteerUpdate") {
    columnInfo = getUpdateableColumns();
  }
  else if (changeType === "CallForm") {
    columnInfo = getCallFormColumns();
  }
  else {
    return null;
  }
  var liveChangeColumns = columnInfo[0];
  var rawChangeColumns = columnInfo[1];
  var headerTranslator = columnInfo[2];
  var liveValues = getColumnsDataWithId(liveSheet, liveHeaderRow, liveChangeColumns, "dict", true);
  var rawValues = getColumnsDataWithId(rawSheet, rawHeaderRow, rawChangeColumns, "dict", true);
  var differences = compareValues(liveValues, rawValues, headerTranslator);
  return differences;
}

function updateFields(startTime) {
  if (!(checkHealth())) {
    return false;
  }
  var headerRow = 1;
//  var lastFieldUpdate = new Date(getSetting("Sunrise.VolunteerTracking.FieldsUpdated"));
//  var lastMemberFieldUpdate = getSetting("Sunrise.VolunteerTracking.MemberFieldsUpdated");
//  if (lastMemberFieldUpdate - lastFieldUpdate < 0) {
//    return null;
//  }
  var sourceSheet = openSheet("People");
  var volunteerSheet = openSheet("Volunteers");
  var volunteerDifferences = getSheetChanges(volunteerSheet, headerRow, sourceSheet, 1, "VolunteerUpdate");
  var allDifferences = {};
  var personIds = Object.keys(volunteerDifferences);
  for (var i = 0; i < personIds.length; i++) {
    var id = personIds[i];
    var personData = volunteerDifferences[id];
    if (personData != undefined && Object.keys(personData).length > 0) {
      allDifferences[id] = personData;
    }
  }
  for (var personId in allDifferences) {
    console.log(personId);
    var response = putCustomFieldsToPerson(personId, allDifferences[personId]);
    console.log(response);
    if ("custom_fields" in response) {
      updatePersonInSheet(response);
    }
    var currentTime = new Date();
    if (startTime != undefined) {
      var elaspedTime = currentTime - startTime;
      if (elaspedTime > (330 * 1000)) {
        return false;
      }
    }
  }
  var now = new Date();
  now.setMinutes(now.getMinutes() + 5);
  setSetting("Sunrise.VolunteerTracking.FieldsUpdated", now.toISOString());
  setDailyPullTrigger();
  return true;
}

function submitCallForm(startTime) {
  if (!(checkHealth())) {
    return false;
  }
  var headerRow = 1;
//  var lastSubmission = new Date(getSetting("Sunrise.VolunteerTracking.CallFormSubmitted"));
//  var lastCallFieldUpdate = getSetting("Sunrise.VolunteerTracking.CallFieldsUpdated");
//  if (lastCallFieldUpdate - lastSubmission < 0) {
//    return null;
//  }
  var sourceSheet = openSheet("People");
  var dataSheet = openSheet("Volunteers");
  var callDifferences = getSheetChanges(dataSheet, headerRow, sourceSheet, 1, "CallForm");
  var submissionInfo = {};
  var personIds = Object.keys(callDifferences);
  for (var i = 0; i < personIds.length; i++) {
    var id = personIds[i];
    var callData = callDifferences[id];
    if (callData != undefined && Object.keys(callData).length > 0) {
      submissionInfo[id] = callData;
    }
  }
  for (var personId in submissionInfo) {
    var personSubmissionInfo = submissionInfo[personId];
    var response = postCallFormSubmission(sourceSheet, personId, personSubmissionInfo);
    if ("action_network:person_id" in response) {
      appendSubmissionToSheet(response);
      updatePersonInSheet(constructPersonData(personId, personSubmissionInfo));
    }
    var currentTime = new Date();
    if (startTime != undefined) {
      var elaspedTime = currentTime - startTime;
      if (elaspedTime > (330 * 1000)) {
        return false;
      }
    }
  }
  var now = new Date();
  now.setMinutes(now.getMinutes() + 5);
  setSetting("Sunrise.VolunteerTracking.CallFormSubmitted", now.toISOString());
  setSetting("Sunrise.VolunteerTracking.PushingData", "false");
  setDailyPullTrigger();
  return true;
}

function checkHealth() {
  var settings = getAllSettings();
  var now = new Date();
  var peoplePulled = new Date(settings["Sunrise.VolunteerTracking.PeoplePulled"]);
  var tagsPulled = new Date(settings["Sunrise.VolunteerTracking.TagsPulled"]);
  var eventsPulled = new Date(settings["Sunrise.VolunteerTracking.EventsPulled"]);
  var formsPulled = new Date(settings["Sunrise.VolunteerTracking.FormsPulled"]);
  var taggingsPulled = new Date(settings["Sunrise.VolunteerTracking.TaggingsPulled"]);
  var attendancesPulled = new Date(settings["Sunrise.VolunteerTracking.AttendancesPulled"]);
  var submissionsPulled = new Date(settings["Sunrise.VolunteerTracking.SubmissionsPulled"]);
  var peopleCopied = new Date(settings["Sunrise.VolunteerTracking.PeopleCopied"]);
  if ((now - peoplePulled > 90000000) ||
      (now - tagsPulled > 90000000) ||
      (now - eventsPulled > 90000000) ||
      (now - formsPulled > 90000000) ||
      (now - taggingsPulled > 90000000) ||
      (now - attendancesPulled > 90000000) ||
      (now - submissionsPulled > 90000000) ||
      (now - peopleCopied > 90000000))        {
    displayWarning("ATTN: Changes will not be saved! Spreadsheet is not in sync with Action Network. Contact sunrise.dc.datamanager@gmail.com if problem persists tomorrow.");
    return false;
  }
  return true;
}

function pushData() {
  var now = new Date();
  deleteClockTriggers();
  var finishedUpdates = updateFields(now);
  if (finishedUpdates) {
    var finishedSubmissions = submitCallForm(now);
    if (finishedSubmissions) {
      setDailyPullTrigger();
      var ui = SpreadsheetApp.getUi();
      ui.alert('Your data push has finished.');
      return true;
    }
  }
  ScriptApp.newTrigger("pushData")
  .timeBased()
  .after(10 * 1000)
  .create();
  return false;
}

function setPushTrigger() {
  deleteClockTriggers();
  setSetting("Sunrise.VolunteerTracking.PushingData", "true");
  ScriptApp.newTrigger("pushData")
  .timeBased()
  .after(10 * 1000)
  .create();
}
