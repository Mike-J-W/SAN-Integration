function getKeyBase() {
  return "Sunrise.VolunteerTracking.Session";
}

function getCreatedKeyBase() {
  return getKeyBase() + ".DateCreated|";
}

function getEditedKeyBase() {
  return getKeyBase() + ".DateLastEdited|";
}

function getClosedKeyBase() {
  return getKeyBase() + ".DateClosed|";
}

function hasOpenSession(userId) {
  var openUsers = getUsersWithOpenSessions();
  if (userId in openUsers) {
    return true;
  }
  return false;
}

function openSession(userId, isFromEdit) {
  var dateCreatedKey = getCreatedKeyBase() + userId;
  var dateLastEditKey = getEditedKeyBase() + userId;
  var dateClosedKey = getClosedKeyBase() + userId;
  var now = new Date();
  setSetting(dateCreatedKey, now);
  if (isFromEdit) {
    setSetting(dateLastEditKey, now);
  }
  else {
    setSetting(dateLastEditKey, "");
  }
  setSetting(dateClosedKey, "");
}

function updateSession(userId) {
  var editKey = getEditedKeyBase() + userId;
  var now = new Date();
  setSetting(editKey, now);
}

function updateSessionSafe(userId) {
  var hasSession = hasOpenSession(userId);
  if (!(hasSession)) {
    openSession(userId, true);
    return;
  }
  updateSession(userId);
}

function closeSession(userId) {
  var dateClosedKey = getClosedKeyBase() + userId;
  var now = new Date();
  setSetting(dateClosedKey, now);
}

function getAllSessionSettings() {
  var sessionSettings = getSettingsStartWith(getKeyBase());
  return sessionSettings;
}

function getUsersWithOpenSessions() {
  var users = [];
  var sessionSettings = getAllSessionSettings();
  var sessionCreations = {};
  var sessionClosures = {};
  for (var key in sessionSettings) {
    if (key.lastIndexOf(getCreatedKeyBase()) === 0) {
      sessionCreations[key.split('|')[1]] = sessionSettings[key];
    }
    else if (key.lastIndexOf(getClosedKeyBase()) === 0) {
      sessionClosures[key.split('|')[1]] = sessionSettings[key];
    }
  }
  for (var userId in sessionCreations) {
    var closure = sessionClosures[userId];
    if (closure === "") {
      users.push(userId);
    }
  }
  return users;
}

function closeAllSessions() {
  var openUsers = getUsersWithOpenSessions();
  var now = new Date();
  for (var i = 0; i < openUsers.length; i++) {
    var userId = openUsers[i];
    var closeSetting = getClosedKeyBase() + userId;
    setSetting(closeSetting, now);
  }
}
