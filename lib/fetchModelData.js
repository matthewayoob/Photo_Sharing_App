// eslint-disable-next-line import/no-unresolved
var Promise = require("Promise");
/**
  * FetchModel - Fetch a model from the web server.
  *     url - string - The URL to issue the GET request.
  * Returns: a Promise that should be filled
  * with the response of the GET request parsed
  * as a JSON object and returned in the property
  * named "data" of an object.
  * If the requests has an error the promise should be
  * rejected with an object contain the properties:
  *    status:  The HTTP response status
  *    statusText:  The statusText from the xhr request
  *
*/
// Citation: Modzilla Documentation, OH With Zijing
/* Citation: Plethora of OH with Christi, Kexu, Dean, Anh*/ 

function fetchModel(url) {
  return new Promise(function(resolve, reject) {
      let xhr = new XMLHttpRequest();
      xhr.open("GET", url);
      xhr.onreadystatechange = function () {
        if (this.status === 200) {
          if (xhr.readyState === 4) {
            // console.log('content of script' + JSON.parse(xhr.responseText));
            // console.log(JSON.parse(xhr.responseText));
            resolve({data: JSON.parse(xhr.responseText)});
          }
         } else {
            // eslint-disable-next-line prefer-promise-reject-errors
            reject({status: xhr.status, statusText: xhr.statusText});
          }
        };
      // console.log('about to send');
      xhr.send();
  }
  );
}

export default fetchModel;
