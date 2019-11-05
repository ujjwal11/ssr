import axios from 'axios';
import CONSTANTS from '../../../constants/constants';

export function buildRegistrationRequest(access_token, data) {

    const request = {};

    request.url = CONSTANTS[0].CT_API_HOST + '/' + CONSTANTS[0].CT_PROJECT_KEY + '/me/signup'
    request.data = data;
    request.config = {
        headers: { 'Authorization': 'Bearer ' + access_token }
    };
    return request;
}



