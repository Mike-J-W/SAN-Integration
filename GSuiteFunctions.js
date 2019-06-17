function getSpreadsheetId() {
  var sunriseFolder = getFirstFolder(getSunriseFolderName());
  var spreadsheet = getFirstFileInFolder(sunriseFolder, getTrackingSpreadsheetName());
  return spreadsheet.getId();
}

function getSetting(settingName) {
  var settingsSheet = openSheet("Settings", true);
  var settings = settingsSheet.getDataRange().getValues();
  for (var i = 0; i < settings.length; i++) {
    if (settings[i][0] === settingName) {
      return settings[i][1];
    }
  }
  return null;
}

function getAllSettings() {
  var settingsSheet = openSheet("Settings", true);
  var data = settingsSheet.getDataRange().getValues;
  var settings = {};
  for (var i = 0; i < data.length; i++) {
    settings[data[i][0]] = data[i][1];
  }
  return settings;
}

function getSettingsStartWith(startsWith) {
  var settingsSheet = openSheet("Settings", true);
  var data = settingsSheet.getDataRange().getValues();
  var settings = {};
  for (var i = 0; i < data.length; i++) {
    var key = data[i][0];
    if (key.lastIndexOf(startsWith) === 0) {
      settings[key] = data[i][1];
    }
  }
  return settings;
}

function setSetting(settingName, settingValue) {
  var settingsSheet = openSheet("Settings", true);
  var settings = settingsSheet.getDataRange().getValues();
  var settingSet = false;
  for (var i = 0; i < settings.length; i++) {
    if (settings[i][0] === settingName) {
      var settingValueRange = settingsSheet.getRange(i + 1, 2, 1, 1);
      settingValueRange.setValue(settingValue);
      settingSet = true;
    }
  }
  if (!(settingSet)) {
    settingsSheet.appendRow([settingName, settingValue]);
  }
  return null;
}

function getColumnLetterFromIndex(index) {
  return String.fromCharCode(64 + index);
}

function dumpIntoSheet(sheet, fields, data) {
  sheet.clear({contentsOnly: true});
  sheet.setFrozenRows(fields.length);
  var headerRange = sheet.getRange(1, 1, fields.length, fields[0].length);
  headerRange.setValues(fields);
  var dataRange = sheet.getRange(fields.length + 1, 1, data.length, fields[0].length);
  dataRange.setValues(data);
  return null;
}

function dumpOntoSheet(sheet, fields, data) {
  var headerRange = sheet.getRange(1, 1, fields.length, fields[0].length);
  var headerData = headerRange.getValues()[0];
  var fieldData = fields[0];
  for (var i = 0; i < fieldData.length; i++) {
    if (fieldData[i] !== headerData[i]) {
      return false;
    }
  }
  var lastDataRow = sheet.getLastRow();
  var maxRow = sheet.getMaxRows();
  if ((maxRow - lastDataRow) < data.length) {
    sheet.insertRowsAfter(lastDataRow, data.length);
  }
  var newDataRange = sheet.getRange(lastDataRow + 1, 1, data.length, fieldData.length);
  newDataRange.setValues(data);
  return true;
}  

function appendToSheet(sheet, headerRow, fields, data) {
  var headers = getRowValues(sheet, headerRow);
  if (headers.length === fields.length && headers[0] === fields[0] && headers[-1] === fields[-1]) {
    sheet.appendRow(data);
  }
  else if (fields[0] === "ActionNetworkID") {
    sheet.appendRow(data[0]);
    updateRowById(sheet, headerRow, fields, data);
  }
  return null;
}

function openSheet(sheetName, activate) {
  var spreadsheetId = getSpreadsheetId();
  var spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  var sheet = spreadsheet.getSheetByName(sheetName);
  if (activate) {
    SpreadsheetApp.setActiveSpreadsheet(spreadsheet);
    SpreadsheetApp.setActiveSheet(sheet);
  }
  return sheet;
}

function addConditionalFormatRules(sheet, newRules) {
  var rules = sheet.getConditionalFormatRules();
  for (var i = 0; i < newRules.length; i++) {
    rules.push(newRules[i]);
  }
  sheet.setConditionalFormatRules(rules);
  return null;
}

function getRowValues(sheet, rowIndex) {
  return sheet.getSheetValues(rowIndex, 1, 1, sheet.getLastColumn())[0];
}

function getRowFormulas(sheet, rowIndex) {
  var range = sheet.getRange(rowIndex, 1, 1, sheet.getLastColumn());
  return range.getFormulas()[0];
}

