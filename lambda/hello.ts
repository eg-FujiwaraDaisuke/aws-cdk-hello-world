export const handler = async () => {
    console.log('Hello World from Lambda!');
    return {
        statusCode: 200,
        body: JSON.stringify({
            message: 'Hello World from Lambda!',
        }),
    };
};
