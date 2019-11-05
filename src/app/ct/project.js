const sdkRequestBuilder = require('@commercetools/api-request-builder');
const { getClient, projectKey } = require('./client.js');

const getProject = function getProject() {
  // TODO 1.1 + 1.2: Complete the getClient function in ./handson/client.js
  // TODO 1.3: Use the SDK client here to execute a request on the project configuration API

  const requestBuilder = sdkRequestBuilder.createRequestBuilder({projectKey});

      const projectUri = requestBuilder.project.build();

      const projectRequest = {
        uri: projectUri,
        method:'GET'
      };
      
  return getClient().execute(projectRequest); 


};

module.exports.getProject = getProject;
