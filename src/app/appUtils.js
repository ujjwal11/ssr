import axios from "axios";
import CONSTANTS from "../constants/constants";
import { request } from "http";

export function buildAnonymousTokenRequest() {

  const clientId = CONSTANTS[0].CT_CLIENT_ID;
  const clientSecret = CONSTANTS[0].CT_CLIENT_SECRET;
  var tok = clientId + ':' + clientSecret;
  var hash = btoa(tok);

  const request = {};
  request.url = CONSTANTS[0].CT_AUTH_HOST + "/oauth/" + CONSTANTS[0].CT_PROJECT_KEY + "/anonymous/token" 
                  + "?grant_type=client_credentials"
                  + "&scope="+ CONSTANTS[0].SCOPES;
  request.data = {};
  request.config = {
    headers: { 'Authorization': 'Basic ' + hash }
  };
  return request;
}
