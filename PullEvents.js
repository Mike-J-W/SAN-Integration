function formatEventInfo(event) {
  var info = {}
  var customFields = {};
  if ("identifiers" in event) {
    var ids = event["identifiers"];
    for (var i = 0; i < ids.length; i++) {
      if (ids[i].lastIndexOf("action_network:", 0) === 0) {
        info["ActionNetworkID"] = ids[i].substring(15);
      }
    }
  }
  if ("origin_system" in event) {
    info["OriginSystem"] = event["origin_system"];
  }
  if ("title" in event) {
    info["Title"] = event["title"];
  }
  if ("description" in event) {
    info["Description"] = event["description"];
  }
  if ("transparence" in event) {
    info["Transparence"] = event["transparence"];
  }
  if ("visibility" in event) {
    info["Visibility"] = event["visibility"];
  }
  if ("guests_can_invite_others" in event) {
    info["GuestsInvite"] = event["guests_can_invite_others"];
  }
  if ("capacity" in event) {
    info["Capacity"] = event["capacity"];
  }
  if ("status" in event) {
    info["Status"] = event["status"];
  }
  if ("browser_url" in event) {
    info["BrowserUrl"] = event["browser_url"];
  }
  if ("featured_image_url" in event) {
    info["FeaturedImageUrl"] = event["featured_image_url"];
  }
  if ("total_accepted" in event) {
    info["TotalAccepted"] = event["total_accepted"];
  }
  if ("action_network:hidden" in event) {
    info["Hidden"] = event["action_network:hidden"];
  }
  if ("name" in event) {
    info["Name"] = event["name"];
  }
  if ("instructions" in event) {
    info["Instructions"] = event["instructions"];
  }
  if ("start_date" in event) {
    info["DateStart"] = event["start_date"];
  }
  if ("created_date" in event) {
    info["DateCreated"] = event["created_date"];
  }
  if ("modified_date" in event) {
    info["DateModified"] = event["modified_date"];
  }
  if ("location" in event) {
    var location = event["location"];
    if ("venue" in location) {
      info["Venue"] = location["venue"];
    }
    if ("address_lines" in location) {
      info["Street"] = location["address_lines"][0];
    }
    if ("locality" in location) {
      info["City"] = location["locality"];
    }
    if ("region" in location) {
      info["State"] = location["region"];
    }
    if ("postal_code" in location) {
      var pc = location["postal_code"];
      info["Zip5"] = pc.substring(0, 5);
      if (pc.length > 8) {
        info["Zip4"] = pc.substring(pc.length-4);
      }
    }
  }
  if ("_embedded" in event) {
    var embedded = form["_embedded"];
    if ("osdi:campaign" in embedded) {
      var campaign = embedded["osdi:campaign"];
      if ("identifiers" in campaign) {
        var cIds = campaign["identifiers"];
        for (var i = 0; i < cIds.length; i++) {
          if (cIds[i].lastIndexOf("action_network:", 0) === 0) {
            info["ANCampaignID"] = cIds[i].substring(15);
          }
        }
      }
    }
  }   
  return info;
}

function formatEvents(rawEvents) {
  var formattedEvents = [];
  for (var rawEvent in rawEvents) {
    formattedEvents.push(formatEventInfo(rawEvents[rawEvent]));
  }
  return formattedEvents;
}

function getOrderedEvents(events, fields) {
  var orderedEvents = [];
  for (var p = 0; p < events.length; p++) {
    var event = events[p];
    var orderedEvent = [];
    for (var f = 0; f < fields.length; f++) {
      var field = fields[f];
      if (field in event) {
        orderedEvent.push(event[field]);
      }
      else {
        orderedEvent.push("");
      }
    }
    orderedEvents.push(orderedEvent);
  }
  return orderedEvents;
}

function pullEvents() {
  var data = getObjects(-1, "osdi:events");
  var formattedEvents = formatEvents(data);
  var orderedFields = getCoreEventFields();
  var orderedEvents = getOrderedEvents(formattedEvents, orderedFields);
  var eventSheet = openSheet("Events");
  dumpIntoSheet(eventSheet, [orderedFields], orderedEvents);
  var now = new Date();
  setSetting("Sunrise.VolunteerTracking.EventsPulled", now.toISOString());
  return null;
}