const routes = [
	{
		tertiary: [
			{
				path: '/customer-management',
				exact: true,
				component: () => 'CustomerManagement',
				label: 'Customer Management'
			},
			{
				path: '/order-approval',
				exact: true,
				component: () => 'OrderApproval',
				label: 'Order Approval'
			},
			{
				path: '/order-management',
				exact: true,
				component: () => 'OrderManagement',
				label: 'Order Management'
			}
		]
	},
	{
		path: '/',
		component: () => 'CustomerManagement'
	}
];

export default routes;