function getColumnData(sheet, headerRow, columnName) {
  var headers = getRowValues(sheet, headerRow);
  var columnIndex = null;
  for (var i = 0; i < headers.length; i++) {
    if (headers[i] === columnName) {
      columnIndex = i + 1;
    }
  }
  if (columnIndex === null) {
    return null;
  }
  var dataRange = sheet.getRange(headerRow + 1, columnIndex, sheet.getLastRow() - headerRow, 1);
  var data = dataRange.getValues();
  return data;
}

function getColumnsDataWithId(sheet, headerRow, columnNames, dataFormat, includeUpdates) {
  var headers = getRowValues(sheet, headerRow);
  var columnIndices = [];
  for (var i = 0; i < columnNames.length; i++) {
    var index = headers.indexOf(columnNames[i]);
    if (index != -1) {
      columnIndices.push(index);
    }
  }
  var dataRange = sheet.getRange(headerRow + 1, 1, sheet.getLastRow() - headerRow, sheet.getLastColumn());
  var data = dataRange.getValues();
  var columnsDataWithId = {};
  if (dataFormat === "list") {
    columnsDataWithId = [];
  }
  for (var i = 0; i < data.length; i++) {
    var row = data[i];
    var id = row[0];
    var idData = {};
    if (dataFormat === "list") {
      idData = [id];
    }
    for (var j = 0; j < columnIndices.length; j++) {
      var columnIndex = columnIndices[j];
      var header = headers[columnIndex];
      var columnValue = row[columnIndex];
      if (dataFormat === "list") {
        idData.push(columnValue);
      }
      else if (dataFormat === "dict") {
        idData[header] = columnValue;
        if (includeUpdates && headers[columnIndex + 1] === header + " Updated") {
          idData[header + " Updated"] = row[columnIndex + 1];
        }
      }
      else {
        return null;
      }
    }
    if (dataFormat === "list") {
      columnsDataWithId.push(idData);
    }
    else {
      columnsDataWithId[id] = idData;
    }
  }
  return columnsDataWithId;
}

function setColumnData(sourceData, targetSheet, targetHeaderRow, targetColumnName) {
  var targetHeaders = getRowValues(targetSheet, targetHeaderRow);
  var targetColumnIndex = null;
  for (var i = 0; i < targetHeaders.length; i++) {
    if (targetHeaders[i] === targetColumnName) {
      targetColumnIndex = i + 1;
    }
  }  
  if (targetColumnIndex === null) {
    return null;
  }
  var columnRange = targetSheet.getRange(targetHeaderRow + 1, targetColumnIndex, targetSheet.getLastRow(), 1);
  columnRange.clearContent();
  var targetRange = targetSheet.getRange(targetHeaderRow + 1, targetColumnIndex, sourceData.length, 1);
  targetRange.setValues(sourceData);
  return null;
}

function getDictsFromSheet(sheet, headerRow, keyName, valueNames) {
  var headers = getRowValues(sheet, headerRow);
  var keyIndex = headers.indexOf(keyName);
  var valueIndices = [];
  for (var i = 0; i < valueNames.length; i++) {
    var valueIndex = headers.indexOf(valueNames[i]);
    if (valueIndex === -1 ) {
      return null;
    }
    valueIndices.push(valueIndex);
  }
  var data = sheet.getRange(headerRow + 1, 1, sheet.getLastRow() - headerRow, sheet.getLastColumn()).getValues();
  var objects = {};
  for (var i = 0; i < data.length; i++) {
    var objectKey = data[i][keyIndex];
    var objectData = [];
    for (var j = 0; j < valueIndices.length; j++) {
      objectData.push(data[i][valueIndices[j]]);
    }
    objects[objectKey] = objectData;
  }
  return objects;
}

function setSheetFromDicts(sheet, headerRow, keyName, valueNames, dicts) {
  var headers = getRowValues(sheet, headerRow);
  var valueColumnIndices = [];
  for (var i = 0; i < valueNames.length; i++) {
    var valueColumnIndex = headers.indexOf(valueNames[i]) + 1;
    if (valueColumnIndex === 0 ) {
      return null;
    }
    valueColumnIndices.push(valueColumnIndex);
  }
  var keysByRow = getColumnData(sheet, headerRow, keyName);
  var keys = [];
  for (var r = 0; r < keysByRow.length; r++) {
    keys.push(keysByRow[r][0]);
  }
  for (var key in dicts) {
    var values = dicts[key];
    var keyIndex = keys.indexOf(key);
    if (keyIndex != -1) {
      var keyRowIndex = keyIndex + headerRow + 1;
      for (var j = 0; j < valueColumnIndices.length; j++) {
        var range = sheet.getRange(keyRowIndex, valueColumnIndices[j], 1, 1);
        range.setValue(values[j]);
      }
    }
  }
  return null;
}

