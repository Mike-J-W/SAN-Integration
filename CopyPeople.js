function formatPhoneNumbers(data) {
  for (var i = 0; i < data.length; i++) {
    for (var j = 0; j < data[i].length; j++) {
      var element = data[i][j];
      data[i][j] = element.toString().replace(/[^\d]/g, "");
    }
  }
  return data;
}

function getFirstSubmissions() {
  var submissionsSheet = openSheet("Submissions");
  var submissionsByPersonId = getGroupedObjectsFromSheet(submissionsSheet, 1, "ANPersonID", ["ANFormID", "DateCreated"]);
  var formsSheet = openSheet("Forms");
  var formsById = getDictsFromSheet(formsSheet, 1, "ActionNetworkID", ["Title"]);
  var earlisetSubmissionByPersonId = {};
  for (var personId in submissionsByPersonId) {
    var submissionsInfo = submissionsByPersonId[personId];
    var earliestSubmission = {};
    for (var i = 0; i < submissionsInfo.length; i++) {
      var formId = submissionsInfo[i][0];
      var submissionDate = submissionsInfo[i][1];
      var formTitle = formsById[formId][0];
      if (i === 0) {
        earliestSubmission = [formTitle, submissionDate];
      }
      else {
        if (submissionDate < earliestSubmission[1]) {
          earliestSubmission = [formTitle, submissionDate];
        }
      }
    }
    earlisetSubmissionByPersonId[personId] = earliestSubmission;
  }
  return earlisetSubmissionByPersonId;
}

function getFirstAttendances() {
  var attendancesSheet = openSheet("Attendances");
  var eventIdsByPersonId = getGroupedObjectsFromSheet(attendancesSheet, 1, "ANPersonID", ["ANEventID"]);
  var eventsSheet = openSheet("Events");
  var eventsById = getDictsFromSheet(eventsSheet, 1, "ActionNetworkID", ["Title", "DateStart"]);
  var earlisetEventByPersonId = {};
  for (var personId in eventIdsByPersonId) {
    var eventInfo = eventIdsByPersonId[personId];
    var earliestEvent = {};
    for (var i = 0; i < eventInfo.length; i++) {
      var eventId = eventInfo[i][0];
      if (i === 0) {
        earliestEvent = eventsById[eventId];
      }
      else {
        var consideredEvent = eventsById[eventId];
        if (consideredEvent[1] < earliestEvent[1]) {
          earliestEvent = consideredEvent;
        }
      }
    }
    earlisetEventByPersonId[personId] = earliestEvent;
  }
  return earlisetEventByPersonId;
}

function getFirstActions() {
  var earliestActionByPersonId = getFirstSubmissions();
  var attendancesByPersonId = getFirstAttendances();
  for (var personId in attendancesByPersonId) {
    var attendance = attendancesByPersonId[personId];
    if (personId in earliestActionByPersonId) {
      var action = earliestActionByPersonId[personId];
      if (attendance[1] < action[1]) {
        earliestActionByPersonId[personId] = attendance;
      }
    }
    else {
      earliestActionByPersonId[personId] = attendance;
    }
  }
  return earliestActionByPersonId;
}

function getTagsByPerson() {
  var taggingsSheet = openSheet("Taggings");
  var tagIdsByPersonId = getGroupedObjectsFromSheet(taggingsSheet, 1, "ANPersonID", ["ANTagID"]);
  var tagsSheet = openSheet("Tags");
  var tagNamesById = getDictsFromSheet(tagsSheet, 1, "ActionNetworkID", ["Name"]);
  var tagNamesByPersonId = {};
  for (var personId in tagIdsByPersonId) {
    var tagIds = tagIdsByPersonId[personId];
    var tagNames = []
    for (var i = 0; i < tagIds.length; i++) {
      var tagId = tagIds[i];
      var tagName = tagNamesById[tagId];
      tagNames.push(tagName);
    }
    tagNamesByPersonId[personId] = [tagNames.sort().join(", ")];
  }
  return tagNamesByPersonId;
}

function getPeopleAges() {
  var peopleSheet = openSheet("People");
  var ageInfoByPerson = getDictsFromSheet(peopleSheet, 1, "ActionNetworkID", ["Age", "Birthdate"]) 
  var agesOfPeople = {};
  for (var personId in ageInfoByPerson) {
    var personInfo = ageInfoByPerson[personId];
    var age = NaN;
    var ageRaw = personInfo[0];
    if (/^\d+$/.test(ageRaw)) {
      age = parseInt(ageRaw);
    }
    var dob = personInfo[1];
    if (dob != "" && dob != undefined) {
      var today = new Date();
      var ageDiff = today - dob;
      var ageDate = new Date(ageDiff); // miliseconds from epoch
      age = Math.abs(ageDate.getUTCFullYear() - 1970);
      agesOfPeople[personId] = [age];
    }
    else if (age != NaN && age < 200) {
      agesOfPeople[personId] = [age];
    }
  }
  return agesOfPeople;
}  

