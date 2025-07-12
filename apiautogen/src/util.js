const generateHeaderSamples = (parameters = []) => {
    const headers = {};

    parameters
        .filter(param => param.in === 'header')
        .forEach(param => {
            const { name, schema = {} } = param;
            const type = schema.type;
            const format = schema.format || '';

            if (type === 'string' && format === 'uuid') {
                headers[name] = '123e4567-e89b-12d3-a456-426614174000';
            } else if (type === 'string' && name.includes('date-time')) {
                headers[name] = new Date().toISOString();
            } else if (name === 'x-source-country') {
                headers[name] = 'SG';
            } else if (name === 'x-acc-jwt') {
                headers[name] = 'eyJhbGciOi...'; // placeholder JWT
            } else {
                headers[name] = 'sample-value';
            }
        });

    return headers;
};

const generateSampleFromSchema = (schema, components) => {
    if (!schema || typeof schema !== 'object') return null;

    // If it's a reference, resolve it
    if (schema.$ref) {
        const refPath = schema.$ref.replace('#/components/schemas/', '');
        return generateSampleFromSchema(components[refPath], components);
    }

    if (schema.type === 'object') {
        const obj = {};
        for (const [key, propSchema] of Object.entries(schema.properties || {})) {
            obj[key] = generateSampleFromSchema(propSchema, components);
        }
        return obj;
    }

    if (schema.type === 'array') {
        return [generateSampleFromSchema(schema.items, components)];
    }

    if (schema.enum) {
        return schema.enum[0]; // default to first enum value
    }

    // Fallback samples
    switch (schema.type) {
        case 'string':
            return schema.format === 'uuid'
                ? '123e4567-e89b-12d3-a456-426614174000'
                : 'sample-string';
        case 'number':
        case 'integer':
            return 123;
        case 'boolean':
            return true;
        default:
            return null;
    }
};

const generateResponseSamples = (responses, components) => {
    const categorized = {
        success: [],
        failure: [],
    };

    Object.entries(responses || {}).forEach(([statusCode, response]) => {
        const schema = response.content?.['application/json']?.schema;
        let sample = null;

        if (schema) {
            sample = generateSampleFromSchema(schema, components);
        }

        const responseData = {
            statusCode,
            description: response.description,
            sample,
        };

        if (statusCode.startsWith('2')) {
            categorized.success.push(responseData);
        } else {
            categorized.failure.push(responseData);
        }
    });

    return categorized;
};

export default { generateHeaderSamples, generateSampleFromSchema, generateResponseSamples }