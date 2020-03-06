import typeOf from 'micro-typeof';

export interface Schema {
	[key: string]: {
		type: string;
		required?: boolean;
		domain?: ((value: any) => boolean)[];
	};
}

interface Value {
	[key: string]: unknown;
}

type CustomErrorTypes = 'requiredError' | 'typeError' | 'domainError';

type CustomErrorProps = 'key' | 'type' | 'value' | 'domain';

export type CustomErrors = {
	[key in CustomErrorTypes]?: (
		props: { [key in CustomErrorProps]?: any }
	) => string;
};

const validator = (schema: Schema, customErrors?: CustomErrors) => {
	const handler: ProxyHandler<Value> = {
		set(target, key: string, value) {
			const targetSchema = schema[key];

			// Can't trap without a schema
			if (!targetSchema) return true;

			const type = targetSchema.type;
			const domainArr = targetSchema.domain;

			if (typeOf(value) !== type) {
				throw new TypeError(
					customErrors?.typeError
						? customErrors.typeError({
								key,
								type,
								value: JSON.stringify(value)
						  })
						: `${key} must be a ${type}`
				);
			}

			if (domainArr) {
				domainArr.forEach(domain => {
					if (!domain(value)) {
						throw new Error(
							customErrors?.domainError
								? customErrors.domainError({
										key,
										type,
										value: JSON.stringify(value),
										domain: domain.name
								  })
								: `${value} does not satisfy the domain ${domain.name}`
						);
					}
				});
			}

			return true;
		}
	};

	return (data: Value): void => {
		const proxy = new Proxy({}, handler);

		Object.keys(schema).forEach(key => {
			const required = schema[key].required;

			if (required && !data[key]) {
				throw new Error(
					customErrors?.requiredError
						? customErrors.requiredError({ key })
						: `${key} is required`
				);
			}
		});

		Object.keys(data).forEach(key => {
			proxy[key] = data[key];
		});
	};
};

export default validator;
