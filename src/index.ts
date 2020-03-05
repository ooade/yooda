import typeOf from 'micro-typeof';

type Schema = {
	[key: string]: {
		type: string;
		required?: boolean;
		domain?: ((value: any) => boolean)[];
	};
};

type Value = {
	[key: string]: unknown;
};

const validator = (schema: Schema) => {
	const handler: ProxyHandler<Value> = {
		set(target, key: string, value) {
			const targetSchema = schema[key];

			// Can't trap without a schema
			if (!targetSchema) return true;

			const type = targetSchema.type;
			const domainArr = targetSchema.domain;

			if (typeOf(value) !== type) {
				throw new TypeError(`${key} must be a ${type}`);
			}

			if (domainArr) {
				domainArr.forEach(domain => {
					if (!domain(value)) {
						throw new Error(
							`${value} does not satisfy the domain ${domain.name}`
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
				throw new Error(`${key} is required`);
			}
		});

		Object.keys(data).forEach(key => {
			proxy[key] = data[key];
		});
	};
};

export default validator;
