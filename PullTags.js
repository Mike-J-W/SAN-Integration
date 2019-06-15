function formatTagInfo(tag) {
  var info = {}
  var customFields = {};
  if ("identifiers" in tag) {
    var ids = tag["identifiers"];
    for (var i = 0; i < ids.length; i++) {
      if (ids[i].lastIndexOf("action_network:", 0) === 0) {
        info["ActionNetworkID"] = ids[i].substring(15);
      }
    }
  }
  if ("name" in tag) {
    info["Name"] = tag["name"];
  }
  if ("created_date" in tag) {
    info["DateCreated"] = tag["created_date"];
  }
  if ("modified_date" in tag) {
    info["DateModified"] = tag["modified_date"];
  }
  return info;
}

function formatTags(rawTags) {
  var formattedTags = [];
  for (var rawTag in rawTags) {
    formattedTags.push(formatTagInfo(rawTags[rawTag]));
  }
  return formattedTags;
}

function getOrderedTags(tags, fields) {
  var orderedTags = [];
  for (var p = 0; p < tags.length; p++) {
    var tag = tags[p];
    var orderedTag = [];
    for (var f = 0; f < fields.length; f++) {
      var field = fields[f];
      if (field in tag) {
        orderedTag.push(tag[field]);
      }
      else {
        orderedTag.push("");
      }
    }
    orderedTags.push(orderedTag);
  }
  return orderedTags;
}

function pullTags() {
  var data = getObjects(-1, "osdi:tags");
  var formattedTags = formatTags(data);
  var orderedFields = getCoreTagFields();
  var orderedTags = getOrderedTags(formattedTags, orderedFields);
  var tagSheet = openSheet("Tags");
  dumpIntoSheet(tagSheet, [orderedFields], orderedTags);
  var now = new Date();
  setSetting("Sunrise.VolunteerTracking.TagsPulled", now.toISOString());
  return null;
}
