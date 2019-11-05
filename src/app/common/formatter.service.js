const formatPhoneNumber = phoneNumberString => {
	const cleaned = ('' + phoneNumberString).replace(/\D/g, '');
	const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
	if (match) {
		return '(' + match[1] + ') ' + match[2] + '-' + match[3];
	}
	return phoneNumberString;
};

const formatDate = (format, date) => {
	const newDate = new Date(date);
	return new Intl.DateTimeFormat(format).format(newDate);
};

const formatCurrency = ($$$, locale) => {
	return new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: locale
	}).format($$$/100);
};

export const formatterService = {
	formatCurrency,
	formatDate,
	formatPhoneNumber
};
