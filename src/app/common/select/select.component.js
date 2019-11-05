import React from 'react';

const Select = props => {
	console.log('Select props: ', props);
	return (
		<React.Fragment>
			<label htmlFor={props.name} className={'form-label' + (!props.showLabel ? ' screen-reader' : '')}>
				{props.label ? props.label : props.placeholder}
			</label>
			<select className={props.className} name={props.name} id={props.name} value={props.value} onChange={props.handleChange}>
				{props.placeholder ? (
					<option value="" disabled>
						{props.placeholder}
					</option>
				) : null}

				{props.options.map(option => {
					return (
						<option key={option} value={option} label={option}>
							{option}
						</option>
					);
				})}
			</select>
		</React.Fragment>
	);
};

export default Select;
