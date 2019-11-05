import axios from 'axios';
import CONSTANTS from '../../constants/constants';

export function buildMyAccountRequest(access_token) {
    const resuest = {};

    if (CONSTANTS[0].APPLICATION == 'COMMERCETOOLS') {
        resuest.url = CONSTANTS[0].CT_API_HOST + '/' + CONSTANTS[0].CT_PROJECT_KEY + '/me/';
        resuest.data = {};
    } else {
        resuest.url = '/assets/data/profile.json';
        resuest.data = {};
    }

    resuest.headerConfig = {
        headers: { 'Authorization': 'Bearer ' + access_token }
    };

    return resuest;
}



