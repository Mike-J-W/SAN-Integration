function getSubmissions(referenceType, referenceId) {
  var submissionsData = {};
  var url = getSetting("ActionNetwork.Aep") + referenceType + "/" + referenceId + "/submissions";
  while (url) {
    var response = makeActionNetworkGetRequest(url);
    var submissions = response["_embedded"]["osdi:submissions"];
    for (var i = 0; i < submissions.length; i++) {
      var id = "";
      var ids = submissions[i]["identifiers"];
      for (var j = 0; j < ids.length; j++) {
        if (ids[j].lastIndexOf("action_network:", 0) === 0) {
          id = ids[j];
        }
      }
      submissionsData[id] = submissions[i];
    }
    var links = response["_links"];
    if ("next" in links) {
      url = links["next"]["href"];
    }
    else {
      url = null;
    }
  }
  return submissionsData;
}

function formatSubmissions(rawSubmissions) {
  var formattedSubmission = [];
  for (var rawSubmission in rawSubmissions) {
    formattedSubmission.push(formatSubmissionInfo(rawSubmissions[rawSubmission]));
  }
  return formattedSubmission;
}

function formatSubmissionInfo(submission) {
  var info = {};
  if ("identifiers" in submission) {
    var ids = submission["identifiers"];
    for (var i = 0; i < ids.length; i++) {
      if (ids[i].lastIndexOf("action_network:", 0) === 0) {
        info["ActionNetworkID"] = ids[i].substring(15);
      }
    }
  }
  if ("action_network:person_id" in submission) {
    info["ANPersonID"] = submission["action_network:person_id"];
  }
  if ("action_network:form_id" in submission) {
    info["ANFormID"] = submission["action_network:form_id"];
  }
  if ("created_date" in submission) {
    info["DateCreated"] = submission["created_date"];
  }
  if ("modified_date" in submission) {
    info["DateModified"] = submission["modified_date"];
  }
  return info;
}

function getAllSubmissions(referenceType, referenceIds) {
  var allSubmissions = [];
  for (var i = 0; i < referenceIds.length; i++) {
    var referenceId = referenceIds[i][0];
    var submissions = getSubmissions(referenceType, referenceId);
    var formattedSubmissions = formatSubmissions(submissions);
    for (var j = 0; j < formattedSubmissions.length; j++) {
      allSubmissions.push(formattedSubmissions[j]);
    }
  }
  return allSubmissions;
}

function getOrderedSubmissions(submissions, fields) {
  var orderedSubmissions = [];
  for (var p = 0; p < submissions.length; p++) {
    var submission = submissions[p];
    var orderedSubmission = [];
    for (var f = 0; f < fields.length; f++) {
      var field = fields[f];
      if (field in submission) {
        orderedSubmission.push(submission[field]);
      }
      else {
        orderedSubmission.push("");
      }
    }
    orderedSubmissions.push(orderedSubmission);
  }
  return orderedSubmissions;
}

function appendSubmissionToSheet(submissionData) {
  var formattedSubmission = formatSubmissionInfo(submissionData);
  var orderedFields = getCoreSubmissionFields();
  var orderedSubmission = getOrderedSubmissions([formattedSubmission], orderedFields)[0];
  var submissionSheet = openSheet("Submissions");
  appendToSheet(submissionSheet, 1, orderedFields, orderedSubmission);
  return null;
}

function pullSubmissions() {
  var peopleSheet = openSheet("People");
  var personSample = peopleSheet.getRange("A2").getValue();
  if (personSample === "" || personSample === null) {
    pullPeople();
  }
  var peopleCount = peopleSheet.getLastRow();
  var formsSheet = openSheet("Forms");
  var formSample = formsSheet.getRange("A2").getValue();
  if (formSample === "" || formSample === null) {
    pullForms();
  }
  var formCount = formsSheet.getLastRow();
  
  var submissions = [];
  var referenceType = "forms";
  var referenceIds = getColumnData(formsSheet, 1, "ActionNetworkID");
  if (peopleCount < formCount) {
    referenceType = "people";
    referenceIds = getColumnData(peopleSheet, 1, "ActionNetworkID");
  }
  submissions = getAllSubmissions(referenceType, referenceIds);
  var orderedFields = getCoreSubmissionFields();
  var orderedSubmissions = getOrderedSubmissions(submissions, orderedFields);
  var submissionSheet = openSheet("Submissions");
  dumpIntoSheet(submissionSheet, [orderedFields], orderedSubmissions);
  var now = new Date();
  setSetting("Sunrise.VolunteerTracking.SubmissionsPulled", now.toISOString());
  return null;
}
