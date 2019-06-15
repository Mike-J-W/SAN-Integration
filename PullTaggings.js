function getTaggingsOfObject(referenceType, referenceId, calls, callLimit, url) {
  var taggingsData = {};
  if (url === "") {
    url = getSetting("ActionNetwork.Aep") + referenceType + "/" + referenceId + "/taggings";
  }
  while (url && calls < callLimit) {
    var response = makeActionNetworkGetRequest(url);
    calls++;
    var taggings = response["_embedded"]["osdi:taggings"];
    for (var i = 0; i < taggings.length; i++) {
      var id = "";
      var ids = taggings[i]["identifiers"];
      for (var j = 0; j < ids.length; j++) {
        if (ids[j].lastIndexOf("action_network:", 0) === 0) {
          id = ids[j];
        }
      }
      taggingsData[id] = taggings[i];
    }
    var links = response["_links"];
    if ("next" in links) {
      url = links["next"]["href"];
    }
    else {
      url = null;
    }
  }
  return [taggingsData, calls, url];
}

function formatTaggings(rawTaggings) {
  var formattedTagging = [];
  for (var rawTagging in rawTaggings) {
    formattedTagging.push(formatTaggingInfo(rawTaggings[rawTagging]));
  }
  return formattedTagging;
}

function formatTaggingInfo(tagging) {
  var info = {};
  if ("identifiers" in tagging) {
    var ids = tagging["identifiers"];
    for (var i = 0; i < ids.length; i++) {
      if (ids[i].lastIndexOf("action_network:", 0) === 0) {
        info["ActionNetworkID"] = ids[i].substring(15);
      }
    }
  }
  if ("_links" in tagging) {
    var links = tagging["_links"];
    if ("osdi:person" in links) {
      var personUrl = links["osdi:person"]["href"];
      var personId = personUrl.substring(personUrl.lastIndexOf("/") + 1);
      info["ANPersonID"] = personId;
    }
    if ("osdi:tag" in links) {
      var tagUrl = links["osdi:tag"]["href"];
      var tagId = tagUrl.substring(tagUrl.lastIndexOf("/") + 1);
      info["ANTagID"] = tagId;
    }
  }
  if ("created_date" in tagging) {
    info["DateCreated"] = tagging["created_date"];
  }
  if ("modified_date" in tagging) {
    info["DateModified"] = tagging["modified_date"];
  }
  return info;
}

function getTaggings(referenceType, referenceIds, lastId, url) {
  setSetting("ActionNetwork.DataDump.Taggings.LastTagID", "");
  setSetting("ActionNetwork.DataDump.Taggings.NextUrl", "");
  var allTaggings = [];
  var totalCalls = 0;
  var callLimit = 200;
  if (lastId !== "") {
    var idIndex = -1;
    for (var i = 0; i < referenceIds.length; i++) {
      if (lastId === referenceIds[i][0]) {
        idIndex = i;
      }
    }
    if (idIndex != -1) {
      referenceIds = referenceIds.slice(idIndex);
    }
  }
  for (var i = 0; i < referenceIds.length; i++) {
    var referenceId = referenceIds[i][0];
    if (totalCalls < callLimit) {
      console.log(referenceId);
      var info = getTaggingsOfObject(referenceType, referenceId, totalCalls, callLimit, url);
      var taggings = info[0];
      var calls = info[1];
      var nextUrl = info[2];
      var formattedTaggings = formatTaggings(taggings);
      for (var j = 0; j < formattedTaggings.length; j++) {
        allTaggings.push(formattedTaggings[j]);
      }
      totalCalls = calls;
      if (totalCalls >= callLimit) {
        setSetting("ActionNetwork.DataDump.Taggings.LastTagID", referenceId);
        setSetting("ActionNetwork.DataDump.Taggings.NextUrl", nextUrl);
      }
    }
  }
  if (getSetting("ActionNetwork.DataDump.Taggings.LastTagID") !== "" || getSetting("ActionNetwork.DataDump.Taggings.NextUrl") !== "") {
    ScriptApp.newTrigger("pullTaggingsAgain")
    .timeBased()
    .after(60 * 1000)
    .create();
  }
  return allTaggings;
}

function getOrderedTaggings(taggings, fields) {
  var orderedTaggings = [];
  for (var p = 0; p < taggings.length; p++) {
    var tagging = taggings[p];
    var orderedTagging = [];
    for (var f = 0; f < fields.length; f++) {
      var field = fields[f];
      if (field in tagging) {
        orderedTagging.push(tagging[field]);
      }
      else {
        orderedTagging.push("");
      }
    }
    orderedTaggings.push(orderedTagging);
  }
  return orderedTaggings;
}

function pullTaggings() {
  var tagsSheet = openSheet("Tags");
  var tagSample = tagsSheet.getRange("A2").getValue();
  if (tagSample === "" || tagSample === null) {
    pullTags();
  }
  var tagCount = tagsSheet.getLastRow();
  var referenceType = "tags";
  var referenceIds = getColumnData(tagsSheet, 1, "ActionNetworkID");
  var taggings = getTaggings(referenceType, referenceIds, "", "");
  var orderedFields = getCoreTaggingFields();
  var orderedTaggings = getOrderedTaggings(taggings, orderedFields);
  var taggingSheet = openSheet("Taggings");
  dumpIntoSheet(taggingSheet, [orderedFields], orderedTaggings);
  if (getSetting("ActionNetwork.DataDump.Taggings.LastTagID") === "") {
    var now = new Date();
    setSetting("Sunrise.VolunteerTracking.TaggingsPulled", now.toISOString());
  }
  return null;
}

function pullTaggingsAgain() {
  deleteFunctionTrigger("pullTaggingsAgain");
  var url = getSetting("ActionNetwork.DataDump.Taggings.NextUrl");
  var lastId = getSetting("ActionNetwork.DataDump.Taggings.LastTagID");
  if (url === "" && lastId === "") {
    return false;
  }
  var tagsSheet = openSheet("Tags");
  var tagSample = tagsSheet.getRange("A2").getValue();
  if (tagSample === "" || tagSample === null) {
    pullTags();
  }
  var tagCount = tagsSheet.getLastRow();
  var referenceType = "tags";
  var referenceIds = getColumnData(tagsSheet, 1, "ActionNetworkID");
  var taggings = getTaggings(referenceType, referenceIds, lastId, url);
  var orderedFields = getCoreTaggingFields();
  var orderedTaggings = getOrderedTaggings(taggings, orderedFields);
  var taggingSheet = openSheet("Taggings");
  dumpOntoSheet(taggingSheet, [orderedFields], orderedTaggings);
  if (getSetting("ActionNetwork.DataDump.Taggings.LastTagID") === "") {
    var now = new Date();
    setSetting("Sunrise.VolunteerTracking.TaggingsPulled", now.toISOString());
    ScriptApp.newTrigger("generateTrackingSpreadsheetOnTrigger")
    .timeBased()
    .after(60 * 1000)
    .create();
  }
  return null;
}
  