function getVolunteerColumnHeaderMappings() {
  return [
    {"field": "ActionNetworkID", "column": "ActionNetworkID", "updateable": false, "call_form_field": false},
    {"field": "FirstName", "column": "First Name", "updateable": false, "call_form_field": false},
    {"field": "LastName", "column": "Last Name", "updateable": false, "call_form_field": false},
    {"field": "EmailAddress", "column": "Email", "updateable": false, "call_form_field": false},
    {"field": "EmailStatus", "column": "Email Status", "updateable": false, "call_form_field": false}, 
    {"field": "Phone_Sync", "column": "Phone Number", "updateable": false, "call_form_field": false},
    {"field": "Hub Role", "column": "Hub Role", "updateable": true, "call_form_field": false},
    {"field": "Gender_Pronouns", "column": "Pronouns", "updateable": false, "call_form_field": false},
    {"field": "hub_ladder_status", "column": "Ladder Status", "updateable": true, "call_form_field": false},
    {"field": "Member Info", "column": "Member Info", "updateable": false, "call_form_field": false}, 
    {"field": "", "column": "Action Network Taggings", "updateable": false, "call_form_field": false},
    {"field": "Last Call - Date", "column": "Date of Last Call", "updateable": false, "call_form_field": true},
    {"field": "Last Call - Number", "column": "Number Dialed on Last Call", "updateable": false, "call_form_field": true},
    {"field": "Last Call - Request", "column": "Request of Last Call", "updateable": false, "call_form_field": true},
    {"field": "Last Call - Response", "column": "Outcome of Last Call", "updateable": false, "call_form_field": true},
    {"field": "Sunrise 101 - Date Completed", "column": "Sunrise 101 - Date Completed", "updateable": true, "call_form_field": false},
    {"field": "Sunrise Leadership Training - Date Completed", "column": "Sunrise Leadership Training - Date Completed", "updateable": true, "call_form_field": false}
  ];
}

function getEntryColumns() {
  var mappings = getVolunteerColumnHeaderMappings();
  var entryColumns = [];
  for (var i = 0; i < mappings.length; i++) {
    var map = mappings[i];
    var columnName = map["column"];
    var updateable = map["updateable"];
    var callForm = map["call_form_field"];
    if (updateable || callForm) {
      entryColumns.push(columnName);
    }
  }
  return entryColumns;
}

function copyPeopleToVolunteersSheet() {
  var headerRow = 1;
  var sourceSheet = openSheet("People");
  var targetSheet = openSheet("Volunteers");
  var copyMappings = getVolunteerColumnHeaderMappings();
  var columnsToGenerate = [
    ["People", "ActionNetworkID", ["Age"]],
    ["Actions", "ActionNetworkID", ["First Action", "Date of First Action"]],
    ["Taggings", "ActionNetworkID", ["Action Network Tags"]]
    ]
  for (var i = 0; i < copyMappings.length; i++) {
    var mapping = copyMappings[i];
    var fieldName = mapping["field"];
    var sourceData = getColumnData(sourceSheet, 1, fieldName);
    if (fieldName === "Phone_Sync") {
      sourceData = formatPhoneNumbers(sourceData);
    }
    if (sourceData != null) {
      setColumnData(sourceData, targetSheet, headerRow, mapping["column"]);
    }
  }
  for (var i = 0; i < columnsToGenerate.length; i++) {
    var columnNames = columnsToGenerate[i];
    var sourceType = columnNames[0];
    var personMapping = {};
    if (sourceType === "People") {
      personMapping = getPeopleAges();
    }
    else if (sourceType === "Actions") {
      personMapping = getFirstActions();
    }
    else if (sourceType === "Taggings") {
      personMapping = getTagsByPerson();
    }
    setSheetFromDicts(targetSheet, headerRow, columnNames[1], columnNames[2], personMapping);
  }
}

function copyPeople() {
  copyPeopleToVolunteersSheet();
  var now = new Date();
  setSetting("Sunrise.VolunteerTracking.PeopleCopied", now.toISOString());
  return null;
}
