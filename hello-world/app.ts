import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';

const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));

// Define the Employee interface
export interface Employee {
    id?: string; // Auto-generated ID
    name: string;
    position: string;
    level: 'junior' | 'mid' | 'senior';
}

export const createEmployee = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        if (!event.body) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    message: 'Missing request body',
                }),
            };
        }

        const data: Partial<Employee> = JSON.parse(event.body);

        // validation
        if (!data.name || !data.position || !['junior', 'mid', 'senior'].includes(data.level || '')) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'Invalid request data' }),
            };
        }

        const newEmployee: Employee = {
            id: uuidv4(), // Generate a random unique ID
            name: data.name,
            position: data.position,
            level: data.level as 'junior' | 'mid' | 'senior',
        };

        await client.send(
            new PutCommand({
                TableName: 'EmployeeTable',
                Item: newEmployee,
            }),
        );

        return {
            statusCode: 201,
            body: JSON.stringify(newEmployee),
        };
    } catch (err) {
        console.log(err);
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: 'some error happened',
            }),
        };
    }
};

export const getEmployees = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        const result = await client.send(
            new ScanCommand({
                TableName: 'EmployeeTable',
            }),
        );

        return {
            statusCode: 200,
            body: JSON.stringify(result.Items || []),
        };
    } catch (err) {
        console.log(err);
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: 'some error happened',
            }),
        };
    }
};

export const lambdaHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'hello world',
            }),
        };
    } catch (err) {
        console.log(err);
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: 'some error happened',
            }),
        };
    }
};
