function getAttendances(referenceType, referenceId) {
  var attendancesData = {};
  var url = getSetting("ActionNetwork.Aep") + referenceType + "/" + referenceId + "/attendances";
  while (url) {
    var response = makeActionNetworkGetRequest(url);
    var attendances = response["_embedded"]["osdi:attendances"];
    for (var i = 0; i < attendances.length; i++) {
      var id = "";
      var ids = attendances[i]["identifiers"];
      for (var j = 0; j < ids.length; j++) {
        if (ids[j].lastIndexOf("action_network:", 0) === 0) {
          id = ids[j];
        }
      }
      attendancesData[id] = attendances[i];
    }
    var links = response["_links"];
    if ("next" in links) {
      url = links["next"]["href"];
    }
    else {
      url = null;
    }
  }
  return attendancesData;
}

function formatAttendances(rawAttendances) {
  var formattedAttendance = [];
  for (var rawAttendance in rawAttendances) {
    formattedAttendance.push(formatAttendanceInfo(rawAttendances[rawAttendance]));
  }
  return formattedAttendance;
}

function formatAttendanceInfo(attendance) {
  var info = {};
  if ("identifiers" in attendance) {
    var ids = attendance["identifiers"];
    for (var i = 0; i < ids.length; i++) {
      if (ids[i].lastIndexOf("action_network:", 0) === 0) {
        info["ActionNetworkID"] = ids[i].substring(15);
      }
    }
  }
  if ("status" in attendance) {
    info["Status"] = attendance["status"];
  }
  if ("action_network:person_id" in attendance) {
    info["ANPersonID"] = attendance["action_network:person_id"];
  }
  if ("action_network:event_id" in attendance) {
    info["ANEventID"] = attendance["action_network:event_id"];
  }
  if ("created_date" in attendance) {
    info["DateCreated"] = attendance["created_date"];
  }
  if ("modified_date" in attendance) {
    info["DateModified"] = attendance["modified_date"];
  }
  return info;
}

function getAllAttendances(referenceType, referenceIds) {
  var allAttendances = [];
  for (var i = 0; i < referenceIds.length; i++) {
    var referenceId = referenceIds[i][0];
    var attendances = getAttendances(referenceType, referenceId);
    var formattedAttendances = formatAttendances(attendances);
    for (var j = 0; j < formattedAttendances.length; j++) {
      allAttendances.push(formattedAttendances[j]);
    }
  }
  return allAttendances;
}

function getOrderedAttendances(attendances, fields) {
  var orderedAttendances = [];
  for (var p = 0; p < attendances.length; p++) {
    var attendance = attendances[p];
    var orderedAttendance = [];
    for (var f = 0; f < fields.length; f++) {
      var field = fields[f];
      if (field in attendance) {
        orderedAttendance.push(attendance[field]);
      }
      else {
        orderedAttendance.push("");
      }
    }
    orderedAttendances.push(orderedAttendance);
  }
  return orderedAttendances;
}

function pullAttendances() {
  var peopleSheet = openSheet("People");
  var personSample = peopleSheet.getRange("A2").getValue();
  if (personSample === "" || personSample === null) {
    pullPeople();
  }
  var peopleCount = peopleSheet.getLastRow();
  var eventsSheet = openSheet("Events");
  var eventSample = eventsSheet.getRange("A2").getValue();
  if (eventSample === "" || eventSample === null) {
    pullEvents();
  }
  var eventCount = eventsSheet.getLastRow();
  
  var referenceType = "events";
  var referenceIds = getColumnData(eventsSheet, 1, "ActionNetworkID");
  if (peopleCount < eventCount) {
    referenceType = "people";
    referenceIds = getColumnData(peopleSheet, 1, "ActionNetworkID");
  }
  var attendances = getAllAttendances(referenceType, referenceIds);
  var orderedFields = getCoreAttendanceFields();
  var orderedAttendances = getOrderedAttendances(attendances, orderedFields);
  var attendanceSheet = openSheet("Attendances");
  dumpIntoSheet(attendanceSheet, [orderedFields], orderedAttendances);
  var now = new Date();
  setSetting("Sunrise.VolunteerTracking.AttendancesPulled", now.toISOString());
  return null;
}
