function makeActionNetworkGetRequest(url) {
  var apiKey = getSetting("ActionNetwork.ApiKey");
  var headers = {
    "Content-Type": "application/json", 
    "OSDI-API-Token": apiKey
  };
  var options = {
    "method": "get",
    "headers": headers,
  };
  
  var response = UrlFetchApp.fetch(url, options);
  var json = response.getContentText();
  var data = JSON.parse(json);
  return data;
}  

function makeActionNetworkGetRequestsInBulk(urls) {
  var apiKey = getSetting("ActionNetwork.ApiKey");
  var headers = {
    "Content-Type": "application/json", 
    "OSDI-API-Token": apiKey
  };
  var requests = [];
  for (var i = 0; i < urls.length; i++) {    
    var request = {
      "url": urls[i],
      "method": "get",
      "headers": headers,
    };
    requests.push(request);
  }
  var responses = UrlFetchApp.fetchAll(requests);
  var allData = [];
  for (var i = 0; i < responses.length; i++) {
    var json = responses[i].getContentText();
    var data = JSON.parse(json);
    allData.push(data);
  }
  return allData;
}  

function makeActionNetworkPostRequest(url, data) {
  var apiKey = getSetting("ActionNetwork.ApiKey");
  var headers = {
    "Content-Type": "application/json", 
    "OSDI-API-Token": apiKey
  };
  var options = {
    "method": "post",
    "headers": headers,
    "payload": JSON.stringify(data)
  };
  
  var response = UrlFetchApp.fetch(url, options);
  var json = response.getContentText();
  var data = JSON.parse(json);
  return data;
}

function makeActionNetworkPutRequest(url, data) {
  var apiKey = getSetting("ActionNetwork.ApiKey");
  var headers = {
    "Content-Type": "application/json", 
    "OSDI-API-Token": apiKey
  };
  var options = {
    "method": "put",
    "headers": headers,
    "payload": JSON.stringify(data)
  };
  
  var response = UrlFetchApp.fetch(url, options);
  var json = response.getContentText();
  var data = JSON.parse(json);
  return data;
}

function getObjects(count, objectType) {
  var objectData = {};
  var url = getObjectUrl(objectType);
  while (url) {
    var response = makeActionNetworkGetRequest(url);
    var objects = response["_embedded"][objectType];
    for (var i = 0; i < objects.length; i++) {
      if ((count === -1) || (Object.keys(objectData).length < count))
      {
        var id = "";
        var ids = objects[i]["identifiers"];
        for (var j = 0; j < ids.length; j++) {
          if (ids[j].lastIndexOf("action_network:", 0) === 0) {
            id = ids[j];
          }
        }
        objectData[id] = objects[i];
      }
    }
    var links = response["_links"];
    if (((count === -1) || (Object.keys(objectData).length < count)) && ("next" in links)) {
      url = links["next"]["href"];
    }
    else {
      url = null;
    }
  }
  return objectData;
}

function postSubmission(formId, personData, tags, sendAutoresponse) {
  var formUrl = getObjectUrl("osdi:forms");
  var submissionUrl = formUrl + formId + "/submissions/";
  var submissionData = {
    "person": personData,
    "tags": tags,
    "triggers": {
      "autoresponse": {
        "enabled": sendAutoresponse
      }
    }
  }
  var response = makeActionNetworkPostRequest(submissionUrl, submissionData);
  return response;
}

function putCustomFieldsToPerson(personId, fieldData) {
  var peopleUrl = getObjectUrl("osdi:people");
  var putUrl = peopleUrl + personId + "/";
  var updateData = {
    "custom_fields": fieldData
  }
  var response = makeActionNetworkPutRequest(putUrl, updateData);
  return response;
}

function getObjectUrl(objectType) {
  var apiUrl = getSetting("ActionNetwork.Aep");
  var data = makeActionNetworkGetRequest(apiUrl);
  var objectUrl = data["_links"][objectType]["href"];
  if (!(/\/$/.test(objectUrl))) {
      objectUrl = objectUrl + "/";
  }
  return objectUrl;
}

function getCorePersonFields() {
  var fields = [
    "ActionNetworkID",
    "FirstName",
    "LastName",
    "EmailAddress",
    "EmailStatus",
    "Street",
    "City",
    "State",
    "Zip5",
    "Zip4",
    "DateCreated",
    "DateModified",
    "Languages"
  ];
  return fields;
}

function getCoreTagFields() {
  var fields = [
    "ActionNetworkID",
    "Name",
    "DateCreated",
    "DateModified"
  ];
  return fields
}

function getCoreTaggingFields() {
  var fields = [
    "ActionNetworkID",
    "ANPersonID",
    "ANTagID",
    "DateCreated",
    "DateModified"
  ];
  return fields;
}

function getCoreFormFields() {
  var fields = [
    "ActionNetworkID",
    "Hidden",
    "TotalSubmissions",
    "Name",
    "Title",
    "Description",
    "CallToAction",
    "BrowserUrl",
    "FeaturedImageUrl",
    "ANCreatorID",
    "DateCreated",
    "DateModified",
    "OriginSystem"
  ];
  return fields;
}

function getCoreEventFields() {
  var fields = [
    "ActionNetworkID",
    "Hidden",
    "TotalAccepted",
    "Name",
    "Title",
    "Description",
    "BrowserUrl",
    "FeaturedImageUrl",
    "DateCreated",
    "DateModified",
    "OriginSystem",
    "Instructions",
    "DateStart",
    "Venue",
    "Street",
    "City",
    "State",
    "Zip5",
    "Zip4",
    "ANCampaignID",
    "Status",
    "Transparence",
    "Visibility",
    "GuestsInvite",
    "Capacity",
    "ANCreatorID",
    "ANOrganizerID"
  ];
  return fields;
}

function getCoreAttendanceFields() {
  var fields = [
    "ActionNetworkID",
    "ANPersonID",
    "ANEventID",
    "Status",
    "DateCreated",
    "DateModified"
  ];
  return fields;
}

function getCoreSubmissionFields() {
  var fields = [
    "ActionNetworkID",
    "ANPersonID",
    "ANFormID",
    "DateCreated",
    "DateModified"
  ];
  return fields;
}
