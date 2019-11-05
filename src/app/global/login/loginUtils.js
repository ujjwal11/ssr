import axios from 'axios';
import CONSTANTS from '../../../constants/constants';

export function buildLoginRequest(email, password) {

    const request = {};

    const clientId = CONSTANTS[0].CT_CLIENT_ID;
    const clientSecret = CONSTANTS[0].CT_CLIENT_SECRET;

    const tok = clientId + ':' + clientSecret;
    const hash = btoa(tok);

    if (CONSTANTS[0].APPLICATION == 'COMMERCETOOLS') {
        request.url = CONSTANTS[0].CT_AUTH_HOST + '/oauth/' + CONSTANTS[0].CT_PROJECT_KEY + '/customers/token' + '?grant_type=password&username=' + email + '&password=' + password;
        request.data = {};
    } else {
        request.url = CONSTANTS[0].XAMPP_BASE_API + `login`
        let params = new URLSearchParams();
        params.append('grant_type', 'password');
        params.append('username', email);
        params.append('password', password);
        request.data = params;
    }

    request.config = {
        headers: { 'Authorization': 'Basic ' + hash }
    };
    return request;
}



