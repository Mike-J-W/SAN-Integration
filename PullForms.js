function formatFormInfo(form) {
  var info = {}
  var customFields = {};
  if ("identifiers" in form) {
    var ids = form["identifiers"];
    for (var i = 0; i < ids.length; i++) {
      if (ids[i].lastIndexOf("action_network:", 0) === 0) {
        info["ActionNetworkID"] = ids[i].substring(15);
      }
    }
  }
  if ("origin_system" in form) {
    info["OriginSystem"] = form["origin_system"];
  }
  if ("title" in form) {
    info["Title"] = form["title"];
  }
  if ("description" in form) {
    info["Description"] = form["description"];
  }
  if ("call_to_action" in form) {
    info["CallToAction"] = form["call_to_action"];
  }
  if ("browser_url" in form) {
    info["BrowserUrl"] = form["browser_url"];
  }
  if ("featured_image_url" in form) {
    info["FeaturedImageUrl"] = form["featured_image_url"];
  }
  if ("total_submissions" in form) {
    info["TotalSubmissions"] = form["total_submissions"];
  }
  if ("action_network:hidden" in form) {
    info["Hidden"] = form["action_network:hidden"];
  }
  if ("name" in form) {
    info["Name"] = form["name"];
  }
  if ("created_date" in form) {
    info["DateCreated"] = form["created_date"];
  }
  if ("modified_date" in form) {
    info["DateModified"] = form["modified_date"];
  }
  if ("_embedded" in form) {
    var embedded = form["_embedded"];
    if ("osdi:creator" in embedded) {
      var creator = embedded["osdi:creator"];
      if ("identifiers" in creator) {
        var cIds = creator["identifiers"];
        for (var i = 0; i < cIds.length; i++) {
          if (cIds[i].lastIndexOf("action_network:", 0) === 0) {
            info["ANCreatorID"] = cIds[i].substring(15);
          }
        }
      }
    }
  }   
  return info;
}

function formatForms(rawForms) {
  var formattedForms = [];
  for (var rawForm in rawForms) {
    formattedForms.push(formatFormInfo(rawForms[rawForm]));
  }
  return formattedForms;
}

function getOrderedForms(forms, fields) {
  var orderedForms = [];
  for (var p = 0; p < forms.length; p++) {
    var form = forms[p];
    var orderedForm = [];
    for (var f = 0; f < fields.length; f++) {
      var field = fields[f];
      if (field in form) {
        orderedForm.push(form[field]);
      }
      else {
        orderedForm.push("");
      }
    }
    orderedForms.push(orderedForm);
  }
  return orderedForms;
}

function pullForms() {
  var data = getObjects(-1, "osdi:forms");
  var formattedForms = formatForms(data);
  var orderedFields = getCoreFormFields();
  var orderedForms = getOrderedForms(formattedForms, orderedFields);
  var formSheet = openSheet("Forms");
  dumpIntoSheet(formSheet, [orderedFields], orderedForms);
  var now = new Date();
  setSetting("Sunrise.VolunteerTracking.FormsPulled", now.toISOString());
  return null;
}
