function formatPersonInfo(person) {
  var info = {}
  var customFields = {};
  if ("identifiers" in person) {
    var ids = person["identifiers"];
    for (var i = 0; i < ids.length; i++) {
      if (ids[i].lastIndexOf("action_network:", 0) === 0) {
        info["ActionNetworkID"] = ids[i].substring(15);
      }
    }
  }
  if ("postal_addresses" in person) {
    var addresses = person["postal_addresses"];
    for (var i = 0; i < addresses.length; i++) {
      var address = addresses[i];
      if (address["primary"]) {
        if ("address_lines" in address) {
          info["Street"] = address["address_lines"][0];
        }
        if ("locality" in address) {
          info["City"] = address["locality"];
        }
        if ("region" in address) {
          info["State"] = address["region"];
        }
        if ("postal_code" in address) {
          var pc = address["postal_code"];
          info["Zip5"] = pc.substring(0, 5);
          if (pc.length > 8) {
            info["Zip4"] = pc.substring(pc.length-4);
          }
        }
      }
    }
  }
  if ("email_addresses" in person) {
    var emails = person["email_addresses"];
    for (var i = 0; i < emails.length; i++) {
      if (emails[i]["primary"]) {
        var email = emails[i];
        if ("address" in email) {
          info["EmailAddress"] = email["address"];
        }
        if ("status" in email) {
          info["EmailStatus"] = email["status"];
        }
      }
    }
  }
  if ("given_name" in person) {
    info["FirstName"] = person["given_name"];
  }
  if ("family_name" in person) {
    info["LastName"] = person["family_name"];
  }
  if ("created_date" in person) {
    info["DateCreated"] = person["created_date"];
  }
  if ("modified_date" in person) {
    info["DateModified"] = person["modified_date"];
  }
  if ("languages_spoken" in person) {
    info["Languages"] = person["languages_spoken"].join(",");
  }
  if ("custom_fields" in person) {
    customFields = person["custom_fields"];
    for (var fieldName in customFields) {
      info[fieldName] = customFields[fieldName];
    }
  }
  return [info, Object.keys(customFields)];
}

function formatPeople(rawPeople) {
  var formattedPeople = [];
  var customFields = {};
  for (var rawPerson in rawPeople) {
    var infoAndFields = formatPersonInfo(rawPeople[rawPerson]);
    formattedPeople.push(infoAndFields[0]);
    var fields = infoAndFields[1];
    for (var i = 0; i < fields.length; i++) {
      customFields[fields[i]] = 0;
    }
  }
  return [formattedPeople, customFields];
}

function getOrderedPeople(people, fields) {
  var orderedPeople = [];
  for (var p = 0; p < people.length; p++) {
    var person = people[p];
    var orderedPerson = [];
    for (var f = 0; f < fields.length; f++) {
      var field = fields[f];
      if (field in person) {
        orderedPerson.push(person[field]);
      }
      else {
        orderedPerson.push("");
      }
    }
    orderedPeople.push(orderedPerson);
  }
  return orderedPeople;
}

function getOrderedFields(customFields) {
  var coreFields = getCorePersonFields();
  var sortedCustomFields = Object.keys(customFields).sort();
  return coreFields.concat(sortedCustomFields);
}

function updatePersonInSheet(personData) {
  var personAndFields = formatPersonInfo(personData);
  var formattedPerson = personAndFields[0];
  var customFields = {};
  for (var i = 0; i < personAndFields[1].length; i++) {
    customFields[personAndFields[1][i]] = 0;
  }
  var orderedFields = getOrderedFields(customFields);
  var orderedPerson = getOrderedPeople([formattedPerson], orderedFields)[0];
  var peopleSheet = openSheet("People");
  updateRowById(peopleSheet, 1, orderedFields, orderedPerson);
  return null;
}

function pullPeople() {
  // Each ActionNetwork API call in getObjects takes ~1 second
  // Each call returns a maximum of 25 object records
  // This means 3,000 people will take 2 minutes to retrieve
  var data = getObjects(-1, "osdi:people");
  var peopleAndFields = formatPeople(data);
  var formattedPeople = peopleAndFields[0];
  var customFields = peopleAndFields[1];
  var orderedFields = getOrderedFields(customFields);
  var orderedPeople = getOrderedPeople(formattedPeople, orderedFields);
  var peopleSheet = openSheet("People");
  dumpIntoSheet(peopleSheet, [orderedFields], orderedPeople);
  var now = new Date();
  setSetting("Sunrise.VolunteerTracking.PeoplePulled", now.toISOString());
  return null;
}
