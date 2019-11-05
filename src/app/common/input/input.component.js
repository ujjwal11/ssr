import React from 'react';

const Input = (props) => {
	return (
		<React.Fragment>
			<label htmlFor={props.name}
				className={'form-label' + (!props.showLabel ? ' screen-reader':'')}
			>
				{props.label ? props.label : props.placeholder}
			</label>
			<input 
				className={props.className ? props.className + ' form-input' : 'form-input'}
				id={props.name}
				type={props.type}
				name={props.name}
				value={props.value}
				onChange={props.handleChange}
				placeholder={props.placeholder}
				required={props.required}
				pattern={props.pattern}
			/>
		</React.Fragment>
	)
}

export default Input;