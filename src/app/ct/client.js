import CONSTANTS from "../../constants/constants";
import { createClient } from '@commercetools/sdk-client';
import { createHttpMiddleware } from '@commercetools/sdk-middleware-http';
import fetch from 'node-fetch';




export function getClient() {
  //const 
  //const bearerToken = JSON.parse(localStorage.getItem('user_token')).access_token;
  console.log('testing',CONSTANTS[0].CT_API_HOST);
  const httpMiddleware = createHttpMiddleware({
    host: CONSTANTS[0].CT_API_HOST,
    fetch,
  })
  
  return createClient({
    middlewares: [httpMiddleware],
  })

};