function getGroupedObjectsFromSheet(sheet, headerRow, groupingName, objectNames) {
  var headers = getRowValues(sheet, headerRow);
  var keyIndex = headers.indexOf(groupingName);
  var valueIndices = [];
  for (var i = 0; i < objectNames.length; i++) {
    valueIndices.push(headers.indexOf(objectNames[i]));
  }
  var data = sheet.getRange(headerRow + 1, 1, sheet.getLastRow() - headerRow, sheet.getLastColumn()).getValues();
  var groupedObjects = {};
  for (var i = 0; i < data.length; i++) {
    var objectKey = data[i][keyIndex];
    var objectValues = []
    for (var j = 0; j < valueIndices.length; j++) {
      objectValues.push(data[i][valueIndices[j]]);
    }
    if (!(objectKey in groupedObjects)) {
      groupedObjects[objectKey] = [];
    }
    groupedObjects[objectKey].push(objectValues);
  }
  return groupedObjects;
}  

function updateRowById(sheet, headerRow, fields, rowData) {
  var headers = getRowValues(sheet, headerRow);
  var rowId = rowData[0];
  var filteredRowData = [];
  for (var i = 0; i < headers.length; i++) {
    var header = headers[i];
    var rowDataIndex = fields.indexOf(header);
    if (rowDataIndex === -1) {
      filteredRowData.push("");
    }
    else {
      filteredRowData.push(rowData[rowDataIndex]);
    }
  }
  var idColumnValues = getColumnData(sheet, headerRow, "ActionNetworkID");
  var rowIndex = -1;
  for (var i = 0; i < idColumnValues.length; i++) {
    if (rowIndex === -1) {
      var idValue = idColumnValues[i][0];
      if (rowId === idValue) {
        rowIndex = i + 1 + headerRow;
      }
    }
  }
  if (rowIndex === -1) {
    return null;
  }
  var rowRange = sheet.getRange(rowIndex, 1, 1, sheet.getLastColumn());
  rowRange.setValues([filteredRowData]);
  return null;
}

function getCellValueByHeaderAndRowId(sheet, headerRow, columnName, rowId) {
  var headers = getRowValues(sheet, headerRow);
  var columnIndex = headers.indexOf(columnName) + 1;
  if (columnIndex === 0) {
    return null;
  }
  var columnData = getColumnsDataWithId(sheet, headerRow, [columnName], "dict", false);
  var cellData = columnData[rowId][columnName];
  return cellData;
} 

function getFirstFolder(folderName) {
  var folders = DriveApp.getFoldersByName(folderName);
  if (folders.hasNext()) {
    return folders.next();
  }
  return null;
}

function getFirstFolderInFolder(parentFolder, childFolderName) {
  var folders = parentFolder.getFoldersByName(childFolderName);
  if (folders.hasNext()) {
    return folders.next();
  }
  return null;
}
  
function getFirstFileInFolder(folder, fileName) {
  var files = folder.getFilesByName(fileName);
  if (files.hasNext()) {
    return files.next();
  }
  return null;
}

function deleteFunctionTrigger(functionName) {
  var allTriggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < allTriggers.length; i++) {
    var trigger = allTriggers[i];
    if (trigger.getHandlerFunction() === functionName) {
      ScriptApp.deleteTrigger(trigger);
    }
  }
  return null;
}

function deleteClockTriggers() {
  var allTriggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < allTriggers.length; i++) {
    if (allTriggers[i].getEventType() === ScriptApp.EventType.CLOCK) {
      var trigger = allTriggers[i];
      ScriptApp.deleteTrigger(trigger);
    }
  }
  return null;
}

function hasClockTrigger() {
  var allTriggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < allTriggers.length; i++) {
    if (allTriggers[i].getEventType() === ScriptApp.EventType.CLOCK) {
      return true;
    }
  }
  return false;
}

function userIsOwner() {
  var spreadsheetOwner = SpreadsheetApp.getActive().getOwner().getEmail();
  var activeUser = Session.getActiveUser().getEmail();
  if (spreadsheetOwner === activeUser) {
    return true;
  }
  return false;
}
