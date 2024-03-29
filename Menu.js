function onInstall(e) {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var id = spreadsheet.getId();
  setDocProperty('SpreadsheetID', id);
  onOpen(e);
}

function onOpen(e) {
  if (e && e.authMode == ScriptApp.AuthMode.NONE) {
    return;
  }
  if (userIsOwner()) {
    SpreadsheetApp.getUi()
    .createMenu('SAN Integration')
    .addItem('Mark End of Session', 'menuCloseUserSession')
    .addItem('Push Data to AN', 'menuPushData')
    .addSeparator()
    .addItem('Set Up Integration', 'menuSetUp')
    .addItem('Toggle Force Pushes', 'toggleForcePushes')
    .addSeparator()
    .addItem('Help', 'showHelp')
    .addToUi();
  }
  else {
    SpreadsheetApp.getUi()
    .createMenu('SAN Integration')
    .addItem('Mark End of Session', 'menuCloseUserSession')
    .addItem('Push Data to AN', 'menuPushData')
    .addSeparator()
    .addItem('Help', 'showHelp')
    .addToUi();
  }
  if (e && e.authMode == ScriptApp.AuthMode.FULL) {
    setDailyPullTrigger();
  }
}

function menuSetUp() {
  var ui = SpreadsheetApp.getUi();
  var apiResult = ui.prompt(
      'The Integration needs to authenticate to ActionNetwork',
      'Please enter your ActionNetwork API Key:',
      ui.ButtonSet.OK_CANCEL);
  // Process the user's response.
  var apiButton = apiResult.getSelectedButton();
  var apiKey = apiResult.getResponseText().trim();
  var validKey = false;
  if (apiKey.length === 32) {
    validKey = true;
  }
  if (apiButton == ui.Button.OK) {
    // User clicked "OK".
    if (validKey) {
      var formResult = ui.prompt(
        'The Integration also needs to be able to submit your Outreach form',
        'Please enter the "API Endpoint" for your Outreach form:',
        ui.ButtonSet.OK_CANCEL);
      var formButton = formResult.getSelectedButton();
      var formEndpoint = formResult.getResponseText().trim();
      var formId = "";
      var validId = false;
      if (formEndpoint.lastIndexOf("https://actionnetwork.org/api/") === 0) {
        var endpointPieces = formEndpoint.split('forms/');
        if (endpointPieces.length === 2) {
          var formId = endpointPieces[1].replace(/\//, '');
          validId = true;
        }
      }
      if (validId) {
        if (formButton == ui.Button.OK) {
          ui.alert('Thank you.\nUnfortunately, due to the inherent contraints ' + 
                   'of a Google Sheets add-on and of the ActionNetwork API, ' +
                   'the services to pull down your ActionNetwork data will ' + 
                   'take several hours. You will know this process is complete' + 
                   ' when the "Volunteers" sheet has content.');
          var spreadsheetId = SpreadsheetApp.getActive().getId();
          initializeIntegration(spreadsheetId, apiKey, formId);
        }
      }
      else {
        ui.alert('Invalid API endpoint. Please try again');
      }
    }
    else {
      ui.alert('Invalid key. Please try again');
    }
  } 
}

function menuPushData() {
  menuCloseUserSession();
  var openUsers = getUsersWithOpenSessions();
  var doPush = false;
  if (openUsers.length === 0) {
    doPush = true;
  }
  else {
    doPush = displayEditError(openUsers);
  }
  if (doPush) {
    var ui = SpreadsheetApp.getUi();
    var response = ui.alert('This process will take some time. If you are updating a handful ' +
                            'of records, it will take less than a minute. Updating 250 records' + 
                            ' may take 15 minutes. You will get an alert like this when the ' + 
                            'data push is complete. It is recommended that you not edit this ' +
                            'sheet until the process finishes. Press OK to continue.', ui.ButtonSet.OK_CANCEL);
    if (response === ui.Button.OK) {
      setPushTrigger();
    }
  }
}

function menuCloseUserSession() {
  var userId = Session.getActiveUser().getEmail();
  closeSession(userId);
}

function displayEditError(openUsers) {
  var title = 'Error: other users are editing';
  var prompt = '';
  for (var i = 0; i < openUsers.length; i++) {
    var user = openUsers[i];
    var dateCreated = getSetting(getCreatedKeyBase() + user);
    var dateEdited = getSetting(getEditedKeyBase() + user);
    prompt += 'User: ' + user + '\n - - Started: ' + dateCreated + '\n - - Last Edit: ' + dateEdited + '\n';
  }
  var ui = SpreadsheetApp.getUi();
  var buttons = ui.ButtonSet.OK;
  if (getSetting("Sunrise.VolunteerTracking.AllowForcePushes") === true) {
    prompt += '\nDo you wish to force the changes?'
    buttons = ui.ButtonSet.YES_NO;
  }
  var response = ui.alert(title, prompt, buttons);
  if (response === ui.Button.YES) {
    closeAllSessions();
    return true;
  }
  return false;
}

function testDisplayEditError() {
  var now = new Date();
  setSetting(getCreatedKeyBase() + 'user1', now);
  setSetting(getCreatedKeyBase() + 'user2', now);
  setSetting(getEditedKeyBase() + 'user2', now);
  displayEditError(['user1', 'user2']);
}

function showHelp() {
  var ui = SpreadsheetApp.getUi();
  ui.alert('For instructions, please visit https://sites.google.com/view/sunrise-an-integration/home/instructions\n' + 
           'If those cannot help you, please email sunrise.dc.datamanager@gmail.com');
}

function onEdit(e) {
  if (e && e.authMode == ScriptApp.AuthMode.NONE) {
    return;
  }
  var range = e.range;
  var sheet = range.getSheet();
  if (sheet.getName() === "Volunteers") {
    if (getSetting("Sunrise.VolunteerTracking.PullingData").toLowerCase() === "true") {
      var ui = SpreadsheetApp.getUi();
      ui.alert('The SAN Integration is currently pulling data from Action Network. ' + 
               'Any changes made before it finishes will not be preserved.');
    }
    var columnIndex = range.getColumn();
    var headerRange = sheet.getRange(1, columnIndex);
    var headerValue = headerRange.getValue();
    var memberColumns = getUpdateableColumns()[0];
    var callColumns = getCallFormColumns()[0];
    var now = new Date();
    if (memberColumns.indexOf(headerValue) > -1) {
      setSetting("Sunrise.VolunteerTracking.MemberFieldsUpdated", now.toISOString());
      updateSessionSafe(e.user.getEmail());
    }
    else if (callColumns.indexOf(headerValue) > -1) {
      setSetting("Sunrise.VolunteerTracking.CallFieldsUpdated", now.toISOString());
      updateSessionSafe(e.user.getEmail());
    }
  }
}

function test_onEdit() {
  var sheet = openSheet("Volunteers");
  var range = sheet.getRange(3, 13);
  var value = range.getValue();
  onEdit({
    user : Session.getActiveUser(),
    source : sheet,
    range : range,
    value : value,
    authMode : "LIMITED"
  });
}

function test_onInstall() {
  var sheet = SpreadsheetApp.getActiveSheet();
  var range = sheet.getRange(3, 13);
  var value = range.getValue();
  onInstall({
    user : Session.getActiveUser(),
    source : sheet,
    range : range,
    value : value,
    authMode : "FULL"
  });
}

function toggleForcePushes() {
  var ui = SpreadsheetApp.getUi();
  var force = getSetting("Sunrise.VolunteerTracking.AllowForcePushes");
  if (force === false) {
    var response = ui.alert('This will allow any user to force push changes from the Sheet to Action Network. Click OK to continue.', ui.ButtonSet.OK_CANCEL);
    if (response === ui.Button.OK) {
      setSetting("Sunrise.VolunteerTracking.AllowForcePushes", "true");
      ui.alert('Force pushing has been enabled for all users.');
    }
  }
  else {
    var response = ui.alert('This will prevent other users (but not you) from force pushing changes from the Sheet to Action Network. Click OK to continue.', ui.ButtonSet.OK_CANCEL);
    if (response === ui.Button.OK) {
      setSetting("Sunrise.VolunteerTracking.AllowForcePushes", "false");
      ui.alert('Force pushing has been disabled for all users other than you.');
    }
  }
}

