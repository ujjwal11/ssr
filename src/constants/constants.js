

const CONSTANTS = [
	{
		DOMAIN: 'https://ccstore-z0wa.oracleoutsourcing.com/',
		ACMC_LOGIN_API: 'http://localhost:3000/ccagent/custom/v1/login',
		XAMPP_BASE_API: 'http://localhost:8085/occ/proxy/index.php?url=https://occapi-z0wa.taistech.com/ccstoreui/v1/',
		// XAMPP_BASE_API: 'http://localhost/occ/proxy/index.php?url=https://ccstore-z0wa.oracleoutsourcing.com/ccstoreui/v1/'
		AXIOS_TIMEOUT: 30000,

		CT_PROJECT_KEY: 'hello-world-34',
		CT_AUTH_HOST: 'https://auth.sphere.io',
		CT_API_HOST: 'https://api.sphere.io',
		CT_CLIENT_ID: 'CZmXeqTQe3_6x7-I9SGzpNRn',
		CT_CLIENT_SECRET: 'OQ2cjdot7511Pi262wLKbWGVMDex6ob8',
		SCOPES: scopes(),
		//APPLICATION:'OCC'
		APPLICATION: 'COMMERCETOOLS'
	}
];

function scopes() {
	return ['create_anonymous_token',
	  'view_products',
	  'manage_my_orders',
	  'manage_my_payments',
	  'manage_my_profile',
	  'manage_my_shopping_lists']
	  .map(scope => `${scope}:hello-world-34`).join(' ');
  }



export default CONSTANTS;